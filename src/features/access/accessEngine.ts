import type {
  AccessDenyCode,
  AccessProfile,
  AccessUser,
  ChantierMode,
  CompanyType,
  Permission,
  UserRole,
} from "./access.types.ts";
import {
  CHANTIER_MODES,
  COMPANY_TYPES,
  MOBILE_ROLES,
  USER_ROLES,
} from "./access.types.ts";
import { APP_MENU_CATALOG, CHANTIER_SECTION_CATALOG, ROLE_TAB_ORDER } from "./menuCatalog.ts";
import { applyChantierMode, ROLE_COMPANY_PERMISSIONS } from "./rightsMatrix.ts";

const COMPANY_ALIASES: Record<string, CompanyType> = {
  GENERALE: "GENERALE",
  ENTREPRISE_GENERALE: "GENERALE",
  SPECIALISEE: "SPECIALISEE",
  SPECIALISE: "SPECIALISEE",
  SOUS_TRAITANCE: "SOUS_TRAITANCE",
  SOUS_TRAITANT: "SOUS_TRAITANCE",
  FOURNISSEUR: "FOURNISSEUR",
};

const MODE_ALIASES: Record<string, ChantierMode> = {
  TRAVAUX_PROPRES: "TRAVAUX_PROPRES",
  DIRECT: "TRAVAUX_PROPRES",
  PROPRE: "TRAVAUX_PROPRES",
  SOUS_TRAITANCE: "SOUS_TRAITANCE",
  MIXTE: "MIXTE",
};

const DENY_MESSAGES: Record<AccessDenyCode, string> = {
  ROLE_WEB_ONLY:
    "Votre rôle se gère depuis la version web sur ordinateur. L’application mobile n’est pas disponible pour ce profil.",
  COMPANY_NO_MOBILE:
    "Le type d’entreprise de votre compte n’ouvre pas l’application mobile. Utilisez la version web.",
  MODULE_FORBIDDEN:
    "Cet écran n’est pas inclus dans votre périmètre. Contactez un administrateur si vous pensez qu’il s’agit d’une erreur.",
  SESSION_REQUIRED: "Connectez-vous pour accéder à l’application.",
};

export function denyMessage(code: AccessDenyCode, moduleLabel?: string): string {
  if (code === "MODULE_FORBIDDEN" && moduleLabel) {
    return `Vous n’avez pas accès à ${moduleLabel}. Cet élément est hors du périmètre de votre rôle ou de votre entreprise.`;
  }
  return DENY_MESSAGES[code];
}

function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

function isMobileRole(value: UserRole): value is (typeof MOBILE_ROLES)[number] {
  return (MOBILE_ROLES as readonly string[]).includes(value);
}

export function normalizeRole(value: string | null | undefined): UserRole | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return isUserRole(normalized) ? normalized : null;
}

export function normalizeCompanyType(
  value: string | null | undefined,
): CompanyType {
  if (!value) {
    return "GENERALE";
  }
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return COMPANY_ALIASES[normalized] ?? (COMPANY_TYPES.includes(normalized as CompanyType) ? (normalized as CompanyType) : "GENERALE");
}

export function normalizeChantierMode(
  value: string | null | undefined,
): ChantierMode {
  if (!value) {
    return "MIXTE";
  }
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return MODE_ALIASES[normalized] ?? (CHANTIER_MODES.includes(normalized as ChantierMode) ? (normalized as ChantierMode) : "MIXTE");
}

export function contextFromUser(user: AccessUser | null): {
  role: UserRole | null;
  companyType: CompanyType;
  chantierMode: ChantierMode;
} {
  return {
    role: normalizeRole(user?.role ?? null),
    companyType: normalizeCompanyType(user?.company?.type),
    chantierMode: normalizeChantierMode(
      user?.company?.chantierMode ?? user?.company?.modeChantier,
    ),
  };
}

export function hasPermission(
  permissions: readonly Permission[],
  permission: Permission,
): boolean {
  return permissions.includes(permission);
}

export function resolveAccess(user: AccessUser | null): AccessProfile {
  if (!user) {
    return emptyProfile("SESSION_REQUIRED");
  }

  const { role, companyType, chantierMode } = contextFromUser(user);

  if (!role) {
    return emptyProfile("ROLE_WEB_ONLY", { companyType, chantierMode });
  }

  if (role === "ASSISTANTE" || role === "FOURNISSEUR") {
    return emptyProfile("ROLE_WEB_ONLY", { role, companyType, chantierMode });
  }

  if (!isMobileRole(role)) {
    return emptyProfile("ROLE_WEB_ONLY", { role, companyType, chantierMode });
  }

  if (companyType === "FOURNISSEUR") {
    return emptyProfile("COMPANY_NO_MOBILE", { role, companyType, chantierMode });
  }

  const base = ROLE_COMPANY_PERMISSIONS[role][companyType];
  if (base.length === 0) {
    return emptyProfile("COMPANY_NO_MOBILE", { role, companyType, chantierMode });
  }

  const permissions = applyChantierMode(role, chantierMode, base);
  const order = ROLE_TAB_ORDER[role];
  const menus = APP_MENU_CATALOG.filter((item) =>
    hasPermission(permissions, item.permission),
  );
  const tabs = order
    .map((id) => menus.find((item) => item.id === id && item.placement === "tab"))
    .filter((item): item is (typeof menus)[number] => Boolean(item));
  const chantierSections = CHANTIER_SECTION_CATALOG.filter((section) =>
    hasPermission(permissions, section.permission),
  );

  return {
    role,
    companyType,
    chantierMode,
    canUseApp: hasPermission(permissions, "mobile.use"),
    canSeePrices: hasPermission(permissions, "prices.view"),
    denyCode: null,
    denyMessage: null,
    permissions,
    menus,
    tabs,
    chantierSections,
  };
}

function emptyProfile(
  denyCode: AccessDenyCode,
  context?: {
    role?: UserRole | null;
    companyType?: CompanyType;
    chantierMode?: ChantierMode;
  },
): AccessProfile {
  return {
    role: context?.role ?? null,
    companyType: context?.companyType ?? "GENERALE",
    chantierMode: context?.chantierMode ?? "MIXTE",
    canUseApp: false,
    canSeePrices: false,
    denyCode,
    denyMessage: denyMessage(denyCode),
    permissions: [],
    menus: [],
    tabs: [],
    chantierSections: [],
  };
}

export function resolveDefaultTabHref(profile: AccessProfile): string {
  return profile.tabs[0]?.tabHref ?? profile.tabs[0]?.href ?? "/(auth)/login";
}
