/* Relais Discord : personnalités (IA) et serveurs.
   Les salons (avec leurs webhooks) ne sont PAS dans ce fichier : ce sont des secrets, ils se saisissent dans l'application
   et restent dans le navigateur de la personne. Seuls les grades de "acces" voient l'application.
   avatar : image publique (png/jpg) affichée par Discord à côté du nom. */
window.PC_IA = {
  acces: ["presidence", "eth_pres"],
  /* Relais des vrais bots (Cloudflare Worker, voir relais-discord/LISEZ-MOI.txt). Vide = mode webhooks. */
  relais: { url: "" },
  serveurs: [
    { id: "DJ", nom: "Département de Justice (DJ)" },
    { id: "CE", nom: "Comité d'Éthique (CE)" }
  ],
  personas: [
    { id: "censure", nom: "Censure.iaa", couleur: "#c2352b", avatar: "ia/censure.png", desc: "Communications officielles et caviardage de la Fondation" },
    { id: "justice", nom: "Justice.iaa", couleur: "#d8d4c8", avatar: "justice/logo.png", desc: "Voix du Département de Justice" },
    { id: "ethique", nom: "ethique.iaa", couleur: "#d6a36f", avatar: "ethos/logo.png", desc: "Voix du Comité d'Éthique" }
  ]
};
