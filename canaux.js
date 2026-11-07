/* Salons de la Messagerie.
   id : identifiant unique (lettres/chiffres)   nom : nom affiché   desc : description
   pour : accès requis ([] = tout le monde, ["justice"] = ACCÈS JUSTICE, ["ethique"] = ACCÈS ÉTHIQUE)
   ecrire : "*" = tous ceux qui voient le salon, ou une liste de grades (ex. ["direction"]) pour un salon en lecture seule.
   La Direction voit tous les salons. */
window.PC_CANAUX = [
  {"id":"general","nom":"général","desc":"Salon commun de la Fondation S.C.P.F — Installation 73","pour":[],"ecrire":"*"},
  {"id":"annonces","nom":"annonces","desc":"Communications officielles de la Direction","pour":[],"ecrire":["direction"]},
  {"id":"justice","nom":"justice-rp","desc":"Roleplay du Département de Justice","pour":["justice"],"ecrire":"*"},
  {"id":"cour","nom":"cour-juridique","desc":"Audiences, jugements et délibérés","pour":["justice"],"ecrire":"*"},
  {"id":"be","nom":"bureau-enquete","desc":"Bureau d'Enquête : affaires en cours","pour":["justice"],"ecrire":"*"},
  {"id":"eap","nom":"eap","desc":"Équipe d'Application des Peines : déploiements","pour":["justice"],"ecrire":"*"},
  {"id":"ethique","nom":"ethique-rp","desc":"Roleplay du Comité d'Éthique (ETHOS)","pour":["ethique"],"ecrire":"*"}
];
