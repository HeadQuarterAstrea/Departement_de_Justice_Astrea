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
  var WALLS = { nuit: ["Nuit", "radial-gradient(90% 70% at 15% 0,#1a2630 0,transparent 60%),radial-gradient(80% 70% at 100% 100%,#2a1518 0,transparent 55%),#0b0e11"],
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

  window.SYS = SYS; window.SYS_FS = FS; window.SYS_ICONS = ICONS; window.SYS_WALLS = WALLS;
})();
