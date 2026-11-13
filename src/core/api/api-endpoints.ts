export const apiEndpoints = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
  },
  clients: "/clients",
  prospects: "/prospects",
  devis: "/devis",
  catalogue: "/catalogue",
  chantiers: "/chantiers",
  planning: "/planning",
  commandesFournisseur: "/commandes-fournisseur",
  sav: "/sav",
  usersOptions: "/users/options",
  notifications: "/notifications",
} as const;
