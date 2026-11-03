/* Comptes du personnel du Département de Justice.
   Une ligne par agent : matricule, nom affiché, rôle (presidence, directeur, be, eap),
   sel et empreinte du mot de passe, et "actif" (true ou false pour suspendre).
   Pour ajouter un agent : Secteur admin > Générateur de compte, puis collez la ligne
   obtenue juste avant la dernière accolade. Pour retirer un agent, supprimez sa ligne. */
window.COMPTES = {
  "JUS-73-0001": {"nom":"Présidence","role":"presidence","salt":"931f9db69d520598f66a30d176e48bbd","hash":"dfba5e5147e90aa7d574781e3f2f7f2cc9cb7f5a7e09f25f5bf5d4baeae6f032","actif":true},
  "JUS-73-0102": {"nom":"Directeur","role":"directeur","salt":"0f8b3d1067521f2bcc27aa547a9057e5","hash":"27c2748b22eee1415f3b323256966ed1f2b5976266142153266ae654dc2c8dab","actif":true},
  "JUS-73-0215": {"nom":"BE-01","role":"be","salt":"bd141d449850c48c14f9fc6133883d2c","hash":"10b0691596259c9cf0ad4a94e39a4ab8f90ffdeb627f3c4616a76566a79fc010","actif":true},
  "JUS-73-0318": {"nom":"EAP-01","role":"eap","salt":"31ac3c5f08dc4dfbeca02428ce0ff6a8","hash":"e10370e5370b0d7aacc9f1938315acffb388486fb866034c67c944ab5bf8d2ba","actif":true},
};
