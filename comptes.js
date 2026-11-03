/* Comptes du personnel du Département de Justice.
   Une ligne par agent : matricule, nom affiché, rôle (presidence, directeur, be, eap),
   sel et empreinte du mot de passe, et "actif" (true ou false pour suspendre).
   Pour ajouter un agent : Secteur admin > Générateur de compte, puis collez la ligne
   obtenue juste avant la dernière accolade. Pour retirer un agent, supprimez sa ligne. */
window.COMPTES = {
  "PDJ-73-0001": {"nom":"Aron VARONE","role":"presidence","salt":"1f2cef1fac64f3e2fc8f927bc3b0ab07","hash":"6614e319e34e64ef8bceac19fbc65990ef33b33db7e90b2e48c54dabce669e4f","actif":true},
  "SG-73-0001": {"nom":"Nathan LECLERC","role":"sec","salt":"71de7c933853771cae1077f0909d4ba1","hash":"37c4b91468b5d0024746b9c1da6e8ed2a6fcae16934e30c682ab19319089d6c8","actif":true},
};
