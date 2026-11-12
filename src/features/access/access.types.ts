export const USER_ROLES = [
  "ADMIN",
  "TECHNICO",
  "CHEF_CHANTIER",
  "SOUS_TRAITANT",
  "ASSISTANTE",
  "FOURNISSEUR",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const MOBILE_ROLES = [
  "ADMIN",
  "TECHNICO",
  "CHEF_CHANTIER",
  "SOUS_TRAITANT",
] as const;

export type MobileRole = (typeof MOBILE_ROLES)[number];

export const COMPANY_TYPES = [
  "GENERALE",
  "SPECIALISEE",
  "SOUS_TRAITANCE",
  "FOURNISSEUR",
] as const;

export type CompanyType = (typeof COMPANY_TYPES)[number];

export const CHANTIER_MODES = [
  "TRAVAUX_PROPRES",
  "SOUS_TRAITANCE",
  "MIXTE",
] as const;

export type ChantierMode = (typeof CHANTIER_MODES)[number];

export const PERMISSIONS = [
  "mobile.use",
  "dashboard",
  "demandes.read",
  "demandes.write",
  "clients.read",
  "clients.write",
  "devis.read",
  "devis.write",
  "chantiers.read",
  "chantiers.write",
  "chantiers.reports",
  "chantiers.photos",
  "chantiers.pointages",
  "chantiers.planning",
  "chantiers.hours",
  "factures.read",
  "factures.write",
  "sav.read",
  "sav.write",
  "catalogue.read",
  "catalogue.write",
  "planning",
  "validation",
  "heures",
  "photos",
  "prices.view",
  "profile",
  "signature",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type AccessDenyCode =
  | "ROLE_WEB_ONLY"
  | "COMPANY_NO_MOBILE"
  | "MODULE_FORBIDDEN"
  | "SESSION_REQUIRED";

export type MenuId =
  | "home"
  | "demandes"
  | "devis"
  | "chantiers"
  | "clients"
  | "factures"
  | "sav"
  | "catalogue"
  | "planning"
  | "validation"
  | "heures"
  | "photos"
  | "profile";

export type AppMenuItem = {
  id: MenuId;
  title: string;
  href: string;
  tabHref?: string;
  placement: "tab" | "stack";
  permission: Permission;
};

export type ChantierSectionId =
  | "overview"
  | "reports"
  | "photos"
  | "pointages"
  | "planning"
  | "hours"
  | "documents";

export type ChantierSection = {
  id: ChantierSectionId;
  title: string;
  permission: Permission;
};

export type AccessUser = {
  role: string;
  company?: {
    type?: string | null;
    chantierMode?: string | null;
    modeChantier?: string | null;
  } | null;
};

export type AccessContext = {
  role: UserRole | null;
  companyType: CompanyType;
  chantierMode: ChantierMode;
};

export type AccessProfile = AccessContext & {
  canUseApp: boolean;
  canSeePrices: boolean;
  denyCode: AccessDenyCode | null;
  denyMessage: string | null;
  permissions: Permission[];
  menus: AppMenuItem[];
  tabs: AppMenuItem[];
  chantierSections: ChantierSection[];
};
