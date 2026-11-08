/* Serveur partagé du poste (facultatif) : Supabase.
   Rempli  -> la Messagerie est partagée entre tous les comptes, et une suspension de compte s'applique partout, tout de suite.
   Vide    -> tout fonctionne en mode local (chaque navigateur est isolé : pratique pour tester).
   Mise en place :
     1. Créer un projet gratuit sur supabase.com.
     2. SQL Editor > New query > coller le contenu de supabase.sql > Run.
     3. Project Settings > API : copier "Project URL" et la clé "anon public", les coller ci-dessous. */
window.PC_BACKEND = {
  url: "",   /* ex : "https://abcdefgh.supabase.co" */
  key: ""    /* clé anon public */
};
