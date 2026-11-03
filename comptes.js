/* Comptes du personnel du Département de Justice.
   Une ligne par agent : matricule, nom affiché, rôle (presidence, directeur, be, eap),
   sel et empreinte du mot de passe, et "actif" (true ou false pour suspendre).
   Pour ajouter un agent : Secteur admin > Générateur de compte, puis collez la ligne
   obtenue juste avant la dernière accolade. Pour retirer un agent, supprimez sa ligne. */
window.COMPTES = {
  "PDJ-73-0001": {"nom":"Aron VARONE","role":"presidence","salt":"1f2cef1fac64f3e2fc8f927bc3b0ab07","hash":"6614e319e34e64ef8bceac19fbc65990ef33b33db7e90b2e48c54dabce669e4f","actif":true},
  "SG-73-0001": {"nom":"Nathan LECLERC","role":"sec","salt":"71de7c933853771cae1077f0909d4ba1","hash":"37c4b91468b5d0024746b9c1da6e8ed2a6fcae16934e30c682ab19319089d6c8","actif":true},
  "JUS-73-0102": {"nom":"Directeur","role":"directeur","salt":"0f8b3d1067521f2bcc27aa547a9057e5","hash":"27c2748b22eee1415f3b323256966ed1f2b5976266142153266ae654dc2c8dab","actif":true},
  "JUS-73-0215": {"nom":"BE-01","role":"be","salt":"bd141d449850c48c14f9fc6133883d2c","hash":"10b0691596259c9cf0ad4a94e39a4ab8f90ffdeb627f3c4616a76566a79fc010","actif":true},
  "JUS-73-0318": {"nom":"EAP-01","role":"eap","salt":"31ac3c5f08dc4dfbeca02428ce0ff6a8","hash":"e10370e5370b0d7aacc9f1938315acffb388486fb866034c67c944ab5bf8d2ba","actif":true},
};
