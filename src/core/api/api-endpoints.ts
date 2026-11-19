export const apiEndpoints = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    /** Signature of the advisor (GET / PUT), used for the on-site signature */
    maSignature: "/auth/me/signature",
  },
  clients: "/clients",
  prospects: "/prospects",
  demandesDevis: "/demandes-devis",
  dashboardCommercial: "/dashboard/commercial",
  fichiers: "/fichiers",
  devis: "/devis",
  catalogue: "/catalogue",
  chantiers: "/chantiers",
  planning: "/planning",
  commandesFournisseur: "/commandes-fournisseur",
  sav: "/sav",
  usersOptions: "/users/options",
  notifications: "/notifications",
} as const;
