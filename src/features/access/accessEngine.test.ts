import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AccessUser, ChantierMode, CompanyType, MenuId, UserRole } from "./access.types.ts";
import { CHANTIER_MODES, COMPANY_TYPES, USER_ROLES } from "./access.types.ts";
import { resolveAccess } from "./accessEngine.ts";

function user(
  role: string,
  companyType?: string,
  chantierMode?: string,
): AccessUser {
  return {
    role,
    company: {
      type: companyType,
      chantierMode,
    },
  };
}

function tabIds(role: UserRole, companyType: CompanyType, mode: ChantierMode): MenuId[] {
  return resolveAccess(user(role, companyType, mode)).tabs.map((tab) => tab.id);
}

const ADMIN_TABS: MenuId[] = [
  "home",
  "devis",
  "chantiers",
  "clients",
  "factures",
  "sav",
  "catalogue",
  "profile",
];

const TECHNICO_TABS: MenuId[] = [
  "demandes",
  "clients",
  "devis",
  "catalogue",
  "factures",
  "chantiers",
  "profile",
];

const CHEF_TABS: MenuId[] = ["chantiers", "planning", "validation", "profile"];

const SOUS_TRAITANT_TABS: MenuId[] = ["home", "chantiers", "heures", "photos", "profile"];

describe("moteur d’accès", () => {
  it("refuse une session absente", () => {
    const profile = resolveAccess(null);
    assert.equal(profile.canUseApp, false);
    assert.equal(profile.denyCode, "SESSION_REQUIRED");
    assert.deepEqual(profile.tabs, []);
  });

  it("refuse assistante et fournisseur quel que soit le contexte", () => {
    for (const role of ["ASSISTANTE", "FOURNISSEUR"] as const) {
      for (const companyType of COMPANY_TYPES) {
        for (const mode of CHANTIER_MODES) {
          const profile = resolveAccess(user(role, companyType, mode));
          assert.equal(profile.canUseApp, false, `${role} ${companyType} ${mode}`);
          assert.equal(profile.denyCode, "ROLE_WEB_ONLY");
          assert.deepEqual(profile.tabs.map((tab) => tab.id), []);
        }
      }
    }
  });

  it("refuse tout rôle si l’entreprise est fournisseur", () => {
    for (const role of ["ADMIN", "TECHNICO", "CHEF_CHANTIER", "SOUS_TRAITANT"] as const) {
      const profile = resolveAccess(user(role, "FOURNISSEUR", "MIXTE"));
      assert.equal(profile.canUseApp, false, role);
      assert.equal(profile.denyCode, "COMPANY_NO_MOBILE");
    }
  });

  it("génère les onglets admin : accueil, devis, chantiers, clients, factures, sav, catalogue, profil", () => {
    for (const companyType of ["GENERALE", "SPECIALISEE", "SOUS_TRAITANCE"] as const) {
      for (const mode of CHANTIER_MODES) {
        assert.deepEqual(tabIds("ADMIN", companyType, mode), ADMIN_TABS);
      }
    }
  });

  it("génère les onglets technico : demandes, clients, devis, catalogue, factures lecture, chantier lecture, profil", () => {
    for (const companyType of ["GENERALE", "SPECIALISEE", "SOUS_TRAITANCE"] as const) {
      const profile = resolveAccess(user("TECHNICO", companyType, "MIXTE"));
      assert.deepEqual(profile.tabs.map((tab) => tab.id), TECHNICO_TABS);
      assert.equal(profile.permissions.includes("factures.read"), true);
      assert.equal(profile.permissions.includes("factures.write"), false);
      assert.equal(profile.permissions.includes("chantiers.read"), true);
      assert.equal(profile.permissions.includes("chantiers.write"), false);
      assert.equal(profile.permissions.includes("dashboard"), false);
      assert.equal(profile.canSeePrices, true);
    }
  });

  it("génère les onglets chef de chantier : chantiers, planning, validation, profil", () => {
    const profile = resolveAccess(user("CHEF_CHANTIER", "GENERALE", "MIXTE"));
    assert.deepEqual(profile.tabs.map((tab) => tab.id), CHEF_TABS);
    assert.ok(profile.permissions.includes("validation"));
    assert.ok(profile.permissions.includes("chantiers.photos"));
    assert.ok(profile.permissions.includes("chantiers.pointages"));
    assert.ok(profile.permissions.includes("chantiers.reports"));
    assert.equal(profile.permissions.includes("clients.read"), false);
    assert.equal(profile.permissions.includes("devis.read"), false);
    assert.equal(profile.canSeePrices, false);
  });

  it("génère les onglets sous-traitant sans aucun prix", () => {
    const profile = resolveAccess(user("SOUS_TRAITANT", "GENERALE", "MIXTE"));
    assert.deepEqual(profile.tabs.map((tab) => tab.id), SOUS_TRAITANT_TABS);
    assert.equal(profile.canSeePrices, false);
    assert.equal(profile.permissions.includes("prices.view"), false);
    assert.equal(profile.permissions.includes("devis.read"), false);
    assert.equal(profile.permissions.includes("catalogue.read"), false);
    assert.equal(profile.permissions.includes("factures.read"), false);
    assert.ok(profile.permissions.includes("heures"));
    assert.ok(profile.permissions.includes("photos"));
  });

  it("accorde la signature au personnel commercial uniquement", () => {
    assert.ok(resolveAccess(user("ADMIN", "GENERALE", "MIXTE")).permissions.includes("signature"));
    assert.ok(resolveAccess(user("TECHNICO", "GENERALE", "MIXTE")).permissions.includes("signature"));
    assert.equal(
      resolveAccess(user("CHEF_CHANTIER", "GENERALE", "MIXTE")).permissions.includes("signature"),
      false,
    );
  });

  it("couvre chaque combinaison rôle × type × mode sans lever d’erreur", () => {
    let cases = 0;
    for (const role of USER_ROLES) {
      for (const companyType of COMPANY_TYPES) {
        for (const mode of CHANTIER_MODES) {
          const profile = resolveAccess(user(role, companyType, mode));
          assert.ok(profile);
          assert.equal(Array.isArray(profile.tabs), true);
          cases += 1;
        }
      }
    }
    assert.equal(cases, USER_ROLES.length * COMPANY_TYPES.length * CHANTIER_MODES.length);
  });
});
