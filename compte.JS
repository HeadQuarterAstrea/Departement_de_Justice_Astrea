/*
 * Configuration centralisée du Département de Justice.
 * Les comptes et les grades sont regroupés ici pour être retrouvés et modifiés facilement.
 * Chargement prévu avant le script principal d'index.html.
 */
window.ASTREA_CONFIG = {
  BE_GRADES: {
    agent: 'Agent',
    enqueteur: 'Enquêteur',
    confirme: 'Enquêteur confirmé',
    chef: 'Chef du BE'
  },
  ACCOUNTS: [
    { uid: 'PRES-73-001', password: 'Astrea-01', role: 'presidence', firstname: 'Aurelia', lastname: 'Vernier', grade: null },
    { uid: 'SEC-73-101', password: 'Astrea-02', role: 'sec', firstname: 'Luc', lastname: 'Aubert', grade: null },
    { uid: 'DIR-73-200', password: 'Astrea-03', role: 'directeur', firstname: 'Marta', lastname: 'Delorme', grade: null },
    { uid: 'BE-73-301', password: 'Astrea-04', role: 'be', firstname: 'Sofia', lastname: 'Ikeda', grade: 'enqueteur' },
    { uid: 'BE-73-302', password: 'Astrea-05', role: 'be', firstname: 'Nicolas', lastname: 'Marceau', grade: 'chef' },
    { uid: 'EAP-73-401', password: 'Astrea-06', role: 'eap', firstname: 'Ilya', lastname: 'Roche', grade: 'agent' },
    { uid: 'COURS-73-501', password: 'Astrea-07', role: 'cours', firstname: 'Eva', lastname: 'Sorel', grade: null }
  ]
};
