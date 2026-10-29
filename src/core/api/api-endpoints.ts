export const apiEndpoints = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
  },
  clients: "/clients",
  prospects: "/prospects",
  demandesDevis: "/demandes-devis",
  devis: "/devis",
  catalogue: "/catalogue",
  chantiers: "/chantiers",
  notifications: "/notifications",
} as const;
