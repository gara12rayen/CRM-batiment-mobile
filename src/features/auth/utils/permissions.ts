
import type { UserRole } from "@/features/auth/models/auth.types";

export const permissions = {
  // Espace commercial
  canAccessCommercial: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  canReadClients: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  // Consultation des devis
  canReadQuotes: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  // Création et modification des devis
  canManageQuotes: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  // Suppression des devis
  canDeleteQuotes: (role: UserRole) =>
    role === "ADMIN",

  canUseDevisIA: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  canUseDevisIAForQuote: (role: UserRole, quoteStatus: string | null | undefined) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role) &&
    quoteStatus === "BROUILLON",

  // Gestion des utilisateurs et paramètres
  canManageUsers: (role: UserRole) =>
    role === "ADMIN",

  canManageSettings: (role: UserRole) =>
    role === "ADMIN",

  // Mode exécution
  // GET /auth/me ne fournit pas de type d’entreprise ni de flag d’exécution.
  // L’accès front suit donc les rôles acceptés par les routes du backend.
  canAccessExecution: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  // Chantiers
  canReadChantiers: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  canReadPlanning: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  canReadPointages: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  canReadTasks: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  canReadExecutionSubcontractors: (role: UserRole) =>
    ["ADMIN", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  canReadExecutionPhotos: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  canReadExecutionSav: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  canManageChantiers: (role: UserRole) =>
    ["ADMIN", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  // Données financières
  // Le chef de chantier ne doit pas voir les montants ni les marges.
  canViewAmounts: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  // Factures
  canReadInvoices: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  canManageInvoices: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  canReadCompanySettings: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  // Portail fournisseur
  canAccessSupplierOrders: (role: UserRole) =>
    role === "FOURNISSEUR",

  canAccessSubcontractorPortal: (role: UserRole) =>
    role === "SOUS_TRAITANT",
};
