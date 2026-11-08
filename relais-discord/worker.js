/* Relais Discord : Cloudflare Worker (gratuit).
   Le site (GitHub Pages) ne peut pas garder de token de bot en sécurité. Ce relais les garde à sa place
   (secrets Cloudflare) et n'accepte que les requêtes portant une clé de Présidence.
   Variables à définir (Settings > Variables and Secrets) :
     BOT_TOKEN_CENSURE, BOT_TOKEN_JUSTICE, BOT_TOKEN_ETHIQUE   (secrets) tokens des 3 bots
     RELAIS_KEYS      (secret) une ou plusieurs clés séparées par des virgules, ex : "cle-presidence-juridique,cle-presidence-ethique"
     ALLOWED_ORIGIN   ex : https://headquarterastrea.github.io   (le site autorisé à appeler le relais)
     ALLOWED_GUILDS   (facultatif) identifiants des serveurs autorisés, séparés par des virgules (DJ et CE) */

const API = "https://discord.com/api/v10";
const BOTS = { censure: "BOT_TOKEN_CENSURE", justice: "BOT_TOKEN_JUSTICE", ethique: "BOT_TOKEN_ETHIQUE" };

function corsHeaders(env, req) {
  const origin = req.headers.get("Origin") || "";
  const ok = !env.ALLOWED_ORIGIN || origin === env.ALLOWED_ORIGIN;
  return { ok, h: {
    "Access-Control-Allow-Origin": ok && origin ? origin : (env.ALLOWED_ORIGIN || "*"),
    "Access-Control-Allow-Headers": "Content-Type, X-Relais-Key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400", "Vary": "Origin" } };
}
function json(obj, status, h) { return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ "Content-Type": "application/json" }, h) }); }
function same(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
function keyOk(env, req) {
  const k = req.headers.get("X-Relais-Key") || "";
  return k.length >= 12 && String(env.RELAIS_KEYS || "").split(",").map(s => s.trim()).filter(Boolean).some(x => same(x, k));
}
async function discord(token, method, path, body) {
  const r = await fetch(API + path, { method, headers: Object.assign({ "Authorization": "Bot " + token, "User-Agent": "DiscordBot (relais-poste-73, 1.0)" }, body ? { "Content-Type": "application/json" } : {}), body: body ? JSON.stringify(body) : undefined });
  if (r.status === 204) return { status: 204, data: null };
  let data = null; try { data = await r.json(); } catch (e) {}
  return { status: r.status, data };
}
function failFrom(res, h) {
  if (res.status === 429) return json({ error: "Limite Discord atteinte", retry_after: (res.data && res.data.retry_after) || 2 }, 429, h);
  const m = res.status === 403 ? "Le bot n'a pas la permission d'écrire dans ce salon." : res.status === 404 ? "Salon ou message introuvable pour ce bot." : res.status === 401 ? "Token du bot invalide (à vérifier côté relais)." : (res.data && res.data.message) || "Erreur Discord";
  return json({ error: m }, res.status >= 400 && res.status < 600 ? res.status : 502, h);
}
function guildAllowed(env, id) {
  const l = String(env.ALLOWED_GUILDS || "").split(",").map(s => s.trim()).filter(Boolean);
  return !l.length || l.includes(String(id));
}
function cleanEmbed(e) {
  if (!e || typeof e !== "object") return null;
  const o = {};
  if (e.title) o.title = String(e.title).slice(0, 256);
  if (e.description) o.description = String(e.description).slice(0, 4000);
  if (Number.isInteger(e.color) && e.color >= 0 && e.color <= 0xffffff) o.color = e.color;
  if (e.footer && e.footer.text) o.footer = { text: String(e.footer.text).slice(0, 200) };
  if (e.timestamp && !isNaN(Date.parse(e.timestamp))) o.timestamp = new Date(e.timestamp).toISOString();
  return Object.keys(o).length ? o : null;
}

export default {
  async fetch(req, env) {
    const c = corsHeaders(env, req);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: c.h });
    if (!c.ok) return json({ error: "Origine non autorisée" }, 403, c.h);
    if (!keyOk(env, req)) return json({ error: "Clé du relais refusée" }, 401, c.h);
    const url = new URL(req.url);
    try {
      if (req.method === "GET" && url.pathname === "/channels") {
        const bot = url.searchParams.get("bot") || "";
        if (!BOTS[bot] || !env[BOTS[bot]]) return json({ error: "Bot inconnu ou non configuré dans le relais" }, 400, c.h);
        const t = env[BOTS[bot]];
        const g = await discord(t, "GET", "/users/@me/guilds?limit=100");
        if (g.status !== 200) return failFrom(g, c.h);
        const guilds = g.data.filter(x => guildAllowed(env, x.id)).slice(0, 20);
        const out = await Promise.all(guilds.map(async x => {
          const r = await discord(t, "GET", "/guilds/" + x.id + "/channels");
          const chans = r.status === 200 ? r.data.filter(k => k.type === 0 || k.type === 5).sort((a, b) => a.position - b.position).map(k => ({ id: k.id, name: k.name })) : [];
          return { id: x.id, name: x.name, channels: chans };
        }));
        return json({ guilds: out }, 200, c.h);
      }
      if (req.method === "POST" && (url.pathname === "/send" || url.pathname === "/delete")) {
        if (Number(req.headers.get("Content-Length") || 0) > 20000) return json({ error: "Requête trop grande" }, 413, c.h);
        const b = await req.json();
        if (!b || !BOTS[b.bot] || !env[BOTS[b.bot]]) return json({ error: "Bot inconnu ou non configuré dans le relais" }, 400, c.h);
        if (!/^\d{5,25}$/.test(String(b.channel || ""))) return json({ error: "Salon invalide" }, 400, c.h);
        const t = env[BOTS[b.bot]];
        const ch = await discord(t, "GET", "/channels/" + b.channel);
        if (ch.status !== 200) return failFrom(ch, c.h);
        if (!guildAllowed(env, ch.data.guild_id)) return json({ error: "Ce serveur n'est pas autorisé par le relais" }, 403, c.h);
        if (url.pathname === "/send") {
          const content = typeof b.content === "string" ? b.content.slice(0, 2000) : "";
          const emb = Array.isArray(b.embeds) ? b.embeds.slice(0, 1).map(cleanEmbed).filter(Boolean) : [];
          if (!content.trim() && !emb.length) return json({ error: "Message vide" }, 400, c.h);
          const body = { allowed_mentions: { parse: b.mentions === true ? ["users", "roles"] : [] } };
          if (content.trim()) body.content = content;
          if (emb.length) body.embeds = emb;
          const r = await discord(t, "POST", "/channels/" + b.channel + "/messages", body);
          if (r.status !== 200 && r.status !== 201) return failFrom(r, c.h);
          return json({ id: r.data.id }, 200, c.h);
        }
        if (!/^\d{5,25}$/.test(String(b.id || ""))) return json({ error: "Message invalide" }, 400, c.h);
        const me = await discord(t, "GET", "/users/@me");
        const m = await discord(t, "GET", "/channels/" + b.channel + "/messages/" + b.id);
        if (m.status !== 200) return failFrom(m, c.h);
        if (!me.data || m.data.author.id !== me.data.id) return json({ error: "Ce bot ne peut supprimer que ses propres messages" }, 403, c.h);
        const r = await discord(t, "DELETE", "/channels/" + b.channel + "/messages/" + b.id);
        if (r.status !== 204) return failFrom(r, c.h);
        return json({ ok: true }, 200, c.h);
      }
      return json({ error: "Route inconnue" }, 404, c.h);
    } catch (e) {
      return json({ error: "Erreur du relais" }, 500, c.h);
    }
  }
};
