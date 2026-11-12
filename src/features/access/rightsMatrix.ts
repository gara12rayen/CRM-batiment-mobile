import type { CompanyType, MobileRole, Permission } from "./access.types.ts";

const ADMIN_PERMISSIONS: Permission[] = [
  "mobile.use",
  "dashboard",
  "profile",
  "signature",
  "devis.read",
  "devis.write",
  "chantiers.read",
  "chantiers.write",
  "chantiers.planning",
  "chantiers.reports",
  "chantiers.photos",
  "clients.read",
  "clients.write",
  "factures.read",
  "factures.write",
  "sav.read",
  "sav.write",
  "catalogue.read",
  "catalogue.write",
  "prices.view",
];

const TECHNICO_PERMISSIONS: Permission[] = [
  "mobile.use",
  "profile",
  "signature",
  "demandes.read",
  "demandes.write",
  "clients.read",
  "clients.write",
  "devis.read",
  "devis.write",
  "catalogue.read",
  "catalogue.write",
  "factures.read",
  "chantiers.read",
  "prices.view",
];

const CHEF_PERMISSIONS: Permission[] = [
  "mobile.use",
  "profile",
  "chantiers.read",
  "chantiers.write",
  "planning",
  "chantiers.planning",
  "validation",
  "chantiers.photos",
  "chantiers.pointages",
  "chantiers.reports",
];

const SOUS_TRAITANT_PERMISSIONS: Permission[] = [
  "mobile.use",
  "dashboard",
  "profile",
  "chantiers.read",
  "heures",
  "chantiers.hours",
  "photos",
  "chantiers.photos",
];

function forCompanies(permissions: Permission[]): Record<CompanyType, Permission[]> {
  return {
    GENERALE: permissions,
    SPECIALISEE: permissions,
    SOUS_TRAITANCE: permissions,
    FOURNISSEUR: [],
  };
}

export const ROLE_COMPANY_PERMISSIONS: Record<
  MobileRole,
  Record<CompanyType, Permission[]>
> = {
  ADMIN: forCompanies(ADMIN_PERMISSIONS),
  TECHNICO: forCompanies(TECHNICO_PERMISSIONS),
  CHEF_CHANTIER: forCompanies(CHEF_PERMISSIONS),
  SOUS_TRAITANT: forCompanies(SOUS_TRAITANT_PERMISSIONS),
};

/** Le sous-traitant n’a jamais accès aux prix, quel que soit le mode de chantier. */
export function applyChantierMode(
  role: MobileRole,
  _mode: string,
  permissions: Permission[],
): Permission[] {
  if (role !== "SOUS_TRAITANT") {
    return permissions;
  }

  return permissions.filter(
    (permission) =>
      permission !== "prices.view" &&
      permission !== "devis.read" &&
      permission !== "devis.write" &&
      permission !== "catalogue.read" &&
      permission !== "catalogue.write" &&
      permission !== "factures.read" &&
      permission !== "factures.write",
  );
}
