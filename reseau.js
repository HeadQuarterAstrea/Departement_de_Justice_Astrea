/* Couche réseau du poste : messages et suspensions de comptes.
   Serveur Supabase si config.js est rempli, sinon mode local (navigateur). Même interface dans les deux cas. */
(function () {
  "use strict";
  var B = window.PC_BACKEND || {}, remote = !!(B.url && B.key);
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function api(method, path, body, prefer) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 6000);
    var h = { apikey: B.key, Authorization: "Bearer " + B.key, "Content-Type": "application/json" };
    if (prefer) h.Prefer = prefer;
    return fetch(B.url.replace(/\/$/, "") + "/rest/v1/" + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined, signal: ctl.signal })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error("HTTP " + r.status); return r.status === 204 ? null : r.text().then(function (x) { return x ? JSON.parse(x) : null; }); },
            function (e) { clearTimeout(t); throw e; });
  }
  var N = { remote: remote, cache: {} };

  /* ----- suspensions : { matricule: raison } ----- */
  N.suspensions = function () {
    var p = remote ? api("GET", "suspensions?select=matricule,raison").then(function (rows) { var o = {}; (rows || []).forEach(function (r) { o[r.matricule] = r.raison || ""; }); return o; })
                   : Promise.resolve(jget("pcnet_susp", {}));
    return p.then(function (o) { N.cache = o; return o; }, function () { return N.cache; });
  };
  N.suspend = function (id, raison, par) {
    if (remote) return api("POST", "suspensions", { matricule: id, raison: raison || "", par: par || "" }, "resolution=merge-duplicates,return=minimal").then(function () { N.cache[id] = raison || ""; });
    var o = jget("pcnet_susp", {}); o[id] = raison || ""; jset("pcnet_susp", o); N.cache = o; return Promise.resolve();
  };
  N.unsuspend = function (id) {
    if (remote) return api("DELETE", "suspensions?matricule=eq." + encodeURIComponent(id), null, "return=minimal").then(function () { delete N.cache[id]; });
    var o = jget("pcnet_susp", {}); delete o[id]; jset("pcnet_susp", o); N.cache = o; return Promise.resolve();
  };

  /* ----- messages ----- */
  N.msgs = function (canal, after) {
    if (remote) {
      var q = "messages?canal=eq." + encodeURIComponent(canal) + "&select=*";
      if (after) return api("GET", q + "&id=gt." + after + "&order=id.asc&limit=200");
      return api("GET", q + "&order=id.desc&limit=100").then(function (r) { return (r || []).reverse(); });
    }
    var L = jget("pcnet_msgs", []).filter(function (m) { return m.canal === canal && m.id > (after || 0); });
    return Promise.resolve(after ? L : L.slice(-100));
  };
  N.send = function (m) {
    if (remote) return api("POST", "messages", m, "return=representation").then(function (r) { return r[0]; });
    var L = jget("pcnet_msgs", []), id = (L.length ? L[L.length - 1].id : 0) + 1;
    var x = Object.assign({ id: id, created_at: new Date().toISOString(), modifie: false }, m); L.push(x);
    if (L.length > 2000) L = L.slice(-2000); jset("pcnet_msgs", L); return Promise.resolve(x);
  };
  N.edit = function (id, texte) {
    if (remote) return api("PATCH", "messages?id=eq." + id, { texte: texte, modifie: true }, "return=minimal");
    var L = jget("pcnet_msgs", []); L.forEach(function (m) { if (m.id === id) { m.texte = texte; m.modifie = true; } }); jset("pcnet_msgs", L); return Promise.resolve();
  };
  N.remove = function (id) {
    if (remote) return api("DELETE", "messages?id=eq." + id, null, "return=minimal");
    jset("pcnet_msgs", jget("pcnet_msgs", []).filter(function (m) { return m.id !== id; })); return Promise.resolve();
  };
  /* tous les messages récents des salons demandés, pour compter les non lus : { canal: [ids] } */
  N.recent = function (canaux) {
    if (remote) {
      var list = canaux.map(encodeURIComponent).join(",");
      return api("GET", "messages?select=canal,id,auteur_id&canal=in.(" + list + ")&order=id.desc&limit=400");
    }
    return Promise.resolve(jget("pcnet_msgs", []).filter(function (m) { return canaux.indexOf(m.canal) >= 0; }).slice(-400));
  };
  window.PCNET = N;
})();
