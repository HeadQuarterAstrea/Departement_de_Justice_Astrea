/* Applications système du poste : NocturnisiNET, Documents, Bloc-notes, Corbeille, Calculatrice, Paramètres.
   Chaque application reçoit (conteneur, argument, ctx) ; ctx = { session, openApp, openSys, esc }. */
(function () {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function svg(body) { return "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' + body + "</svg>"); }
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- Icônes ---------- */
  var ICONS = {
    net: svg('<circle cx="32" cy="32" r="30" fill="#0b1230"/><circle cx="32" cy="32" r="30" fill="none" stroke="#6f6bd6" stroke-width="2"/><path d="M40 14a19 19 0 1 0 0 36 16 16 0 0 1 0-36z" fill="#e8d9a0"/><circle cx="46" cy="20" r="1.6" fill="#e8d9a0"/><circle cx="51" cy="31" r="1.2" fill="#e8d9a0"/><circle cx="44" cy="44" r="1.4" fill="#e8d9a0"/>'),
    docs: svg('<path d="M6 16h20l5 6h27v32a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="#d9a441"/><path d="M6 24h52v30a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="#f0c25f"/>'),
    notes: svg('<rect x="12" y="6" width="40" height="52" rx="3" fill="#f2efe3"/><rect x="12" y="6" width="40" height="9" fill="#c2352b"/><g stroke="#8a918d" stroke-width="2"><path d="M19 26h26M19 33h26M19 40h26M19 47h16"/></g>'),
    trash: svg('<path d="M18 20h28l-3 38H21z" fill="#8a949c"/><rect x="14" y="14" width="36" height="6" rx="2" fill="#aab3ba"/><rect x="26" y="8" width="12" height="6" rx="2" fill="#aab3ba"/><g stroke="#5b646b" stroke-width="2.5"><path d="M26 26v26M32 26v26M38 26v26"/></g>'),
    trashFull: svg('<path d="M18 20h28l-3 38H21z" fill="#8a949c"/><rect x="14" y="14" width="36" height="6" rx="2" fill="#aab3ba"/><rect x="26" y="8" width="12" height="6" rx="2" fill="#aab3ba"/><path d="M20 16l8-8 6 5 7-7 5 10z" fill="#f2efe3"/><g stroke="#5b646b" stroke-width="2.5"><path d="M26 26v26M32 26v26M38 26v26"/></g>'),
    calc: svg('<rect x="10" y="4" width="44" height="56" rx="4" fill="#2b3239"/><rect x="15" y="9" width="34" height="12" fill="#9fd1b5"/><g fill="#d9dde0"><rect x="15" y="27" width="9" height="8"/><rect x="27.500" y="27" width="9" height="8"/><rect x="40" y="27" width="9" height="8"/><rect x="15" y="39" width="9" height="8"/><rect x="27.500" y="39" width="9" height="8"/><rect x="40" y="39" width="9" height="8" fill="#c2352b"/><rect x="15" y="51" width="9" height="6"/><rect x="27.500" y="51" width="9" height="6"/><rect x="40" y="51" width="9" height="6"/></g>'),
    set: svg('<circle cx="32" cy="32" r="30" fill="#2b3239"/><g fill="none" stroke="#e9e6dd" stroke-width="5"><circle cx="32" cy="32" r="9"/><path d="M32 10v8M32 46v8M10 32h8M46 32h8M16.500 16.500l5.500 5.500M42 42l5.500 5.500M16.500 47.500l5.500-5.500M42 22l5.500-5.500"/></g>'),
    msg: svg('<circle cx="32" cy="32" r="30" fill="#4a2d97"/><path d="M14 18a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H29l-9 8v-8h-1a5 5 0 0 1-5-5z" fill="#f2eaff"/><g fill="#7c4ddb"><circle cx="24" cy="27" r="2.6"/><circle cx="32" cy="27" r="2.6"/><circle cx="40" cy="27" r="2.6"/></g>'),
    users: svg('<circle cx="32" cy="32" r="30" fill="#2b3239"/><g fill="#e9e6dd"><circle cx="25" cy="25" r="7"/><path d="M11 49a14 12 0 0 1 28 0z"/><circle cx="42" cy="27" r="6" opacity=".7"/><path d="M36 49a12 10 0 0 1 20 0z" opacity=".7"/></g>'),
    folder: svg('<path d="M4 14h20l5 6h31v34a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#f0c25f"/>'),
    file: svg('<path d="M14 4h26l12 12v44H14z" fill="#f2efe3"/><path d="M40 4v12h12z" fill="#c9c3ad"/><g stroke="#8a918d" stroke-width="2"><path d="M20 28h26M20 35h26M20 42h18"/></g>')
  };

  /* ---------- Style commun ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".sy{display:flex;flex-direction:column;flex:1;min-height:0;background:#0e1216;color:#e9e6dd;font-family:var(--f-mono)}",
    ".sy button,.sy input,.sy select,.sy textarea{font-family:var(--f-mono)}",
    ".tb{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;padding:.5rem .7rem;border-bottom:1px solid #252d34;background:#12181d}",
    ".tb button,.sbtn{background:#1b232a;border:1px solid #2c363f;color:#e9e6dd;padding:.35rem .7rem;font-size:.72rem;letter-spacing:.06em;cursor:pointer;text-transform:uppercase}",
    ".tb button:hover:not(:disabled),.sbtn:hover{background:#26313a}.tb button:disabled{opacity:.35;cursor:default}",
    ".path{padding:.45rem .8rem;font-size:.72rem;letter-spacing:.08em;color:#8a918d;border-bottom:1px solid #252d34;display:flex;gap:.3rem;flex-wrap:wrap}",
    ".path button{background:none;border:0;color:#e9e6dd;cursor:pointer;font-size:.72rem;letter-spacing:.08em;padding:0}.path button:hover{text-decoration:underline}",
    ".fl{flex:1;overflow:auto;padding:.4rem}",
    ".fr{display:grid;grid-template-columns:2rem 1fr 9rem;align-items:center;gap:.5rem;padding:.4rem .6rem;cursor:default;border:1px solid transparent;font-size:.82rem}",
    ".fr:hover{background:#ffffff0d}.fr.sel{background:#c2352b26;border-color:#c2352b66}",
    ".fr img{width:1.5rem;height:1.5rem}.fr .d{color:#8a918d;font-size:.7rem;text-align:right}",
    ".fr input{background:#0b0f13;border:1px solid #c2352b;color:#e9e6dd;padding:.2rem .4rem;width:100%}",
    ".emp{padding:2.5rem;text-align:center;color:#8a918d;font-size:.8rem}",
    ".np{display:flex;flex-direction:column;flex:1;min-height:0}.np textarea{flex:1;background:#0b0f13;border:0;padding:1rem;color:#e9e6dd;font-size:.9rem;line-height:1.6;resize:none;outline:none;min-height:0}",
    ".np .tb input{background:#0b0f13;border:1px solid #2c363f;color:#e9e6dd;padding:.35rem .6rem;min-width:12rem}.np .st{margin-left:auto;color:#8a918d;font-size:.7rem}",
    ".cal{width:min(20rem,100%);margin:1.2rem auto;padding:0 1rem}.cal .scr{background:#9fd1b5;color:#0e1b14;font-size:1.7rem;text-align:right;padding:.8rem 1rem;margin-bottom:.6rem;min-height:3.3rem;overflow:hidden}",
    ".cal .g{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem}.cal .g button{padding:.85rem 0;background:#1b232a;border:1px solid #2c363f;color:#e9e6dd;font-size:1.05rem;cursor:pointer}.cal .g button:hover{background:#26313a}.cal .g .op{background:#2a2f36}.cal .g .eq{background:#c2352b;border-color:#c2352b}",
    ".stg{padding:1.4rem;overflow:auto;flex:1}.stg h3{margin:1.4rem 0 .6rem;font-family:var(--f-disp);text-transform:uppercase;letter-spacing:.06em;font-size:1.3rem}.stg h3:first-child{margin-top:0}",
    ".walls{display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:.7rem}.wl{border:2px solid #2c363f;cursor:pointer;aspect-ratio:16/10;position:relative;background:none;padding:0}.wl.on{border-color:#c2352b}.wl span{position:absolute;left:.4rem;bottom:.3rem;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;text-shadow:0 1px 3px #000}",
    ".kv{display:grid;grid-template-columns:10rem 1fr;gap:.3rem 1rem;font-size:.82rem}.kv span:nth-child(odd){color:#8a918d}",
    /* NocturnisiNET */
    ".nx{flex:1;overflow:auto;background:radial-gradient(90% 60% at 50% 0,#1a2150 0,transparent 70%),#080c1c;color:#e4e6f5;font-family:var(--f-serif)}",
    ".nx .in{max-width:54rem;margin:0 auto;padding:1.6rem 1.2rem 3rem}",
    ".nx .logo{display:flex;align-items:center;justify-content:center;gap:.8rem;margin:1rem 0 1.4rem}.nx .logo img{width:3.4rem}",
    ".nx .logo b{font-family:var(--f-disp);font-weight:900;font-size:clamp(1.8rem,5vw,3rem);letter-spacing:.08em;color:#e8d9a0}.nx .logo b i{font-style:normal;color:#8b86ee}",
    ".nx .sb{display:flex;border:1px solid #3a4180;background:#0d1330;border-radius:2rem;padding:.3rem .4rem .3rem 1.1rem;gap:.5rem}.nx .sb:focus-within{border-color:#8b86ee;box-shadow:0 0 0 3px #8b86ee33}",
    ".nx .sb input{flex:1;background:none;border:0;outline:none;color:#e4e6f5;font-size:1.05rem;min-width:0;padding:.5rem 0;font-family:var(--f-serif)}",
    ".nx .sb button{background:#4a45b8;border:0;border-radius:2rem;color:#fff;padding:.4rem 1.2rem;cursor:pointer;font-family:var(--f-mono);font-size:.74rem;letter-spacing:.1em;text-transform:uppercase}",
    ".nx .cats{display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center;margin:1rem 0 1.4rem}",
    ".nx .cat{background:none;border:1px solid #3a4180;color:#b8bce6;padding:.25rem .8rem;border-radius:2rem;font-family:var(--f-mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}.nx .cat.on{background:#4a45b8;border-color:#4a45b8;color:#fff}",
    ".nx .res{display:grid;gap:.4rem}",
    ".nx .it{display:grid;grid-template-columns:2.4rem 1fr auto;gap:.9rem;align-items:center;padding:.8rem 1rem;border:1px solid #232a5c;background:#0b1128;text-decoration:none;color:inherit;cursor:pointer;text-align:left;width:100%;border-radius:.4rem}.nx .it:hover{border-color:#8b86ee;background:#10173a}",
    ".nx .bd{width:2.4rem;height:2.4rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:.7rem;font-weight:500;color:#fff;background:#4a45b8}",
    ".nx .it h4{margin:0;font-size:1.05rem;font-weight:600;color:#bfc4ff}.nx .it .u{font-family:var(--f-mono);font-size:.68rem;color:#6fb58a;word-break:break-all}.nx .it p{margin:.15rem 0 0;font-size:.88rem;color:#a4a9d4}",
    ".nx .it .tg{font-family:var(--f-mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#8b86ee;border:1px solid #3a4180;padding:.1rem .5rem;white-space:nowrap}",
    ".nx .x{background:none;border:0;color:#8a8fbd;cursor:pointer;font-size:.9rem}",
    ".nx h5{margin:1.4rem 0 .6rem;font-family:var(--f-mono);font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#8b86ee;font-weight:500}",
    ".nx .add{margin-top:2rem;border-top:1px solid #232a5c;padding-top:1rem}",
    ".nx form{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:.8rem;margin-top:.8rem}.nx form .full{grid-column:1/-1}",
    ".nx label{display:block;font-family:var(--f-mono);font-size:.64rem;letter-spacing:.12em;text-transform:uppercase;color:#8a8fbd;margin-bottom:.2rem}",
    ".nx form input,.nx form select,.nx form textarea{width:100%;background:#0b1128;border:1px solid #2c3470;color:#e4e6f5;padding:.5rem .6rem;font-family:var(--f-serif)}",
    ".nx textarea.out{font-family:var(--f-mono);font-size:.72rem;min-height:4.5rem;word-break:break-all}",
    "@media (max-width:720px){.fr{grid-template-columns:2rem 1fr}.fr .d{display:none}.nx .it{grid-template-columns:2.4rem 1fr}.nx .it .tg{display:none}.kv{grid-template-columns:1fr}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- Système de fichiers (par matricule, dans ce navigateur) ---------- */
  var FS = {
    key: null, d: null,
    load: function (id) {
      this.key = "pcfs:" + id;
      var d = jget(this.key, null);
      if (!d || !d.nodes) {
        d = { nodes: {}, seq: 0 };
        this.d = d;
        var docs = this.add("root", "Documents", "dir");
        this.add("root", "Notes", "dir");
        this.add(docs, "Bienvenue.txt", "file", "Poste de travail — Fondation S.C.P.F\nInstallation - 73\n\nCe poste regroupe les applications de votre département.\nVos documents sont enregistrés sur cet appareil.\nUn fichier supprimé va dans la Corbeille et peut être restauré.");
      }
      this.d = d;
    },
    save: function () { jset(this.key, this.d); document.dispatchEvent(new CustomEvent("fschange")); },
    get: function (id) { return this.d.nodes[id]; },
    kids: function (p) { var n = this.d.nodes; return Object.keys(n).map(function (k) { return n[k]; }).filter(function (x) { return x.parent === p && !x.trashed; }).sort(function (a, b) { return (a.type === b.type ? 0 : a.type === "dir" ? -1 : 1) || a.name.localeCompare(b.name, "fr"); }); },
    uniq: function (p, name, self) {
      var names = this.kids(p).filter(function (x) { return x.id !== self; }).map(function (x) { return x.name; }), base = name, i = 2;
      var m = name.match(/^(.*?)(\.[^.]+)?$/), stem = m[1], ext = m[2] || "";
      while (names.indexOf(name) >= 0) { name = stem + " (" + (i++) + ")" + ext; }
      return name;
    },
    add: function (p, name, type, content) {
      var id = "n" + (++this.d.seq);
      this.d.nodes[id] = { id: id, name: this.uniq(p, name), type: type, parent: p, content: content || "", ts: Date.now(), trashed: false };
      this.save(); return id;
    },
    rename: function (id, name) { name = (name || "").trim().replace(/[\/\\]/g, "-"); if (!name) return; var n = this.get(id); n.name = this.uniq(n.parent, name, id); n.ts = Date.now(); this.save(); },
    write: function (id, name, content) { var n = this.get(id); if (name && name !== n.name) n.name = this.uniq(n.parent, name, id); n.content = content; n.ts = Date.now(); this.save(); },
    trash: function (id) { var n = this.get(id); n.trashed = true; n.from = n.parent; n.tts = Date.now(); this.save(); },
    alive: function (id) { var n = this.d.nodes[id]; while (n) { if (n.trashed) return false; if (n.parent === "root") return true; n = this.d.nodes[n.parent]; } return false; },
    restore: function (id) { var n = this.get(id); n.trashed = false; if (n.parent !== "root" && !this.alive(n.parent)) n.parent = "root"; n.name = this.uniq(n.parent, n.name, id); this.save(); },
    purge: function (id) { var self = this; Object.keys(this.d.nodes).forEach(function (k) { if (self.d.nodes[k] && self.d.nodes[k].parent === id) self.purge(k); }); delete this.d.nodes[id]; },
    purgeSave: function (id) { this.purge(id); this.save(); },
    trashed: function () { var n = this.d.nodes; return Object.keys(n).map(function (k) { return n[k]; }).filter(function (x) { return x.trashed; }).sort(function (a, b) { return b.tts - a.tts; }); },
    empty: function () { var self = this; this.trashed().forEach(function (x) { self.purge(x.id); }); this.save(); },
    path: function (id) { var out = [], n = this.d.nodes[id]; while (n) { out.unshift(n); n = n.parent === "root" ? null : this.d.nodes[n.parent]; } return out; }
  };
  function fdate(ts) { var d = new Date(ts); return d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
  function listen(el, ev, fn) { document.addEventListener(ev, fn); var mo = new MutationObserver(function () { if (!document.body.contains(el)) { document.removeEventListener(ev, fn); mo.disconnect(); } }); mo.observe(document.body, { childList: true, subtree: true }); }

  var SYS = {};

  /* ===== Documents (explorateur) ===== */
  SYS.docs = { nom: "Documents", icone: ICONS.docs, open: function (pane, arg, ctx) {
    var cwd = "root", sel = null, ren = null;
    pane.innerHTML = '<div class="sy"><div class="tb"><button data-a="up">↑ Dossier parent</button><button data-a="nd">+ Dossier</button><button data-a="nf">+ Fichier texte</button><button data-a="rn">Renommer</button><button data-a="del">Supprimer</button></div><div class="path"></div><div class="fl"></div></div>';
    var fl = pane.querySelector(".fl"), pth = pane.querySelector(".path");
    function draw() {
      var items = FS.kids(cwd);
      if (sel && (!FS.get(sel) || FS.get(sel).trashed || FS.get(sel).parent !== cwd)) sel = null;
      pth.innerHTML = '<button data-p="root">Ce poste</button>' + FS.path(cwd === "root" ? null : cwd).map(function (n) { return ' / <button data-p="' + n.id + '">' + esc(n.name) + "</button>"; }).join("");
      pth.querySelectorAll("button").forEach(function (b) { b.onclick = function () { cwd = b.dataset.p; sel = null; draw(); }; });
      fl.innerHTML = items.length ? items.map(function (n) {
        return '<div class="fr' + (n.id === sel ? " sel" : "") + '" data-id="' + n.id + '"><img src="' + (n.type === "dir" ? ICONS.folder : ICONS.file) + '" alt="">' +
          (ren === n.id ? '<input value="' + esc(n.name) + '">' : "<span>" + esc(n.name) + "</span>") + '<span class="d">' + fdate(n.ts) + "</span></div>";
      }).join("") : '<div class="emp">Ce dossier est vide.</div>';
      pane.querySelector("[data-a=up]").disabled = cwd === "root";
      var has = !!sel; ["rn", "del"].forEach(function (a) { pane.querySelector("[data-a=" + a + "]").disabled = !has; });
      fl.querySelectorAll(".fr").forEach(function (r) {
        r.onclick = function () { sel = r.dataset.id; draw(); };
        r.ondblclick = function () { var n = FS.get(r.dataset.id); if (n.type === "dir") { cwd = n.id; sel = null; draw(); } else ctx.openSys("notes", n.id); };
      });
      var inp = fl.querySelector("input");
      if (inp) { inp.focus(); inp.select(); inp.onkeydown = function (e) { if (e.key === "Enter") { FS.rename(ren, inp.value); ren = null; } else if (e.key === "Escape") { ren = null; draw(); } }; inp.onblur = function () { if (ren) { FS.rename(ren, inp.value); ren = null; } }; }
    }
    pane.querySelector(".tb").onclick = function (e) {
      var a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (a === "up") { var n = FS.get(cwd); cwd = n ? n.parent : "root"; sel = null; draw(); }
      else if (a === "nd") { sel = FS.add(cwd, "Nouveau dossier", "dir"); ren = sel; }
      else if (a === "nf") { sel = FS.add(cwd, "Nouveau fichier.txt", "file", ""); ren = sel; }
      else if (a === "rn" && sel) { ren = sel; draw(); }
      else if (a === "del" && sel) { FS.trash(sel); sel = null; }
    };
    listen(pane, "fschange", draw); draw();
  } };

  /* ===== Bloc-notes ===== */
  SYS.notes = { nom: "Bloc-notes", icone: ICONS.notes, open: function (pane, arg, ctx) {
    var id = arg || null, n = id ? FS.get(id) : null;
    pane.innerHTML = '<div class="sy np"><div class="tb"><input class="nm" placeholder="Nom du fichier.txt"><button data-a="sv">Enregistrer</button><span class="st"></span></div><textarea spellcheck="false" placeholder="Écrivez ici…"></textarea></div>';
    var nm = pane.querySelector(".nm"), ta = pane.querySelector("textarea"), st = pane.querySelector(".st");
    if (n) { nm.value = n.name; ta.value = n.content; } else nm.value = "Sans titre.txt";
    function save() {
      var name = nm.value.trim() || "Sans titre.txt";
      if (id && FS.get(id) && !FS.get(id).trashed) FS.write(id, name, ta.value);
      else { var docs = FS.kids("root").filter(function (x) { return x.name === "Documents" && x.type === "dir"; })[0]; id = FS.add(docs ? docs.id : "root", name, "file", ta.value); }
      nm.value = FS.get(id).name; st.textContent = "Enregistré à " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    pane.querySelector("[data-a=sv]").onclick = save;
    ta.addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); } });
    ta.addEventListener("input", function () { st.textContent = "Modifié"; });
  } };

  /* ===== Corbeille ===== */
  SYS.trash = { nom: "Corbeille", icone: ICONS.trash, dyn: function () { return FS.d && FS.trashed().length ? ICONS.trashFull : ICONS.trash; }, open: function (pane) {
    pane.innerHTML = '<div class="sy"><div class="tb"><button data-a="rs">Restaurer</button><button data-a="pg">Supprimer définitivement</button><button data-a="em">Vider la corbeille</button><span class="st" style="margin-left:auto;color:#8a918d;font-size:.7rem"></span></div><div class="fl"></div></div>';
    var fl = pane.querySelector(".fl"), sel = null, arm = null;
    function draw() {
      var L = FS.trashed(); if (sel && !FS.get(sel)) sel = null;
      pane.querySelector(".st").textContent = L.length + " élément" + (L.length > 1 ? "s" : "");
      fl.innerHTML = L.length ? L.map(function (n) { return '<div class="fr' + (n.id === sel ? " sel" : "") + '" data-id="' + n.id + '"><img src="' + (n.type === "dir" ? ICONS.folder : ICONS.file) + '" alt=""><span>' + esc(n.name) + '</span><span class="d">' + fdate(n.tts || n.ts) + "</span></div>"; }).join("") : '<div class="emp">La corbeille est vide.</div>';
      pane.querySelector("[data-a=rs]").disabled = !sel; pane.querySelector("[data-a=pg]").disabled = !sel; pane.querySelector("[data-a=em]").disabled = !L.length;
      pane.querySelector("[data-a=pg]").textContent = arm === "pg" ? "Confirmer ?" : "Supprimer définitivement";
      pane.querySelector("[data-a=em]").textContent = arm === "em" ? "Confirmer ?" : "Vider la corbeille";
      fl.querySelectorAll(".fr").forEach(function (r) { r.onclick = function () { sel = r.dataset.id; arm = null; draw(); }; });
    }
    pane.querySelector(".tb").onclick = function (e) {
      var a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (a === "rs" && sel) { FS.restore(sel); sel = null; arm = null; }
      else if (a === "pg" && sel) { if (arm === "pg") { FS.purgeSave(sel); sel = null; arm = null; } else { arm = "pg"; draw(); } }
      else if (a === "em") { if (arm === "em") { FS.empty(); arm = null; } else { arm = "em"; draw(); } }
    };
    listen(pane, "fschange", draw); draw();
  } };

  /* ===== Calculatrice ===== */
  SYS.calc = { nom: "Calculatrice", icone: ICONS.calc, open: function (pane) {
    var keys = ["C", "(", ")", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ",", "⌫", "="];
    pane.innerHTML = '<div class="sy"><div class="cal"><div class="scr">0</div><div class="g">' + keys.map(function (k) { return '<button class="' + (k === "=" ? "eq" : /[÷×−+()]/.test(k) ? "op" : "") + '" data-k="' + k + '">' + k + "</button>"; }).join("") + "</div></div></div>";
    var scr = pane.querySelector(".scr"), exp = "";
    function show() { scr.textContent = exp || "0"; }
    function calc() {
      var s = exp.replace(/÷/g, "/").replace(/×/g, "*").replace(/−/g, "-").replace(/,/g, ".");
      if (!/^[0-9+\-*/().\s]+$/.test(s)) { exp = "Erreur"; return; }
      try { var v = Function('"use strict";return (' + s + ")")(); exp = isFinite(v) ? String(Math.round(v * 1e10) / 1e10).replace(".", ",") : "Erreur"; } catch (e) { exp = "Erreur"; }
    }
    pane.querySelector(".g").onclick = function (e) {
      var k = e.target.dataset && e.target.dataset.k; if (!k) return;
      if (exp === "Erreur") exp = "";
      if (k === "C") exp = ""; else if (k === "⌫") exp = exp.slice(0, -1); else if (k === "=") calc(); else exp += k;
      show();
    };
  } };

  /* ===== Paramètres ===== */
  var WALLS = { violet: ["Violet", "linear-gradient(180deg,#27094f 0%,#1c0a3a 50%,#120a1f 100%)"],
    nuit: ["Nuit", "radial-gradient(90% 70% at 15% 0,#1a2630 0,transparent 60%),radial-gradient(80% 70% at 100% 100%,#2a1518 0,transparent 55%),#0b0e11"],
    acier: ["Acier", "radial-gradient(90% 70% at 80% 0,#2c3a46 0,transparent 65%),#10161b"],
    justice: ["Justice", "radial-gradient(90% 70% at 20% 0,#3a1a1c 0,transparent 60%),#0e1114"],
    ethos: ["Éthique", "radial-gradient(90% 70% at 20% 0,#3b4630 0,transparent 60%),#232a1e"],
    nocturne: ["Nocturnis", "radial-gradient(90% 70% at 50% 0,#222a68 0,transparent 65%),#080c1c"],
    noir: ["Noir", "#050607"] };
  SYS.set = { nom: "Paramètres", icone: ICONS.set, open: function (pane, arg, ctx) {
    var S = ctx.session, key = "pcset:" + S.id, cur = jget(key, {}).fond || "nuit";
    pane.innerHTML = '<div class="sy"><div class="stg"><h3>Fond d\'écran</h3><div class="walls"></div><h3>Session</h3><div class="kv"><span>Nom</span><span>' + esc(S.nom) + "</span><span>Matricule</span><span>" + esc(S.id) + "</span><span>Grade</span><span>" + esc(S.gradeLabel || "—") + "</span><span>Niveau</span><span>" + esc(S.niveau || 1) + "</span><span>Accès</span><span>" + (S.apps.map(function (a) { return a === "justice" ? "ACCÈS JUSTICE" : a === "ethique" ? "ACCÈS ÉTHIQUE" : a; }).join(" · ") || "—") + '</span></div><h3>Stockage</h3><p style="font-size:.78rem;color:#8a918d;line-height:1.6">Documents, notes et réglages sont enregistrés sur cet appareil, dans ce navigateur. Ils ne sont pas partagés avec les autres comptes.</p></div></div>';
    var box = pane.querySelector(".walls");
    function draw() { box.innerHTML = Object.keys(WALLS).map(function (k) { return '<button class="wl' + (k === cur ? " on" : "") + '" data-k="' + k + '" style="background:' + WALLS[k][1] + '"><span>' + WALLS[k][0] + "</span></button>"; }).join(""); }
    box.onclick = function (e) { var b = e.target.closest(".wl"); if (!b) return; cur = b.dataset.k; var o = jget(key, {}); o.fond = cur; jset(key, o); ctx.applyWall(cur); draw(); };
    draw();
  } };

  /* ===== NocturnisiNET ===== */
  var CATS = ["Discord", "Google Docs", "Site", "Dossier", "Autre"];
  var BADGE = { "Discord": ["DC", "#5865f2"], "Google Docs": ["GD", "#1a73e8"], "Site": ["WW", "#2c7a58"], "Dossier": ["DS", "#a1701a"], "Autre": ["··", "#4a45b8"] };
  function safeUrl(u) { u = String(u || "").trim(); return /^https?:\/\/[^\s]+$/i.test(u) ? u : ""; }
  function host(u) { try { return new URL(u).host; } catch (e) { return u; } }
  SYS.net = { nom: "NocturnisiNET", icone: ICONS.net, open: function (pane, arg, ctx) {
    var S = ctx.session, lkey = "netlocal:" + S.id, cat = "Tous", q = "", showAdd = false, lastLine = "";
    function visible(l) { return !l.pour || !l.pour.length || l.pour.some(function (a) { return S.apps.indexOf(a) >= 0; }) || S.grade === "direction"; }
    function all() {
      var shared = (window.NET_LIENS || []).map(function (l) { return Object.assign({ src: "s" }, l); });
      var loc = jget(lkey, []).map(function (l, i) { return Object.assign({ src: "l", i: i }, l); });
      return shared.concat(loc).filter(function (l) { return safeUrl(l.u) && visible(l); });
    }
    function apps() { return S.apps.map(function (id) { var A = ctx.APPS[id]; return A ? { app: id, t: A.dept + " — " + A.hq, d: "Application du poste : " + A.nom, c: "Site", u: "", tags: A.nom + " " + A.hq + " departement" } : null; }).filter(Boolean); }
    function score(l, toks) {
      var hay = { t: norm(l.t), g: norm((l.tags || "") + " " + (l.c || "")), d: norm(l.d), u: norm(l.u) }, s = 0;
      for (var i = 0; i < toks.length; i++) {
        var k = toks[i], m = 0;
        if (hay.t.indexOf(k) >= 0) m += 5; if (hay.g.indexOf(k) >= 0) m += 3; if (hay.d.indexOf(k) >= 0) m += 2; if (hay.u.indexOf(k) >= 0) m += 1;
        if (!m) return 0; s += m;
      }
      return s;
    }
    function item(l) {
      var b = BADGE[l.c] || BADGE["Autre"];
      var inner = '<span class="bd" style="background:' + b[1] + '">' + b[0] + '</span><span><h4>' + esc(l.t) + '</h4>' + (l.app ? "" : '<div class="u">' + esc(host(l.u)) + "</div>") + (l.d ? "<p>" + esc(l.d) + "</p>" : "") + '</span><span class="tg">' + esc(l.c || "Autre") + (l.src === "l" ? " · perso" : "") + "</span>";
      if (l.app) return '<button class="it" data-app="' + l.app + '">' + inner + "</button>";
      return '<a class="it" href="' + esc(safeUrl(l.u)) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>";
    }
    function render() {
      var L = all(), toks = norm(q).split(/\s+/).filter(Boolean), res = "";
      var cats = ["Tous"].concat(CATS.filter(function (c) { return L.some(function (l) { return l.c === c; }); }));
      if (cats.indexOf(cat) < 0) cat = "Tous";
      var cb = '<div class="cats">' + cats.map(function (c) { return '<button class="cat' + (c === cat ? " on" : "") + '" data-c="' + c + '">' + c + "</button>"; }).join("") + "</div>";
      var pool = (cat === "Tous" ? apps().concat(L) : L.filter(function (l) { return l.c === cat; }));
      if (toks.length) {
        var R = pool.map(function (l) { return { l: l, s: score(l, toks) }; }).filter(function (x) { return x.s; }).sort(function (a, b) { return b.s - a.s; });
        var direct = /^https?:\/\//i.test(q.trim()) && safeUrl(q) ? '<h5>Adresse</h5><div class="res">' + item({ t: "Ouvrir " + q.trim(), u: q.trim(), c: "Site" }) + "</div>" : "";
        res = direct + '<h5>' + R.length + " résultat" + (R.length > 1 ? "s" : "") + '</h5><div class="res">' + (R.length ? R.map(function (x) { return item(x.l); }).join("") : '<div style="padding:1.4rem;color:#8a8fbd;text-align:center">Aucun résultat. Ajoutez le lien en bas de page.</div>') + "</div>";
      } else {
        var groups = {}; pool.forEach(function (l) { (groups[l.c || "Autre"] = groups[l.c || "Autre"] || []).push(l); });
        res = Object.keys(groups).length ? Object.keys(groups).map(function (g) { return "<h5>" + g + '</h5><div class="res">' + groups[g].map(item).join("") + "</div>"; }).join("") : '<div style="padding:1.4rem;color:#8a8fbd;text-align:center">Aucun lien pour le moment.</div>';
      }
      var mine = jget(lkey, []);
      var add = '<div class="add"><button class="sbtn" data-a="tg">' + (showAdd ? "Fermer" : "+ Ajouter un lien") + "</button>";
      if (showAdd) {
        add += '<form id="nf"><div><label>Titre</label><input name="t" required></div><div><label>Adresse (https://…)</label><input name="u" placeholder="https://discord.gg/…" required></div>' +
          '<div><label>Catégorie</label><select name="c">' + CATS.map(function (c) { return "<option>" + c + "</option>"; }).join("") + "</select></div>" +
          '<div><label>Mots-clés</label><input name="tags" placeholder="justice, mandats, annonces"></div>' +
          '<div class="full"><label>Description</label><input name="d"></div>' +
          '<div class="full"><label>Visible pour</label><span style="font-size:.85rem"><label style="display:inline;margin-right:1rem"><input type="checkbox" name="pj" style="width:auto"> ACCÈS JUSTICE</label><label style="display:inline"><input type="checkbox" name="pe" style="width:auto"> ACCÈS ÉTHIQUE</label> <span style="color:#8a8fbd">(rien coché = tout le monde)</span></span></div>' +
          '<div class="full"><button class="sbtn" type="submit">Ajouter à mes liens</button></div></form>';
        if (lastLine) add += '<h5>Pour le partager avec tout le monde</h5><p style="font-size:.85rem;color:#a4a9d4;margin-bottom:.5rem">Collez cette ligne dans <b>liens.js</b> sur GitHub, avant la dernière accolade.</p><textarea class="out" readonly>' + esc(lastLine) + "</textarea>";
      }
      if (mine.length) add += '<h5>Mes liens (ce navigateur)</h5><div class="res">' + mine.map(function (l, i) { return '<div class="it" style="cursor:default;grid-template-columns:1fr auto"><span><h4>' + esc(l.t) + '</h4><div class="u">' + esc(l.u) + '</div></span><button class="x" data-del="' + i + '" title="Retirer">✕ retirer</button></div>'; }).join("") + "</div>";
      add += "</div>";
      pane.querySelector(".body").innerHTML = cb + res + add;
      bindBody();
    }
    pane.innerHTML = '<div class="sy"><div class="nx"><div class="in"><div class="logo"><img src="' + ICONS.net + '" alt=""><b>NOCTURNIS<i>i</i>NET</b></div><form class="sb" id="sf"><input id="nq" placeholder="Rechercher un lien, un serveur Discord, un document…" autocomplete="off"><button type="submit">Chercher</button></form><div class="body"></div></div></div></div>';
    var inp = pane.querySelector("#nq");
    inp.oninput = function () { q = inp.value; render(); };
    pane.querySelector("#sf").onsubmit = function (e) { e.preventDefault(); q = inp.value; render(); };
    function bindBody() {
      var b = pane.querySelector(".body");
      b.querySelectorAll(".cat").forEach(function (x) { x.onclick = function () { cat = x.dataset.c; render(); }; });
      b.querySelectorAll("[data-app]").forEach(function (x) { x.onclick = function () { ctx.openApp(x.dataset.app); }; });
      var tg = b.querySelector("[data-a=tg]"); if (tg) tg.onclick = function () { showAdd = !showAdd; render(); };
      b.querySelectorAll("[data-del]").forEach(function (x) { x.onclick = function () { var m = jget(lkey, []); m.splice(+x.dataset.del, 1); jset(lkey, m); render(); }; });
      var f = b.querySelector("#nf");
      if (f) f.onsubmit = function (e) {
        e.preventDefault(); var d = new FormData(f), u = safeUrl(d.get("u"));
        if (!u) return;
        var pour = []; if (d.get("pj")) pour.push("justice"); if (d.get("pe")) pour.push("ethique");
        var l = { t: String(d.get("t")).trim(), u: u, c: d.get("c"), d: String(d.get("d") || "").trim(), tags: String(d.get("tags") || "").trim() };
        if (pour.length) l.pour = pour;
        var m = jget(lkey, []); m.push(l); jset(lkey, m);
        lastLine = "  " + JSON.stringify(l) + ","; render();
      };
    }
    render();
  } };

  /* ===== Messagerie ===== */
  function whileOpen(el, fn, ms) { var t = setInterval(function () { if (!document.body.contains(el)) { clearInterval(t); return; } fn(); }, ms); }
  function svcOf(g) { var x = window.GRADES && window.GRADES[g]; return x ? x.s : "direction"; }
  var SCOL = { justice: "#d6504a", ethique: "#d6a36f", direction: "#a78bfa" };
  function ini(n) { return String(n || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join(""); }
  function linkify(t) { return t.replace(/(https?:\/\/[^\s<]+)/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + "</a>"; }); }
  function dmId(a, b) { return "dm_" + [a, b].sort().join("_"); }
  var msgCss = document.createElement("style");
  msgCss.textContent = [
    ".ms{flex:1;display:grid;grid-template-columns:15.5rem 1fr;min-height:0;background:#1a1030;color:#e9e4f7;font-family:var(--f-serif)}",
    ".ms button,.ms input,.ms textarea{font-family:inherit;color:inherit}",
    ".ms .sd{background:#140b27;border-right:1px solid #2c1f4d;display:flex;flex-direction:column;min-height:0;min-width:0}",
    ".ms .sd h6{margin:1rem 1rem .4rem;font-family:var(--f-mono);font-size:.64rem;letter-spacing:.16em;text-transform:uppercase;color:#8d80b8;font-weight:500}",
    ".ms .lst{overflow-y:auto;min-height:0;flex:1}",
    ".ms .ch{display:flex;align-items:center;gap:.5rem;width:calc(100% - .8rem);margin:1px .4rem;padding:.4rem .6rem;background:none;border:0;border-radius:.3rem;cursor:pointer;text-align:left;color:#b4a8d6;font-size:.95rem}",
    ".ms .ch:hover{background:#ffffff0d;color:#fff}.ms .ch.on{background:#3b2a6e;color:#fff}",
    ".ms .ch .h{color:#7a6ca6;font-family:var(--f-mono)}.ms .ch .n{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".ms .ch .u{background:#e5484d;color:#fff;border-radius:1rem;font-family:var(--f-mono);font-size:.62rem;padding:.05rem .4rem}",
    ".ms .av{width:2.3rem;height:2.3rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:.74rem;font-weight:500;color:#1a1030;flex:none}",
    ".ms .ch .av{width:1.6rem;height:1.6rem;font-size:.6rem}",
    ".ms .sq{margin:.2rem .6rem;padding:.4rem .6rem;background:#0e0720;border:1px solid #2c1f4d;border-radius:.3rem;width:calc(100% - 1.2rem);font-size:.85rem}",
    ".ms .me{padding:.6rem .8rem;border-top:1px solid #2c1f4d;background:#0f081f;display:flex;gap:.6rem;align-items:center}.ms .me b{display:block;font-size:.88rem;line-height:1.1}.ms .me small{color:#8d80b8;font-family:var(--f-mono);font-size:.6rem;letter-spacing:.08em;text-transform:uppercase}",
    ".ms .mn{display:flex;flex-direction:column;min-height:0;min-width:0}",
    ".ms .hd{padding:.7rem 1.1rem;border-bottom:1px solid #2c1f4d;display:flex;align-items:baseline;gap:.8rem;flex-wrap:wrap}.ms .hd b{font-size:1.1rem}.ms .hd span{color:#8d80b8;font-size:.85rem}.ms .hd .md{margin-left:auto;font-family:var(--f-mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .5rem;border:1px solid #5b4b94;color:#b4a8d6}.ms .hd .md.ok{border-color:#3d8f67;color:#7fd1a5}.ms .hd .md.bad{border-color:#e5484d;color:#ff8a8f}",
    ".ms .log{flex:1;overflow-y:auto;padding:.8rem 0;min-height:0}",
    ".ms .day{display:flex;align-items:center;gap:.8rem;margin:1rem 1.1rem .4rem;color:#8d80b8;font-family:var(--f-mono);font-size:.64rem;letter-spacing:.12em;text-transform:uppercase}.ms .day::before,.ms .day::after{content:'';flex:1;height:1px;background:#2c1f4d}.ms .day::before{flex:0 0 0}",
    ".ms .m{display:grid;grid-template-columns:2.3rem 1fr;gap:.8rem;padding:.15rem 1.1rem;position:relative}.ms .m:hover{background:#ffffff08}",
    ".ms .m.cont{padding-top:0}.ms .m.cont .av{visibility:hidden;height:0}",
    ".ms .m .t{font-size:.7rem;color:#7a6ca6;font-family:var(--f-mono);margin-left:.5rem}.ms .m .gr{font-family:var(--f-mono);font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;color:#8d80b8;margin-left:.5rem}",
    ".ms .m .tx{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.45}.ms .m .tx a{color:#b69cff}.ms .m .tx em.act{color:#c9b8ff}.ms .m .ed{font-size:.62rem;color:#7a6ca6;font-family:var(--f-mono)}",
    ".ms .m .ac{position:absolute;right:1rem;top:-.2rem;display:none;gap:.2rem;background:#241845;border:1px solid #3b2a6e;border-radius:.3rem;padding:.1rem}.ms .m:hover .ac{display:flex}",
    ".ms .m .ac button{background:none;border:0;cursor:pointer;color:#c9b8ff;font-size:.7rem;padding:.2rem .45rem;font-family:var(--f-mono)}.ms .m .ac button:hover{background:#3b2a6e}",
    ".ms .m textarea.ee{width:100%;background:#0e0720;border:1px solid #6d54c4;padding:.4rem .6rem;border-radius:.3rem;min-height:3rem;resize:vertical}",
    ".ms .cmp{padding:.7rem 1.1rem 1rem;border-top:1px solid #2c1f4d}.ms .cmp .bx{display:flex;gap:.5rem;background:#241845;border:1px solid #3b2a6e;border-radius:.5rem;padding:.4rem}.ms .cmp .bx:focus-within{border-color:#8b5cf6}",
    ".ms .cmp textarea{flex:1;background:none;border:0;outline:none;resize:none;min-height:2.4rem;max-height:8rem;padding:.4rem .5rem;line-height:1.4}.ms .cmp button{background:#7c4ddb;border:0;border-radius:.4rem;padding:0 1rem;cursor:pointer;font-family:var(--f-mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:#fff}.ms .cmp button:hover{background:#9164f0}",
    ".ms .cmp .tip{font-family:var(--f-mono);font-size:.6rem;letter-spacing:.06em;color:#7a6ca6;margin-top:.3rem}.ms .ro{padding:1rem 1.1rem;color:#8d80b8;text-align:center;border-top:1px solid #2c1f4d;font-size:.9rem}",
    ".ms .none{padding:2rem;text-align:center;color:#8d80b8}",
    "@media (max-width:720px){.ms{grid-template-columns:1fr;grid-template-rows:auto 1fr}.ms .sd{border-right:0;border-bottom:1px solid #2c1f4d;max-height:9.5rem}.ms .me{display:none}.ms .sq{display:none}}"
  ].join("\n");
  document.head.appendChild(msgCss);

  SYS.msg = { nom: "Messagerie", icone: ICONS.msg, open: function (pane, arg, ctx) {
    var S = ctx.session, seenKey = "pcseen:" + S.id, seen = jget(seenKey, {}), cur = null, sig = "", unread = {}, lastSend = 0, editId = null, armDel = null;
    var chans = (window.PC_CANAUX || []).filter(function (c) { return S.grade === "direction" || !c.pour || !c.pour.length || c.pour.some(function (a) { return S.apps.indexOf(a) >= 0; }); });
    function canWrite(c) { return c.dm || c.ecrire === "*" || S.grade === "direction" || (c.ecrire || []).indexOf(S.grade) >= 0; }
    function people() {
      var C = window.PC_COMPTES || {}, sp = (window.PCNET && PCNET.cache) || {};
      return Object.keys(C).filter(function (k) { return k !== S.id && C[k].actif !== false && sp[k] === undefined; })
        .map(function (k) { var g = window.GRADES && GRADES[C[k].grade]; return { id: k, nom: C[k].nom, grade: g ? g.l : "", svc: g ? g.s : "direction" }; })
        .sort(function (a, b) { return a.nom.localeCompare(b.nom, "fr"); });
    }
    pane.innerHTML = '<div class="ms"><div class="sd"><h6>Salons</h6><div id="mc"></div><h6>Messages privés</h6><input class="sq" placeholder="Rechercher une personne…"><div class="lst" id="md"></div><div class="me"><span class="av" style="background:' + (SCOL[svcOf(S.grade)] || "#a78bfa") + '">' + esc(ini(S.nom)) + '</span><span><b>' + esc(S.nom) + '</b><small>' + esc(S.id) + '</small></span></div></div>' +
      '<div class="mn"><div class="hd"></div><div class="log"></div><div class="cmpw"></div></div></div>';
    var el = { mc: pane.querySelector("#mc"), md: pane.querySelector("#md"), sq: pane.querySelector(".sq"), hd: pane.querySelector(".hd"), log: pane.querySelector(".log"), cmp: pane.querySelector(".cmpw") };

    function badge(id) { return unread[id] ? '<span class="u">' + (unread[id] > 99 ? "99+" : unread[id]) + "</span>" : ""; }
    function drawSide() {
      el.mc.innerHTML = chans.map(function (c) { return '<button class="ch' + (cur && cur.id === c.id ? " on" : "") + '" data-c="' + c.id + '"><span class="h">#</span><span class="n">' + esc(c.nom) + "</span>" + badge(c.id) + "</button>"; }).join("");
      var q = norm(el.sq.value);
      el.md.innerHTML = people().filter(function (p) { return !q || norm(p.nom + " " + p.id).indexOf(q) >= 0; }).map(function (p) {
        var id = dmId(S.id, p.id);
        return '<button class="ch' + (cur && cur.id === id ? " on" : "") + '" data-d="' + p.id + '"><span class="av" style="background:' + (SCOL[p.svc] || "#a78bfa") + '">' + esc(ini(p.nom)) + '</span><span class="n">' + esc(p.nom) + "</span>" + badge(id) + "</button>";
      }).join("") || '<div class="none" style="padding:1rem;font-size:.8rem">Personne.</div>';
    }
    function drawHead() {
      if (!cur) { el.hd.innerHTML = ""; return; }
      el.hd.innerHTML = "<b>" + (cur.dm ? "@ " : "# ") + esc(cur.nom) + "</b><span>" + esc(cur.desc || "") + '</span><span class="md ' + (PCNET.remote ? (PCNET.err ? "bad" : "ok") : "") + '">' + (PCNET.remote ? (PCNET.err ? "Serveur injoignable" : "En ligne") : "Mode local") + "</span>";
    }
    function drawComposer() {
      if (!cur) { el.cmp.innerHTML = ""; return; }
      if (!canWrite(cur)) { el.cmp.innerHTML = '<div class="ro">Salon en lecture seule pour votre grade.</div>'; return; }
      el.cmp.innerHTML = '<div class="cmp"><div class="bx"><textarea maxlength="1500" placeholder="Écrire dans ' + (cur.dm ? "@" : "#") + esc(cur.nom) + '…"></textarea><button type="button">Envoyer</button></div><div class="tip">Entrée : envoyer · Maj+Entrée : nouvelle ligne · /me pour une action (ex : /me ouvre le dossier) · /roll 1d20 pour un jet de dés</div></div>';
      var ta = el.cmp.querySelector("textarea"), bt = el.cmp.querySelector("button");
      function go() {
        var t = ta.value.trim(); if (!t || Date.now() - lastSend < 600) return; lastSend = Date.now(); ta.value = "";
        var rm = /^\/(?:roll|dé|de)\s*(\d{0,2})d(\d{1,4})\b/i.exec(t);
        if (rm) { var n = Math.min(parseInt(rm[1] || "1", 10) || 1, 20), f = Math.max(parseInt(rm[2], 10) || 6, 2), r = [], sum = 0;
          for (var i = 0; i < n; i++) { var v = 1 + Math.floor(Math.random() * f); r.push(v); sum += v; }
          t = "/me lance " + n + "d" + f + " 🎲 : " + (n > 1 ? r.join(" + ") + " = " : "") + sum; }
        PCNET.send({ canal: cur.id, auteur_id: S.id, auteur: S.nom, grade: S.gradeLabel || "", service: svcOf(S.grade), texte: t }).then(function () { PCNET.err = false; refresh(true); }, function () { PCNET.err = true; ta.value = t; drawHead(); });
      }
      bt.onclick = go; ta.onkeydown = function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } };
      if (!matchMedia("(pointer:coarse)").matches) ta.focus();
    }
    function day(iso) { return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
    function hour(iso) { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
    function drawLog(list, stick) {
      if (!list.length) { el.log.innerHTML = '<div class="none">Aucun message. Lancez la discussion.</div>'; return; }
      var h = "", prev = null;
      list.forEach(function (m) {
        var d = day(m.created_at), same = prev && prev.auteur_id === m.auteur_id && day(prev.created_at) === d && (new Date(m.created_at) - new Date(prev.created_at)) < 300000;
        if (!prev || day(prev.created_at) !== d) h += '<div class="day">' + esc(d) + "</div>";
        var mine = m.auteur_id === S.id, mod = S.grade === "direction";
        var raw = String(m.texte), act = /^\/me\s/.test(raw), body = act ? '<em class="act">* ' + esc(m.auteur) + " " + linkify(esc(raw.slice(4).trim())) + "</em>" : linkify(esc(raw));
        if (editId === m.id) body = '<textarea class="ee" data-e="' + m.id + '">' + esc(raw) + '</textarea><div class="tip" style="font-family:var(--f-mono);font-size:.62rem;color:#8d80b8">Entrée : valider · Échap : annuler</div>';
        h += '<div class="m' + (same ? " cont" : "") + '" data-id="' + m.id + '"><span class="av" style="background:' + (SCOL[m.service] || "#a78bfa") + '">' + esc(ini(m.auteur)) + "</span><div>" +
          (same ? "" : '<div><b style="color:' + (SCOL[m.service] || "#c9b8ff") + '">' + esc(m.auteur) + '</b><span class="gr">' + esc(m.grade || "") + '</span><span class="t">' + hour(m.created_at) + "</span></div>") +
          '<div class="tx">' + body + (m.modifie ? ' <span class="ed">(modifié)</span>' : "") + "</div></div>" +
          ((mine || mod) && editId !== m.id ? '<div class="ac">' + (mine ? '<button data-ed="' + m.id + '">Modifier</button>' : "") + '<button data-dl="' + m.id + '">' + (armDel === m.id ? "Confirmer ?" : "Supprimer") + "</button></div>" : "") + "</div>";
        prev = m;
      });
      el.log.innerHTML = h;
      if (stick) el.log.scrollTop = el.log.scrollHeight;
      var ee = el.log.querySelector("textarea.ee");
      if (ee) { ee.focus(); ee.onkeydown = function (e) { if (e.key === "Escape") { editId = null; sig = ""; refresh(); } else if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); var v = ee.value.trim(); if (v) PCNET.edit(editId, v).then(function () { editId = null; refresh(true); }); } }; }
    }
    el.log.onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.ed) { editId = +b.dataset.ed; sig = ""; refresh(); }
      else if (b.dataset.dl) { var id = +b.dataset.dl; if (armDel === id) { armDel = null; PCNET.remove(id).then(function () { refresh(true); }); } else { armDel = id; sig = ""; refresh(); } }
    };
    function refresh(force) {
      if (!cur) return;
      var c = cur;
      PCNET.msgs(c.id, 0).then(function (list) {
        PCNET.err = false; if (c !== cur) return;
        var s = list.map(function (m) { return m.id + ":" + (m.texte || "").length + (m.modifie ? "e" : ""); }).join(",") + "|" + editId + "|" + armDel;
        if (force || s !== sig) {
          var atEnd = el.log.scrollHeight - el.log.scrollTop - el.log.clientHeight < 80;
          sig = s; drawLog(list, force || atEnd || !el.log.children.length);
        }
        if (list.length) { var last = list[list.length - 1].id; if ((seen[c.id] || 0) < last) { seen[c.id] = last; jset(seenKey, seen); unread[c.id] = 0; drawSide(); } }
        drawHead();
      }, function () { PCNET.err = true; drawHead(); });
    }
    function open(c) { cur = c; sig = ""; editId = null; armDel = null; el.log.innerHTML = ""; drawSide(); drawHead(); drawComposer(); refresh(true); }
    el.mc.onclick = function (e) { var b = e.target.closest("[data-c]"); if (b) open(chans.filter(function (c) { return c.id === b.dataset.c; })[0]); };
    el.md.onclick = function (e) { var b = e.target.closest("[data-d]"); if (!b) return; var p = people().filter(function (x) { return x.id === b.dataset.d; })[0]; if (p) open({ id: dmId(S.id, p.id), nom: p.nom, desc: p.grade, dm: true }); };
    el.sq.oninput = drawSide;
    function allIds() { return chans.map(function (c) { return c.id; }).concat(people().map(function (p) { return dmId(S.id, p.id); })); }
    function countUnread() {
      PCNET.recent(allIds()).then(function (rows) {
        var u = {}; (rows || []).forEach(function (r) { if (r.auteur_id !== S.id && r.id > (seen[r.canal] || 0) && !(cur && cur.id === r.canal)) u[r.canal] = (u[r.canal] || 0) + 1; });
        var s1 = JSON.stringify(u); if (s1 !== JSON.stringify(unread)) { unread = u; drawSide(); }
      }, function () {});
    }
    whileOpen(pane, refresh, 2500); whileOpen(pane, countUnread, 6000);
    drawSide();
    var first = chans.filter(function (c) { return c.id === "general"; })[0] || chans[0];
    if (first) open(first); else el.hd.innerHTML = "<b>Aucun salon</b>";
    countUnread();
  } };

  /* ===== Comptes : liste, suspension, création ===== */
  SYS.comptes = { nom: "Comptes", icone: ICONS.users, visible: function (S) { return ["direction", "presidence", "eth_pres"].indexOf(S.grade) >= 0; }, open: function (pane, arg, ctx) {
    var S = ctx.session, scope = S.grade === "direction" ? null : (S.grade === "presidence" ? "justice" : "ethique"), tab = "liste", ask = null, note = "", filt = "";
    var cs = document.createElement("style");
    function gl(g) { return window.GRADES && GRADES[g] ? GRADES[g].l : g; }
    function gs(g) { return window.GRADES && GRADES[g] ? GRADES[g].s : "direction"; }
    function accs() {
      var C = window.PC_COMPTES || {};
      return Object.keys(C).filter(function (k) { return !scope || gs(C[k].grade) === scope; }).sort();
    }
    pane.innerHTML = '<div class="sy"><div class="tb"><button data-t="liste">Comptes</button>' + (S.grade === "direction" ? '<button data-t="creer">Créer un compte</button>' : "") + '<input class="flt" placeholder="Rechercher…" style="background:#0b0f13;border:1px solid #2c363f;color:#e9e6dd;padding:.35rem .6rem;margin-left:auto"></div><div class="stg" id="cb"></div></div>';
    var cb = pane.querySelector("#cb"), flt = pane.querySelector(".flt");
    function banner() {
      return PCNET.remote ? '<p style="font-size:.74rem;color:#7fd1a5;margin-bottom:1rem">Serveur connecté : une suspension s\'applique immédiatement partout (au plus 20 secondes).</p>'
        : '<p style="font-size:.74rem;color:#e0a95f;margin-bottom:1rem;line-height:1.6">Mode local : une suspension n\'est effective que sur cet appareil. Pour qu\'elle soit partagée, remplissez config.js (serveur), ou utilisez « Ligne fichier » et collez-la dans comptes-pc.js sur GitHub.</p>';
    }
    function drawList() {
      var C = window.PC_COMPTES || {}, sp = PCNET.cache || {}, q = norm(filt);
      var rows = accs().filter(function (k) { return !q || norm(k + " " + C[k].nom + " " + gl(C[k].grade)).indexOf(q) >= 0; }).map(function (k) {
        var c = C[k], fileOff = c.actif === false, off = fileOff || sp[k] !== undefined, self = k === S.id;
        var st = fileOff ? '<span style="color:#ff8a8f">Suspendu (fichier)</span>' : off ? '<span style="color:#ff8a8f">Suspendu' + (sp[k] ? " — " + esc(sp[k]) : "") + "</span>" : '<span style="color:#7fd1a5">Actif</span>';
        var act = "";
        if (!self && !(c.grade === "direction" && S.grade !== "direction")) {
          if (ask === k) act = '<input class="rs" placeholder="Motif (facultatif)" style="background:#0b0f13;border:1px solid #c2352b;color:#e9e6dd;padding:.25rem .4rem;width:11rem"> <button class="sbtn" data-ok="' + k + '">Confirmer</button> <button class="sbtn" data-no="1">Annuler</button>';
          else if (fileOff) act = '<span style="color:#8a918d;font-size:.7rem">retirer "actif": false dans comptes-pc.js</span>';
          else if (off) act = '<button class="sbtn" data-re="' + k + '">Réactiver</button>';
          else act = '<button class="sbtn" data-su="' + k + '">Suspendre</button>';
          act += ' <button class="sbtn" data-ln="' + k + '" title="Ligne à coller dans comptes-pc.js pour une suspension définitive">Ligne fichier</button>';
        }
        return "<tr><td>" + esc(k) + "</td><td>" + esc(c.nom) + "</td><td>" + esc(gl(c.grade)) + "</td><td>" + (c.apps || []).map(function (a) { return a === "justice" ? "JUSTICE" : a === "ethique" ? "ÉTHIQUE" : a === "fim" ? "FIM" : a; }).join(" · ") + "</td><td>" + st + '</td><td style="white-space:nowrap">' + act + "</td></tr>";
      }).join("");
      cb.innerHTML = banner() + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.78rem"><thead><tr style="text-align:left;color:#8a918d;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase"><th style="padding:.4rem">Matricule</th><th>Nom</th><th>Grade</th><th>Accès</th><th>Statut</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="emp">Aucun compte.</td></tr>') + "</tbody></table></div>" + (note ? '<p style="margin-top:1rem;font-size:.74rem">' + note + "</p>" : "");
      cb.querySelectorAll("td,th").forEach(function (td) { td.style.padding = ".5rem .4rem"; td.style.borderBottom = "1px solid #252d34"; });
    }
    cb.onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var C = window.PC_COMPTES || {};
      if (b.dataset.su) { ask = b.dataset.su; drawList(); var i = cb.querySelector(".rs"); if (i) i.focus(); }
      else if (b.dataset.no) { ask = null; drawList(); }
      else if (b.dataset.ok) { var r = (cb.querySelector(".rs") || {}).value || "", id = b.dataset.ok; PCNET.suspend(id, r.trim(), S.id).then(function () { ask = null; note = "Compte " + esc(id) + " suspendu."; document.dispatchEvent(new CustomEvent("pcsusp")); drawList(); }, function () { note = "Serveur injoignable : suspension non enregistrée."; drawList(); }); }
      else if (b.dataset.re) { var id2 = b.dataset.re; PCNET.unsuspend(id2).then(function () { note = "Compte " + esc(id2) + " réactivé."; document.dispatchEvent(new CustomEvent("pcsusp")); drawList(); }, function () { note = "Serveur injoignable : réactivation non enregistrée."; drawList(); }); }
      else if (b.dataset.ln) { var k = b.dataset.ln, line = '  "' + k + '": ' + JSON.stringify(Object.assign({}, C[k], { actif: false })) + ","; note = 'Ligne à coller dans comptes-pc.js (remplace la ligne de ce compte) :<br><textarea readonly style="width:100%;margin-top:.5rem;background:#0b0f13;color:#e9e6dd;border:1px solid #252d34;font-size:.7rem;min-height:5rem;word-break:break-all">' + esc(line) + "</textarea>"; drawList(); }
    };
    flt.oninput = function () { filt = flt.value; if (tab === "liste") drawList(); };
    function drawCreate() {
      var opts = "";
      ["direction", "justice", "ethique", "fim"].filter(function (sv) { return sv !== "fim" || S.grade === "direction"; }).forEach(function (sv) { opts += '<optgroup label="' + GSERV[sv] + '">'; Object.keys(GRADES).filter(function (k) { return GRADES[k].s === sv; }).forEach(function (k) { opts += '<option value="' + k + '">' + esc(GRADES[k].l) + "</option>"; }); opts += "</optgroup>"; });
      cb.innerHTML = '<h3>Créer un compte</h3><p class="micro" style="margin-bottom:1rem;color:#8a918d">Le compte n\'existe qu\'une fois la ligne collée dans comptes-pc.js sur GitHub.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:.8rem;max-width:56rem"><div><label class="micro">Matricule</label><input id="gId" placeholder="ex : ETH-73-0004" style="width:100%;background:#0b0f13;border:1px solid #252d34;color:#e9e6dd;padding:.6rem"></div><div><label class="micro">Nom affiché</label><input id="gNom" placeholder="ex : Louis MARTIN" style="width:100%;background:#0b0f13;border:1px solid #252d34;color:#e9e6dd;padding:.6rem"></div><div><label class="micro">Grade</label><select id="gGr" style="width:100%;background:#0b0f13;border:1px solid #252d34;color:#e9e6dd;padding:.6rem">' + opts + '</select></div><div><label class="micro">Mot de passe</label><input id="gPw" style="width:100%;background:#0b0f13;border:1px solid #252d34;color:#e9e6dd;padding:.6rem" placeholder="8 caractères minimum"></div></div><div style="margin:.8rem 0"><label class="chk" style="display:inline-flex;gap:.4rem;margin-right:1.2rem"><input type="checkbox" id="aJ"> ACCÈS JUSTICE</label><label class="chk" style="display:inline-flex;gap:.4rem"><input type="checkbox" id="aE"> ACCÈS ÉTHIQUE</label>' + (S.grade === "direction" ? '<label class="chk" style="display:inline-flex;gap:.4rem;margin-left:1.2rem"><input type="checkbox" id="aF"> ACCÈS FIM</label>' : "") + '</div><button class="sbtn" id="gRand">Mot de passe aléatoire</button> <button class="sbtn" id="gGo" style="background:#c2352b;border-color:#c2352b">Générer la ligne</button><div id="gOut" style="margin-top:1rem"></div>';
      var gs2 = cb.querySelector("#gGr");
      function pre() { var sv = GRADES[gs2.value].s; cb.querySelector("#aJ").checked = (sv === "justice" || sv === "direction"); cb.querySelector("#aE").checked = (sv === "ethique" || sv === "direction"); var f = cb.querySelector("#aF"); if (f) f.checked = sv === "fim"; }
      gs2.onchange = pre; pre();
      cb.querySelector("#gRand").onclick = function () { var a = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789", s = ""; var r = crypto.getRandomValues(new Uint32Array(12)); for (var i = 0; i < 12; i++) s += a[r[i] % a.length]; cb.querySelector("#gPw").value = s; };
      cb.querySelector("#gGo").onclick = async function () {
        var id = cb.querySelector("#gId").value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, ""), nom = cb.querySelector("#gNom").value.trim(), pw = cb.querySelector("#gPw").value, ap = [];
        if (cb.querySelector("#aJ").checked) ap.push("justice"); if (cb.querySelector("#aE").checked) ap.push("ethique"); if (cb.querySelector("#aF") && cb.querySelector("#aF").checked) ap.push("fim");
        var out = cb.querySelector("#gOut");
        if (!id || !nom || pw.length < 8) { out.textContent = "Matricule, nom et mot de passe (8 caractères min.) requis."; return; }
        if ((window.PC_COMPTES || {})[id]) { out.textContent = "Ce matricule existe déjà."; return; }
        var salt = hex(crypto.getRandomValues(new Uint8Array(16)));
        var line = '  "' + id + '": ' + JSON.stringify({ nom: nom, grade: gs2.value, apps: ap, salt: salt, hash: await derive(pw, salt) }) + ",";
        out.innerHTML = '<p class="micro">Ligne à coller dans comptes-pc.js (avant la dernière accolade)</p><textarea readonly style="width:100%;background:#0b0f13;color:#e9e6dd;border:1px solid #252d34;font-size:.72rem;min-height:5rem;word-break:break-all">' + esc(line) + '</textarea><p style="margin-top:.6rem;font-size:.8rem">À remettre à l\'agent : <b>' + esc(id) + "</b> / <b>" + esc(pw) + "</b></p>";
      };
    }
    pane.querySelector(".tb").onclick = function (e) { var t = e.target.dataset && e.target.dataset.t; if (!t) return; tab = t; if (t === "liste") { flt.style.display = ""; PCNET.suspensions().then(drawList); drawList(); } else { flt.style.display = "none"; drawCreate(); } };
    PCNET.suspensions().then(function () { if (tab === "liste") drawList(); });
    drawList();
  } };


  /* ================= Nouvelles applications : Agenda, Annuaire, Terminal, Relais Discord ================= */
  ICONS.agenda = svg('<rect x="8" y="12" width="48" height="46" rx="4" fill="#f2efe3"/><rect x="8" y="12" width="48" height="12" rx="4" fill="#c2352b"/><g fill="#2b3239"><rect x="16" y="6" width="5" height="12" rx="2"/><rect x="43" y="6" width="5" height="12" rx="2"/></g><g fill="#8a918d"><rect x="15" y="31" width="8" height="6"/><rect x="28" y="31" width="8" height="6"/><rect x="41" y="31" width="8" height="6"/><rect x="15" y="42" width="8" height="6"/><rect x="28" y="42" width="8" height="6" fill="#c2352b"/><rect x="41" y="42" width="8" height="6"/></g>');
  ICONS.annuaire = svg('<rect x="12" y="6" width="42" height="52" rx="3" fill="#2d4a6b"/><rect x="8" y="12" width="6" height="8" fill="#e9e6dd"/><rect x="8" y="28" width="6" height="8" fill="#e9e6dd"/><rect x="8" y="44" width="6" height="8" fill="#e9e6dd"/><circle cx="34" cy="25" r="7" fill="#e9e6dd"/><path d="M21 46c1-9 7-12 13-12s12 3 13 12z" fill="#e9e6dd"/>');
  ICONS.terminal = svg('<rect x="5" y="9" width="54" height="46" rx="4" fill="#0b0f13" stroke="#3a454e" stroke-width="2"/><path d="M14 24l10 8-10 8" fill="none" stroke="#7fd1a5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M29 42h16" stroke="#7fd1a5" stroke-width="4" stroke-linecap="round"/>');
  ICONS.relais = svg('<circle cx="32" cy="32" r="30" fill="#2b2f6b"/><rect x="16" y="22" width="32" height="24" rx="6" fill="#e6e8ff"/><circle cx="26" cy="34" r="4" fill="#2b2f6b"/><circle cx="38" cy="34" r="4" fill="#2b2f6b"/><path d="M32 22v-7" stroke="#e6e8ff" stroke-width="3"/><circle cx="32" cy="13" r="3.500" fill="#c2352b"/><path d="M12 32h4M48 32h4" stroke="#e6e8ff" stroke-width="3" stroke-linecap="round"/>');

  var ncss = document.createElement("style");
  ncss.textContent = [
    ".ag{display:grid;grid-template-columns:1fr 18rem;flex:1;min-height:0}.ag .cal2{padding:1rem 1.2rem;overflow:auto}.ag .side{border-left:1px solid #252d34;padding:1rem;overflow:auto;background:#10151a}",
    ".ag .hd{display:flex;align-items:center;gap:.6rem;margin-bottom:.8rem}.ag .hd b{flex:1;font-family:var(--f-disp);font-size:1.5rem;letter-spacing:.05em;text-transform:uppercase}",
    ".ag .gr7{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}.ag .wd{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:#8a918d;text-align:center;padding:.3rem 0}",
    ".ag .dy{min-height:3.6rem;background:#141a20;border:1px solid #252d34;padding:.3rem .4rem;cursor:pointer;font-size:.8rem;position:relative;text-align:left;color:inherit}.ag .dy:hover{border-color:#5a6670}.ag .dy.o{opacity:.35}.ag .dy.t{border-color:#c2352b}.ag .dy.s{background:#c2352b26;border-color:#c2352b}",
    ".ag .dy i{position:absolute;right:.4rem;bottom:.35rem;width:.45rem;height:.45rem;border-radius:50%;background:#7fd1a5}",
    ".ag .ev{display:flex;gap:.5rem;align-items:baseline;padding:.4rem 0;border-bottom:1px solid #252d34;font-size:.8rem}.ag .ev b{color:#c2352b;font-weight:500}.ag .ev button{margin-left:auto;background:none;border:0;color:#8a918d;cursor:pointer}",
    ".ag .side input{width:100%;background:#0b0f13;border:1px solid #2c363f;color:#e9e6dd;padding:.4rem .5rem;margin:.3rem 0}",
    "@media (max-width:720px){.ag{grid-template-columns:1fr}.ag .side{border-left:0;border-top:1px solid #252d34}}",
    ".an{flex:1;display:flex;flex-direction:column;min-height:0}.an .tbl{flex:1;overflow:auto;padding:.6rem 1rem}.an table{width:100%;border-collapse:collapse;font-size:.8rem}.an th{text-align:left;color:#8a918d;font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;padding:.4rem}.an td{padding:.5rem .4rem;border-top:1px solid #252d34}",
    ".an .dot{display:inline-block;width:.55rem;height:.55rem;border-radius:50%;margin-right:.4rem;background:#7fd1a5}.an .dot.off{background:#ff6b6b}",
    ".an .fb{display:flex;gap:.4rem;flex-wrap:wrap;padding:.6rem 1rem;border-bottom:1px solid #252d34;align-items:center}.an .fb input{background:#0b0f13;border:1px solid #2c363f;color:#e9e6dd;padding:.35rem .6rem;min-width:14rem}",
    ".an .chp{background:none;border:1px solid #2c363f;color:#b9c0c7;padding:.25rem .7rem;cursor:pointer;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase}.an .chp.on{background:#c2352b;border-color:#c2352b;color:#fff}",
    ".tm{flex:1;background:#070a0c;color:#7fd1a5;font-family:var(--f-mono);font-size:.82rem;line-height:1.55;padding:.8rem 1rem;overflow:auto;min-height:0}.tm .ln{white-space:pre-wrap;overflow-wrap:anywhere}.tm .er{color:#ff8a8f}.tm .dm{color:#6c7a73}.tm .in{display:flex;gap:.6rem}.tm .in span{white-space:nowrap}.tm input{flex:1;background:none;border:0;outline:none;color:#e9e6dd;font-family:var(--f-mono);font-size:.82rem;min-width:0}",
    ".rl{display:flex;flex-direction:column;flex:1;min-height:0}.rl .tabs{display:flex;gap:.2rem;padding:.5rem .8rem 0;border-bottom:1px solid #252d34;background:#12181d}.rl .tabs button{background:none;border:0;border-bottom:2px solid transparent;color:#8a918d;padding:.5rem 1rem;cursor:pointer;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase}.rl .tabs button.on{color:#e9e6dd;border-bottom-color:#7b83ff}",
    ".rl .bd{flex:1;overflow:auto;padding:1.1rem 1.3rem}.rl h4{margin:1.2rem 0 .5rem;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:#8a918d;font-weight:500}.rl h4:first-child{margin-top:0}",
    ".rl .pers{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.7rem}.rl .pc{display:flex;gap:.8rem;align-items:center;text-align:left;background:#141a20;border:2px solid #252d34;color:inherit;padding:.7rem;cursor:pointer}.rl .pc:hover{border-color:#4a54a8}.rl .pc.on{border-color:#7b83ff;background:#1a2040}.rl .pc img{width:2.8rem;height:2.8rem;border-radius:50%;object-fit:cover;flex:none}.rl .pc b{display:block;font-size:.9rem}.rl .pc span{font-size:.68rem;color:#8a918d;line-height:1.35;display:block}",
    ".rl .row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:.8rem}.rl label{display:block;font-size:.64rem;letter-spacing:.12em;text-transform:uppercase;color:#8a918d;margin-bottom:.25rem}",
    ".rl input[type=text],.rl input[type=url],.rl select,.rl textarea{width:100%;background:#0b0f13;border:1px solid #2c363f;color:#e9e6dd;padding:.5rem .6rem;font-family:var(--f-mono);font-size:.82rem}.rl textarea{min-height:7rem;resize:vertical;line-height:1.5}",
    ".rl .btn2{background:#4a54d8;border:0;color:#fff;padding:.6rem 1.3rem;cursor:pointer;font-size:.74rem;letter-spacing:.1em;text-transform:uppercase}.rl .btn2:hover{background:#5d67ee}.rl .btn2.arm{background:#c2352b}.rl .btn3{background:#1b232a;border:1px solid #2c363f;color:#e9e6dd;padding:.35rem .7rem;cursor:pointer;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase}.rl .btn3:hover{background:#26313a}",
    ".rl .msgn{margin-top:.8rem;font-size:.78rem;line-height:1.5}.rl .ok{color:#7fd1a5}.rl .ko{color:#ff8a8f}.rl .warn{background:#3a2a10;color:#f0d9a0;padding:.7rem .9rem;font-size:.74rem;line-height:1.6;margin-bottom:1rem}",
    ".rl .pv{background:#313338;color:#dbdee1;padding:1rem;font-family:var(--f-serif);border-radius:4px}.rl .pv .mm{display:flex;gap:.8rem}.rl .pv img{width:2.5rem;height:2.5rem;border-radius:50%;object-fit:cover}.rl .pv .nm{font-weight:600;color:#fff}.rl .pv .tg{background:#5865f2;color:#fff;font-size:.6rem;padding:.05rem .3rem;border-radius:3px;margin-left:.4rem;vertical-align:1px}.rl .pv .tm2{color:#949ba4;font-size:.7rem;margin-left:.5rem}",
    ".rl .pv .tx{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.45;margin-top:.15rem}.rl .pv .em{margin-top:.4rem;border-left:4px solid #888;background:#2b2d31;padding:.6rem .8rem;border-radius:0 4px 4px 0;max-width:34rem}.rl .pv .em b{display:block;color:#fff;margin-bottom:.2rem}.rl .pv .em small{display:block;color:#949ba4;margin-top:.5rem;font-size:.7rem}",
    ".rl .sl{display:flex;gap:.6rem;align-items:center;padding:.55rem .7rem;border:1px solid #252d34;background:#141a20;margin-bottom:.4rem;font-size:.8rem}.rl .sl code{font-family:var(--f-mono);color:#8a918d;font-size:.7rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".rl .hs{padding:.6rem .8rem;border-bottom:1px solid #252d34;font-size:.8rem;line-height:1.5}.rl .hs small{color:#8a918d}"
  ].join("\n");
  document.head.appendChild(ncss);

  function pad2(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }

  /* ----- Agenda ----- */
  SYS.agenda = { nom: "Agenda", icone: ICONS.agenda, open: function (pane, arg, ctx) {
    var key = "pcag:" + ctx.session.id, now = new Date(), y = now.getFullYear(), m = now.getMonth(), sel = ymd(now);
    var MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    function draw() {
      var ev = jget(key, []), first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), today = ymd(new Date());
      var cells = "";
      for (var i = 0; i < off; i++) { var pd = new Date(y, m, 1 - (off - i)); cells += '<button class="dy o" data-d="' + ymd(pd) + '">' + pd.getDate() + "</button>"; }
      for (var d = 1; d <= days; d++) { var k = y + "-" + pad2(m + 1) + "-" + pad2(d), has = ev.some(function (e) { return e.d === k; }); cells += '<button class="dy' + (k === today ? " t" : "") + (k === sel ? " s" : "") + '" data-d="' + k + '">' + d + (has ? "<i></i>" : "") + "</button>"; }
      var rest = (7 - ((off + days) % 7)) % 7; for (var j = 1; j <= rest; j++) { var nd = new Date(y, m + 1, j); cells += '<button class="dy o" data-d="' + ymd(nd) + '">' + nd.getDate() + "</button>"; }
      var list = ev.filter(function (e) { return e.d === sel; }).sort(function (a, b) { return (a.h || "").localeCompare(b.h || ""); });
      var sd = new Date(sel + "T12:00:00");
      pane.innerHTML = '<div class="sy"><div class="ag"><div class="cal2"><div class="hd"><button class="sbtn" data-a="pv">‹</button><b>' + MONTHS[m] + " " + y + '</b><button class="sbtn" data-a="td">Aujourd\'hui</button><button class="sbtn" data-a="nx">›</button></div><div class="gr7">' +
        ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(function (w) { return '<div class="wd">' + w + "</div>"; }).join("") + cells + '</div></div><div class="side"><h3 style="margin:0 0 .6rem;font-family:var(--f-disp);text-transform:uppercase;letter-spacing:.05em">' + sd.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + "</h3>" +
        (list.length ? list.map(function (e) { return '<div class="ev"><b>' + esc(e.h || "—") + "</b><span>" + esc(e.t) + '</span><button data-del="' + e.id + '" title="Supprimer">✕</button></div>'; }).join("") : '<p style="color:#8a918d;font-size:.8rem">Rien de prévu.</p>') +
        '<h4 style="margin:1rem 0 .2rem;font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;color:#8a918d;font-weight:500">Ajouter</h4><input type="time" id="agh"><input id="agt" placeholder="Intitulé (audience, patrouille…)" maxlength="120"><button class="sbtn" data-a="add" style="margin-top:.3rem">Ajouter</button></div></div></div>';
      pane.querySelectorAll(".dy").forEach(function (b) { b.onclick = function () { sel = b.dataset.d; var dd = new Date(sel + "T12:00:00"); y = dd.getFullYear(); m = dd.getMonth(); draw(); }; });
      pane.querySelector("[data-a=pv]").onclick = function () { m--; if (m < 0) { m = 11; y--; } draw(); };
      pane.querySelector("[data-a=nx]").onclick = function () { m++; if (m > 11) { m = 0; y++; } draw(); };
      pane.querySelector("[data-a=td]").onclick = function () { var n = new Date(); y = n.getFullYear(); m = n.getMonth(); sel = ymd(n); draw(); };
      pane.querySelector("[data-a=add]").onclick = function () { var t = pane.querySelector("#agt").value.trim(); if (!t) return; var all = jget(key, []); all.push({ id: "e" + Date.now(), d: sel, h: pane.querySelector("#agh").value, t: t }); jset(key, all); draw(); };
      pane.querySelectorAll("[data-del]").forEach(function (b) { b.onclick = function () { jset(key, jget(key, []).filter(function (e) { return e.id !== b.dataset.del; })); draw(); }; });
    }
    draw();
  } };

  /* ----- Annuaire ----- */
  SYS.annuaire = { nom: "Annuaire", icone: ICONS.annuaire, open: function (pane, arg, ctx) {
    var G = window.GRADES || {}, flt = "", svc = "*", SV = { direction: "Direction", justice: "Justice", ethique: "Éthique" };
    pane.innerHTML = '<div class="sy"><div class="an"><div class="fb"><input placeholder="Rechercher un nom, un matricule, un grade…"><span class="chs"></span></div><div class="tbl"></div></div></div>';
    var tbl = pane.querySelector(".tbl"), chs = pane.querySelector(".chs"), inp = pane.querySelector("input");
    function draw() {
      var C = window.PC_COMPTES || {}, sp = (window.PCNET && PCNET.cache) || {}, q = norm(flt);
      chs.innerHTML = ["*", "direction", "justice", "ethique"].map(function (k) { return '<button class="chp' + (k === svc ? " on" : "") + '" data-s="' + k + '">' + (k === "*" ? "Tous" : SV[k]) + "</button>"; }).join(" ");
      chs.querySelectorAll("button").forEach(function (b) { b.onclick = function () { svc = b.dataset.s; draw(); }; });
      var rows = Object.keys(C).filter(function (k) { var g = G[C[k].grade] || {}; return (svc === "*" || g.s === svc) && (!q || norm(k + " " + C[k].nom + " " + (g.l || "")).indexOf(q) >= 0); }).sort().map(function (k) {
        var c = C[k], g = G[c.grade] || {}, off = c.actif === false || sp[k] !== undefined;
        return "<tr><td>" + esc(k) + "</td><td>" + esc(c.nom) + "</td><td>" + esc(g.l || "—") + "</td><td>" + esc(SV[g.s] || "—") + '</td><td><span class="dot' + (off ? " off" : "") + '"></span>' + (off ? "Suspendu" : "Actif") + "</td></tr>";
      }).join("");
      tbl.innerHTML = '<table><thead><tr><th>Matricule</th><th>Nom</th><th>Grade</th><th>Service</th><th>Statut</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" style="color:#8a918d;padding:1.4rem">Aucun résultat.</td></tr>') + "</tbody></table>";
    }
    inp.oninput = function () { flt = inp.value; draw(); };
    draw(); if (window.PCNET) PCNET.suspensions().then(draw);
  } };

  /* ----- Terminal ----- */
  SYS.terminal = { nom: "Terminal", icone: ICONS.terminal, open: function (pane, arg, ctx) {
    var S = ctx.session, hist = [], hi = 0;
    pane.innerHTML = '<div class="sy"><div class="tm"><div class="out"></div><div class="in"><span>' + esc(S.id.toLowerCase()) + '@installation-73 $</span><input autocomplete="off" spellcheck="false"></div></div></div>';
    var box = pane.querySelector(".tm"), out = pane.querySelector(".out"), inp = pane.querySelector("input");
    function print(t, cls) { var d = document.createElement("div"); d.className = "ln" + (cls ? " " + cls : ""); d.textContent = t; out.appendChild(d); box.scrollTop = box.scrollHeight; }
    print("Fondation S.C.P.F — Terminal de l'Installation - 73", "dm"); print('Tapez "help" pour la liste des commandes.', "dm");
    var SYSIDS = ["msg", "net", "docs", "notes", "trash", "calc", "agenda", "annuaire", "terminal", "set"];
    var ALIAS = { messagerie: "msg", nocturnisinet: "net", documents: "docs", "bloc-notes": "notes", corbeille: "trash", calculatrice: "calc", parametres: "set", paramètres: "set", justice: "app:justice", ethique: "app:ethique", éthique: "app:ethique" };
    var CMD = {
      help: function () { print("help · whoami · date · hostname · grade · apps · open <application> · ls · cat <fichier> · echo <texte> · ping <astrea|ethos> · clear"); },
      whoami: function () { print(S.nom + " (" + S.id + ")"); },
      grade: function () { print((S.gradeLabel || "—") + " · niveau " + (S.niveau || 1)); },
      hostname: function () { print("installation-73.scpf.local"); },
      date: function () { print(new Date().toLocaleString("fr-FR")); },
      clear: function () { out.innerHTML = ""; },
      echo: function (a) { print(a.join(" ")); },
      apps: function () { var l = S.apps.map(function (a) { return a; }).concat(SYSIDS.filter(function (i) { return SYS[i]; })); print(l.join("  ")); },
      ls: function () { var f = window.SYS_FS; if (!f || !f.d) return print("Système de fichiers indisponible.", "er"); print(f.kids("root").map(function (n) { return n.name + (n.type === "dir" ? "/" : ""); }).join("  ") || "(vide)"); },
      cat: function (a) { var f = window.SYS_FS, name = a.join(" ").toLowerCase(); if (!name) return print("Usage : cat <fichier>", "er"); var n = Object.keys(f.d.nodes).map(function (k) { return f.d.nodes[k]; }).filter(function (x) { return x.type === "file" && !x.trashed && x.name.toLowerCase() === name; })[0]; print(n ? n.content : "Fichier introuvable.", n ? "" : "er"); },
      ping: function (a) { var t = (a[0] || "").toLowerCase(); if (t === "astrea" || t === "ethos") print("Réponse de " + t + " : liaison établie, 12 ms"); else print("Hôte inconnu.", "er"); },
      open: function (a) {
        var n = (a.join(" ") || "").toLowerCase(), id = ALIAS[n] || n;
        if (id.indexOf("app:") === 0) { var ap = id.slice(4); if (S.apps.indexOf(ap) < 0) return print("Accès refusé : " + ap + ".", "er"); ctx.openApp(ap); return print("Ouverture de " + ap + "…"); }
        if (SYSIDS.indexOf(id) >= 0) { ctx.openSys(id); return print("Ouverture de " + id + "…"); }
        print('Application inconnue. Essayez "apps".', "er");
      },
      sudo: function () { print("Cette tentative a été consignée.", "er"); }
    };
    inp.onkeydown = function (e) {
      if (e.key === "Enter") {
        var line = inp.value.trim(); inp.value = ""; if (!line) return;
        hist.push(line); hi = hist.length; print(S.id.toLowerCase() + "@installation-73 $ " + line, "dm");
        var p = line.split(/\s+/), c = p.shift().toLowerCase();
        if (CMD[c]) CMD[c](p); else print("Commande inconnue : " + c, "er");
      } else if (e.key === "ArrowUp") { if (hi > 0) { hi--; inp.value = hist[hi]; } e.preventDefault(); }
      else if (e.key === "ArrowDown") { if (hi < hist.length - 1) { hi++; inp.value = hist[hi]; } else { hi = hist.length; inp.value = ""; } e.preventDefault(); }
    };
    box.onclick = function () { inp.focus(); }; setTimeout(function () { inp.focus(); }, 60);
  } };

  /* ----- Relais Discord : Censure.iaa / Justice.iaa / ethique.iaa (webhooks) ----- */
  var IA = window.PC_IA || { acces: [], serveurs: [], personas: [] };
  var WH_RE = /^https:\/\/(?:(?:canary|ptb)\.)?(?:discord|discordapp)\.com\/api(?:\/v\d+)?\/webhooks\/(\d+)\/([\w-]+)$/;
  function maskUrl(u) { var m = WH_RE.exec(u); return m ? "…/webhooks/" + m[1] + "/" + m[2].slice(0, 4) + "••••" + m[2].slice(-3) : "(adresse invalide)"; }
  function absUrl(p) { try { return new URL(p, document.baseURI).href; } catch (e) { return p; } }
  var RELAY_CTX = null;
  function botCall(method, url, payload) {
    var m = /^bot:([a-z0-9_-]+):(\d+)(?:\/messages\/(\d+))?$/i.exec(url);
    if (!m || !RELAY_CTX) return Promise.reject({ http: 400 });
    if (method === "DELETE") return RELAY_CTX("POST", "/delete", { bot: m[1], channel: m[2], id: m[3] }).then(function () { return null; });
    var mentions = !!(payload && payload.allowed_mentions && payload.allowed_mentions.parse && payload.allowed_mentions.parse.length);
    return RELAY_CTX("POST", "/send", { bot: m[1], channel: m[2], content: payload.content, embeds: payload.embeds, mentions: mentions });
  }
  function hookCall(method, url, payload) {
    if (String(url).indexOf("bot:") === 0) return botCall(method, url, payload);
    var u = url + (method === "POST" ? (url.indexOf("?") < 0 ? "?wait=true" : "&wait=true") : "");
    return fetch(u, { method: method, headers: payload ? { "Content-Type": "application/json" } : undefined, body: payload ? JSON.stringify(payload) : undefined }).then(function (r) {
      if (r.status === 429) return r.json().then(function (j) { throw { rate: j.retry_after || 1 }; }, function () { throw { rate: 2 }; });
      if (r.status === 204) return null;
      if (!r.ok) throw { http: r.status };
      return method === "POST" ? r.json() : null;
    }, function () { throw { net: true }; });
  }
  function errText(e) { return e.auth ? "Clé du relais refusée : vérifiez-la dans l'onglet « Connexion »." : e.msg ? "Relais : " + e.msg : e.rate ? "Limite Discord atteinte : réessayez dans " + Math.ceil(e.rate) + " s." : e.net ? "Impossible de joindre Discord (réseau ou blocage du navigateur)." : e.http === 404 ? "Webhook introuvable : il a sans doute été supprimé dans Discord." : e.http === 401 || e.http === 403 ? "Webhook refusé par Discord." : e.http === 400 ? "Message refusé par Discord (contenu invalide)." : "Erreur Discord" + (e.http ? " (" + e.http + ")" : "") + "."; }

  SYS.relais = { nom: "Relais Discord", icone: ICONS.relais, visible: function (S) { return IA.acces.indexOf(S.grade) >= 0; }, open: function (pane, arg, ctx) {
    var S = ctx.session;
    if (IA.acces.indexOf(S.grade) < 0) { pane.innerHTML = '<div class="sy"><div class="emp" style="margin:auto">Accès refusé. Cette application est réservée à la Présidence Juridique et à la Présidence Éthique.</div></div>'; return; }
    var kS = "pcwh:" + S.id, kH = "pcwhlog:" + S.id, tab = "send", persona = IA.personas[0] ? IA.personas[0].id : "", srv = (IA.relais && IA.relais.url) ? "" : (IA.serveurs[0] ? IA.serveurs[0].id : ""), salon = "", draft = { text: "", embed: false, title: "", color: "", foot: "", ts: false, ment: false }, note = "", armed = false, armT = null, packTxt = "";
    var BOT = !!(IA.relais && IA.relais.url), kK = "pcrelaykey:" + S.id, rkey = jget(kK, ""), RC = {};
    function servers() { if (!BOT) return IA.serveurs; var c = RC[persona]; return c && c.guilds ? c.guilds.map(function (g) { return { id: g.id, nom: g.name }; }) : []; }
    function salons() {
      if (!BOT) return jget(kS, []);
      var c = RC[persona], out = [];
      if (c && c.guilds) c.guilds.forEach(function (g) { g.channels.forEach(function (ch) { out.push({ id: ch.id, srv: g.id, nom: "#" + ch.name, url: "bot:" + persona + ":" + ch.id }); }); });
      return out;
    }
    function relay(method, path, body) {
      return fetch(String(IA.relais.url).replace(/\/+$/, "") + path, { method: method, headers: Object.assign({ "X-Relais-Key": rkey }, body ? { "Content-Type": "application/json" } : {}), body: body ? JSON.stringify(body) : undefined }).then(function (r) {
        if (r.status === 429) return r.json().then(function (j) { throw { rate: j.retry_after || 2 }; }, function () { throw { rate: 2 }; });
        if (r.status === 401) throw { auth: true };
        if (!r.ok) return r.json().then(function (j) { throw { http: r.status, msg: j && j.error }; }, function () { throw { http: r.status }; });
        return r.json();
      }, function () { throw { net: true }; });
    }
    RELAY_CTX = BOT ? relay : null;
    function loadBot(force) {
      if (!BOT || !rkey) return;
      var p = persona, c = RC[p];
      if (c && !force && (c.guilds || c.loading || c.err)) return;
      RC[p] = { loading: true };
      relay("GET", "/channels?bot=" + encodeURIComponent(p)).then(function (r) { RC[p] = { guilds: r.guilds || [] }; }, function (e) { RC[p] = { err: errText(e) }; }).then(function () { if (document.body.contains(pane)) draw(); });
    }
    function emptyMsg() {
      if (!BOT) return "Ajoutez d'abord un salon dans l'onglet « Salons ».";
      var c = RC[persona];
      if (!rkey) return "Entrez d'abord la clé du relais dans l'onglet « Connexion ».";
      if (!c || c.loading) return "Chargement des serveurs et des salons…";
      if (c.err) return c.err;
      return c.guilds.length ? "Aucun salon texte visible pour ce bot sur ce serveur." : "Ce bot n'est dans aucun serveur autorisé par le relais.";
    }
    function persoOf(id) { return IA.personas.filter(function (p) { return p.id === id; })[0]; }
    function draw() {
      loadBot(false);
      pane.innerHTML = '<div class="sy"><div class="rl"><div class="tabs">' + [["send", "Envoyer"], ["salons", BOT ? "Connexion" : "Salons"], ["hist", "Historique"]].map(function (t) { return '<button data-t="' + t[0] + '" class="' + (t[0] === tab ? "on" : "") + '">' + t[1] + "</button>"; }).join("") + '</div><div class="bd"></div></div></div>';
      pane.querySelectorAll(".tabs button").forEach(function (b) { b.onclick = function () { tab = b.dataset.t; note = ""; armed = false; draw(); }; });
      var bd = pane.querySelector(".bd");
      if (tab === "send") sendTab(bd); else if (tab === "salons") salonsTab(bd); else histTab(bd);
    }
    /* ---- Envoyer ---- */
    function sendTab(bd) {
      if (BOT && !servers().some(function (s) { return s.id === srv; })) srv = servers()[0] ? servers()[0].id : "";
      var list = salons().filter(function (x) { return x.srv === srv; });
      if (!list.some(function (x) { return x.id === salon; })) salon = list[0] ? list[0].id : "";
      var P = persoOf(persona) || IA.personas[0], col = draft.color || (P ? P.couleur : "#7b83ff");
      bd.innerHTML = '<h4>Intelligence</h4><div class="pers">' + IA.personas.map(function (p) { return '<button class="pc' + (p.id === persona ? " on" : "") + '" data-p="' + p.id + '"><img src="' + esc(p.avatar) + '" alt=""><span><b>' + esc(p.nom) + "</b>" + esc(p.desc) + "</span></button>"; }).join("") + "</div>" +
        '<h4>Destination</h4><div class="row2"><div><label>Serveur</label><select id="rs">' + servers().map(function (s) { return '<option value="' + s.id + '"' + (s.id === srv ? " selected" : "") + ">" + esc(s.nom) + "</option>"; }).join("") + '</select></div><div><label>Salon</label><select id="rc">' +
        (list.length ? list.map(function (x) { return '<option value="' + x.id + '"' + (x.id === salon ? " selected" : "") + ">" + esc(x.nom) + "</option>"; }).join("") : "<option value=\"\">Aucun salon enregistré pour ce serveur</option>") + "</select></div></div>" +
        (list.length ? "" : '<p class="msgn ko">' + esc(emptyMsg()) + "</p>") +
        '<h4>Message</h4><textarea id="rt" maxlength="' + (draft.embed ? 4000 : 2000) + '" placeholder="Votre message…">' + esc(draft.text) + '</textarea><div style="margin:.6rem 0;display:flex;gap:1.2rem;flex-wrap:wrap;font-size:.78rem"><label style="display:flex;gap:.4rem;align-items:center;margin:0;text-transform:none;letter-spacing:0;font-size:.78rem;color:#e9e6dd"><input type="checkbox" id="re"' + (draft.embed ? " checked" : "") + '> Mettre en forme (encadré)</label><label style="display:flex;gap:.4rem;align-items:center;margin:0;text-transform:none;letter-spacing:0;font-size:.78rem;color:#e9e6dd"><input type="checkbox" id="rm"' + (draft.ment ? " checked" : "") + '> Autoriser les mentions (@personne, @rôle)</label></div>' +
        (draft.embed ? '<div class="row2"><div><label>Titre</label><input type="text" id="rtl" maxlength="256" value="' + esc(draft.title) + '"></div><div><label>Pied de page</label><input type="text" id="rf" maxlength="200" value="' + esc(draft.foot) + '"></div><div><label>Couleur</label><input type="color" id="rco" value="' + esc(col) + '" style="height:2.3rem;padding:.1rem;width:100%"></div><div><label style="margin-top:1.4rem;text-transform:none;letter-spacing:0;font-size:.78rem;color:#e9e6dd"><input type="checkbox" id="rd"' + (draft.ts ? " checked" : "") + '> Afficher la date et l\'heure</label></div></div>' : "") +
        '<h4>Aperçu</h4><div class="pv" id="pv"></div><div style="margin-top:1rem;display:flex;gap:.8rem;align-items:center;flex-wrap:wrap"><button class="btn2' + (armed ? " arm" : "") + '" id="rg"' + (list.length ? "" : " disabled") + ">" + (armed ? "Confirmer l'envoi" : "Envoyer") + '</button><span class="msgn" id="rn">' + note + "</span></div>";
      function preview() {
        var P2 = persoOf(persona) || {}, c2 = draft.embed ? (pane.querySelector("#rco") ? pane.querySelector("#rco").value : col) : col, now = new Date();
        var body = draft.embed ? '<div class="em" style="border-left-color:' + esc(c2) + '">' + (draft.title ? "<b>" + esc(draft.title) + "</b>" : "") + esc(draft.text) + (draft.foot || draft.ts ? "<small>" + esc(draft.foot) + (draft.foot && draft.ts ? " · " : "") + (draft.ts ? now.toLocaleString("fr-FR") : "") + "</small>" : "") + "</div>" : '<div class="tx">' + esc(draft.text || "…") + "</div>";
        pane.querySelector("#pv").innerHTML = '<div class="mm"><img src="' + esc(P2.avatar || "") + '" alt=""><div><div><span class="nm" style="color:' + esc(P2.couleur || "#fff") + '">' + esc(P2.nom || "") + '</span><span class="tg">APP</span><span class="tm2">Aujourd\'hui à ' + pad2(now.getHours()) + ":" + pad2(now.getMinutes()) + "</span></div>" + body + "</div></div>";
      }
      preview();
      bd.querySelectorAll(".pc").forEach(function (b) { b.onclick = function () { persona = b.dataset.p; draft.color = ""; armed = false; draw(); }; });
      bd.querySelector("#rs").onchange = function (e) { srv = e.target.value; salon = ""; armed = false; draw(); };
      bd.querySelector("#rc").onchange = function (e) { salon = e.target.value; armed = false; };
      var ta = bd.querySelector("#rt"); ta.oninput = function () { draft.text = ta.value; armed = false; preview(); };
      bd.querySelector("#re").onchange = function (e) { draft.embed = e.target.checked; draw(); };
      bd.querySelector("#rm").onchange = function (e) { draft.ment = e.target.checked; };
      if (draft.embed) {
        bd.querySelector("#rtl").oninput = function (e) { draft.title = e.target.value; preview(); };
        bd.querySelector("#rf").oninput = function (e) { draft.foot = e.target.value; preview(); };
        bd.querySelector("#rco").oninput = function (e) { draft.color = e.target.value; preview(); };
        bd.querySelector("#rd").onchange = function (e) { draft.ts = e.target.checked; preview(); };
      }
      bd.querySelector("#rg").onclick = function () {
        var sl = salons().filter(function (x) { return x.id === salon; })[0], P3 = persoOf(persona), txt = draft.text.trim();
        var rn = bd.querySelector("#rn");
        if (!sl || !P3) return;
        if (!txt && !(draft.embed && draft.title.trim())) { rn.className = "msgn ko"; rn.textContent = "Le message est vide."; return; }
        if (!armed) { armed = true; clearTimeout(armT); armT = setTimeout(function () { armed = false; if (tab === "send") draw(); }, 6000); note = ""; draw(); return; }
        armed = false; clearTimeout(armT);
        var payload = { username: P3.nom, avatar_url: absUrl(P3.avatar), allowed_mentions: { parse: draft.ment ? ["users", "roles"] : [] } };
        if (draft.embed) {
          var em = { description: txt, color: parseInt((draft.color || P3.couleur).replace("#", ""), 16) || 0 };
          if (draft.title.trim()) em.title = draft.title.trim(); if (draft.foot.trim()) em.footer = { text: draft.foot.trim() }; if (draft.ts) em.timestamp = new Date().toISOString();
          payload.embeds = [em];
        } else payload.content = txt;
        note = '<span style="color:#8a918d">Envoi…</span>'; draw();
        hookCall("POST", sl.url, payload).then(function (r) {
          var H = jget(kH, []); H.unshift({ t: Date.now(), persona: P3.nom, srv: sl.srv, salon: sl.nom, extrait: txt.slice(0, 140), msgId: r && r.id, url: sl.url, par: S.id }); jset(kH, H.slice(0, 40));
          draft.text = ""; draft.title = ""; note = '<span class="ok">Message envoyé dans ' + esc(sl.nom) + " (" + esc(sl.srv) + ").</span>"; draw();
        }, function (e) { note = '<span class="ko">' + esc(errText(e)) + "</span>"; draw(); });
      };
    }
    /* ---- Salons ---- */
    function botTab(bd) {
      var c = RC[persona], P = persoOf(persona);
      var st = !rkey ? "Aucune clé enregistrée." : !c || c.loading ? "Chargement…" : c.err ? '<span class="ko">' + esc(c.err) + "</span>" : c.guilds.length ? c.guilds.map(function (g) { return "<div>" + esc(g.name) + " — " + g.channels.length + " salon" + (g.channels.length > 1 ? "s" : "") + "</div>"; }).join("") : "Ce bot n'est dans aucun serveur autorisé.";
      bd.innerHTML = '<div class="warn">Les messages sont envoyés par le vrai bot, via le relais de la Fondation. La clé vous est remise par la Direction ; elle reste dans ce navigateur. Ne la partagez pas.</div>' +
        '<h4>Clé du relais</h4><div class="row2"><div><label>Clé de la Présidence</label><input type="password" id="bk" placeholder="' + (rkey ? "•••••••• (enregistrée)" : "Collez la clé ici") + '" autocomplete="off"></div></div>' +
        '<div style="margin-top:.8rem;display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn2" id="bs">Enregistrer la clé</button><button class="btn2" id="br"' + (rkey ? "" : " disabled") + '>Actualiser les serveurs</button>' + (rkey ? '<button class="btn2" id="bd">Retirer la clé</button>' : "") + "</div>" +
        '<p class="msgn" id="bm">' + note + "</p>" +
        "<h4>Serveurs vus par " + esc(P ? P.nom : persona) + '</h4><div style="font-size:.8rem;line-height:1.8;color:#cfd3d6">' + st + "</div>" +
        '<p style="font-size:.72rem;color:#8a918d;margin-top:1rem">Changez d\'intelligence dans l\'onglet « Envoyer » pour voir les serveurs d\'un autre bot.</p>';
      bd.querySelector("#bs").onclick = function () { var v = bd.querySelector("#bk").value.trim(); if (v.length < 12) { note = '<span class="ko">Clé trop courte.</span>'; draw(); return; } rkey = v; jset(kK, rkey); RC = {}; note = '<span class="ok">Clé enregistrée.</span>'; draw(); };
      bd.querySelector("#br").onclick = function () { RC[persona] = null; note = ""; loadBot(true); draw(); };
      var bdl = bd.querySelector("#bd"); if (bdl) bdl.onclick = function () { rkey = ""; jset(kK, ""); RC = {}; note = ""; draw(); };
    }
    function salonsTab(bd) {
      if (BOT) return botTab(bd);
      var L = salons();
      bd.innerHTML = '<div class="warn">Un webhook est un secret : quiconque le possède peut écrire dans le salon. Il est enregistré uniquement dans ce navigateur et n\'est jamais écrit dans les fichiers du site. Pour créer un webhook : Discord > paramètres du salon > Intégrations > Webhooks > Nouveau webhook > Copier l\'URL.</div>' +
        '<h4>Ajouter un salon</h4><div class="row2"><div><label>Serveur</label><select id="as">' + servers().map(function (s) { return '<option value="' + s.id + '">' + esc(s.nom) + "</option>"; }).join("") + '</select></div><div><label>Nom du salon</label><input type="text" id="an" maxlength="60" placeholder="#annonces"></div></div><div style="margin-top:.8rem"><label>URL du webhook</label><input type="text" id="au" placeholder="https://discord.com/api/webhooks/…" autocomplete="off" spellcheck="false"></div><div style="margin-top:.8rem"><button class="btn2" id="aa">Ajouter</button><span class="msgn" id="am">' + note + "</span></div>" +
        '<h4>Salons enregistrés</h4>' + (L.length ? servers().map(function (s) { var l = L.filter(function (x) { return x.srv === s.id; }); return l.length ? "<div style=\"margin-bottom:.8rem\"><div style=\"font-size:.74rem;margin-bottom:.3rem\">" + esc(s.nom) + "</div>" + l.map(function (x) { return '<div class="sl"><b>' + esc(x.nom) + "</b><code>" + esc(maskUrl(x.url)) + '</code><button class="btn3" data-test="' + x.id + '">Test</button><button class="btn3" data-rm="' + x.id + '">Retirer</button></div>'; }).join("") + "</div>" : ""; }).join("") : '<p style="color:#8a918d;font-size:.8rem">Aucun salon pour le moment.</p>') +
        '<h4>Partager avec l\'autre Présidence</h4><p style="font-size:.74rem;color:#8a918d;line-height:1.6;margin-bottom:.5rem">Exportez vos salons en un bloc de texte, envoyez-le en message privé, puis collez-le ici sur l\'autre navigateur pour les importer.</p><textarea id="ap" placeholder="Bloc d\'export / d\'import">' + esc(packTxt) + '</textarea><div style="margin-top:.5rem;display:flex;gap:.5rem"><button class="btn3" id="ax">Exporter</button><button class="btn3" id="ai">Importer</button></div>';
      var am = bd.querySelector("#am");
      bd.querySelector("#aa").onclick = function () {
        var s = bd.querySelector("#as").value, n = bd.querySelector("#an").value.trim(), u = bd.querySelector("#au").value.trim();
        if (!n) { am.className = "msgn ko"; am.textContent = "Donnez un nom au salon."; return; }
        if (!WH_RE.test(u)) { am.className = "msgn ko"; am.textContent = "Cette adresse n'est pas un webhook Discord valide."; return; }
        var all = salons(); all.push({ id: "w" + Date.now(), srv: s, nom: n, url: u }); jset(kS, all); note = '<span class="ok">Salon ajouté.</span>'; draw();
      };
      bd.querySelectorAll("[data-rm]").forEach(function (b) { b.onclick = function () { if (b.dataset.arm) { jset(kS, salons().filter(function (x) { return x.id !== b.dataset.rm; })); note = ""; draw(); } else { b.dataset.arm = 1; b.textContent = "Confirmer ?"; } }; });
      bd.querySelectorAll("[data-test]").forEach(function (b) { b.onclick = function () {
        var sl = salons().filter(function (x) { return x.id === b.dataset.test; })[0], P = IA.personas[0]; b.disabled = true; b.textContent = "…";
        hookCall("POST", sl.url, { username: P.nom, avatar_url: absUrl(P.avatar), content: "Test de liaison du Relais — Installation 73.", allowed_mentions: { parse: [] } }).then(function () { b.textContent = "Envoyé ✓"; }, function (e) { b.textContent = "Échec"; b.title = errText(e); });
      }; });
      bd.querySelector("#ax").onclick = function () { try { packTxt = "RELAIS1:" + btoa(unescape(encodeURIComponent(JSON.stringify(salons())))); } catch (e) { packTxt = ""; } draw(); };
      bd.querySelector("#ai").onclick = function () {
        var t = bd.querySelector("#ap").value.trim(); packTxt = t;
        try {
          if (t.indexOf("RELAIS1:") !== 0) throw 0;
          var arr = JSON.parse(decodeURIComponent(escape(atob(t.slice(8))))), cur = salons(), n = 0;
          arr.forEach(function (x) { if (x && WH_RE.test(x.url) && servers().some(function (s) { return s.id === x.srv; }) && !cur.some(function (c) { return c.url === x.url; })) { cur.push({ id: "w" + Date.now() + n, srv: x.srv, nom: String(x.nom || "salon").slice(0, 60), url: x.url }); n++; } });
          jset(kS, cur); note = '<span class="ok">' + n + " salon" + (n > 1 ? "s" : "") + " importé" + (n > 1 ? "s" : "") + ".</span>"; packTxt = ""; draw();
        } catch (e) { note = '<span class="ko">Bloc invalide.</span>'; draw(); }
      };
    }
    /* ---- Historique ---- */
    function histTab(bd) {
      var H = jget(kH, []);
      bd.innerHTML = '<h4>Derniers envois depuis ce navigateur</h4>' + (note ? '<p class="msgn">' + note + "</p>" : "") + (H.length ? H.map(function (h, i) {
        return '<div class="hs"><b>' + esc(h.persona) + "</b> → " + esc(h.salon) + " (" + esc(h.srv) + ")<br>" + esc(h.extrait) + "<br><small>" + new Date(h.t).toLocaleString("fr-FR") + " · " + esc(h.par) + "</small>" + (h.msgId && !h.del ? ' <button class="btn3" data-dl="' + i + '">Supprimer sur Discord</button>' : h.del ? " <small>supprimé</small>" : "") + "</div>";
      }).join("") : '<p style="color:#8a918d;font-size:.8rem">Aucun envoi.</p>');
      bd.querySelectorAll("[data-dl]").forEach(function (b) { b.onclick = function () {
        if (!b.dataset.arm) { b.dataset.arm = 1; b.textContent = "Confirmer ?"; return; }
        var i = +b.dataset.dl, H2 = jget(kH, []), h = H2[i]; b.disabled = true;
        hookCall("DELETE", h.url + "/messages/" + h.msgId).then(function () { H2[i].del = true; jset(kH, H2); note = ""; draw(); }, function (e) { note = '<span class="ko">' + esc(errText(e)) + "</span>"; draw(); });
      }; });
    }
    if (BOT && !rkey) tab = "salons";
    draw();
  } };

  window.SYS = SYS; window.SYS_FS = FS; window.SYS_ICONS = ICONS; window.SYS_WALLS = WALLS;
})();
