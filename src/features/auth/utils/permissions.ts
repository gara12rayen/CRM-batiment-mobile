
import type { UserRole } from "@/features/auth/models/auth.types";

export const permissions = {
  // Espace commercial
  canAccessCommercial: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  // Comme l'API (décision du 29/10) : le chef de chantier n'a pas accès aux clients (403)
  canReadClients: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  // Consultation des devis
  canReadQuotes: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  // Création et modification des devis
  canManageQuotes: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  // Suppression des devis
  canDeleteQuotes: (role: UserRole) =>
    role === "ADMIN",

  // Devis IA (backend lot 1 du 16/11) : le chef de chantier y a accès aussi, sans voir les prix,
  // seulement sur SES brouillons (POST /devis/brouillon-chef). Le bureau valide ensuite les prix.
  canUseDevisIA: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  /**
   * Devis IA sur un devis précis : toujours un BROUILLON.
   * Chef de chantier : seulement un brouillon qu'il a créé lui-même (sinon l'API répond 403).
   */
  canUseDevisIAForQuote: (
    role: UserRole,
    quoteStatus: string | null | undefined,
    quote?: { createurId?: number | string | null; userId?: number | string | null },
  ) => {
    if (quoteStatus !== "BROUILLON") return false;
    if (["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role)) return true;
    return (
      role === "CHEF_CHANTIER" &&
      quote?.createurId != null &&
      quote?.userId != null &&
      String(quote.createurId) === String(quote.userId)
    );
  },

  // Le chef de chantier commence un brouillon (client d'un de ses chantiers ou prospect qu'il a envoyé)
  canCreateChefDraft: (role: UserRole) =>
    role === "CHEF_CHANTIER",

  // Actions sur un devis : envoyer, WhatsApp, remis au client, refuser, PDF (le bureau seulement)
  canSendQuotes: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  canDownloadQuotePdf: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  // Signature du client sur le téléphone du conseiller + lien de signature par email (bureau)
  canSignOnSite: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  // Signature du conseiller dans le profil (GET / PUT /auth/me/signature : bureau + chef)
  canManageOwnSignature: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  // Transformer une demande en devis brouillon (API : ADMIN et TECHNICO seulement)
  canConvertRequest: (role: UserRole) =>
    ["ADMIN", "TECHNICO"].includes(role),

  // Catalogue en consultation (le chef le voit sans aucun prix : l'API les retire)
  canReadCatalogue: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

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
  // Comme l'API : factures lues par le bureau (le chef reçoit 403), modifiées par ADMIN et ASSISTANTE
  // (le TECHNICO les consulte seulement)
  canReadInvoices: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE"].includes(role),

  canManageInvoices: (role: UserRole) =>
    ["ADMIN", "ASSISTANTE"].includes(role),

  canReadCompanySettings: (role: UserRole) =>
    ["ADMIN", "TECHNICO", "ASSISTANTE", "CHEF_CHANTIER"].includes(role),

  // Portail fournisseur
  canAccessSupplierOrders: (role: UserRole) =>
    role === "FOURNISSEUR",

  canAccessSubcontractorPortal: (role: UserRole) =>
    role === "SOUS_TRAITANT",
};
