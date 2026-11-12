# Tableau des droits (mobile)

Document métier. Il décrit les **menus et onglets** de l’application mobile selon le rôle. La sécurité réelle reste côté API (`@Roles()`).

Le sous-traitant **ne voit jamais les prix** (devis, catalogue, factures, montants de chantier).

## Rôles

| Code API | Libellé | Application mobile |
|---|---|---|
| `ADMIN` | Administrateur | Oui |
| `TECHNICO` | Technico-commercial | Oui |
| `CHEF_CHANTIER` | Chef de chantier | Oui |
| `SOUS_TRAITANT` | Sous-traitant | Oui (chantiers affectés, sans prix) |
| `ASSISTANTE` | Assistante | Non — version web |
| `FOURNISSEUR` | Fournisseur | Non — version web |

## Menus par rôle

### Admin

Accueil (tableau de bord), Devis, Chantiers, Clients, Factures, SAV, Catalogue, Profil.

| Module | Droit |
|---|---|
| Accueil | Lecture |
| Devis | Lecture / écriture |
| Chantiers | Lecture / écriture |
| Clients | Lecture / écriture |
| Factures | Lecture / écriture |
| SAV | Lecture / écriture |
| Catalogue | Lecture / écriture (prix visibles) |
| Profil | Lecture / écriture |

### Technico-commercial

Demandes, Clients, Devis, Catalogue, Factures (lecture seule), Chantiers (lecture), Profil.

| Module | Droit |
|---|---|
| Demandes | Lecture / écriture |
| Clients | Lecture / écriture |
| Devis | Lecture / écriture |
| Catalogue | Lecture / écriture (prix visibles) |
| Factures | **Lecture seule** |
| Chantiers | **Lecture seule** |
| Profil | Lecture / écriture |

Pas d’accueil dédié : le premier onglet est **Demandes**.

### Chef de chantier

Chantiers, Planning, Validation (photos, pointages, rapports), Profil.

| Module | Droit |
|---|---|
| Chantiers | Lecture / écriture (affectés) |
| Planning | Lecture / écriture |
| Validation — photos | Lecture / écriture |
| Validation — pointages | Lecture / écriture |
| Validation — rapports | Lecture / écriture |
| Profil | Lecture / écriture |

Pas d’accès commercial (clients, devis, factures, catalogue, prix).

### Sous-traitant

Accueil, Chantiers, Heures, Photos, Profil. **Jamais de prix.**

| Module | Droit |
|---|---|
| Accueil | Lecture |
| Chantiers | Lecture (affectés, sans montants) |
| Heures | Lecture / écriture |
| Photos | Lecture / écriture |
| Profil | Lecture / écriture |
| Prix / devis / factures / catalogue | **Interdit** |

## Onglets générés

| Onglet | Admin | Technico | Chef chantier | Sous-traitant |
|---|---|---|---|---|
| Accueil | oui | — | — | oui |
| Demandes | — | oui | — | — |
| Devis | oui | oui | — | — |
| Chantiers | oui | oui (L) | oui | oui |
| Clients | oui | oui | — | — |
| Factures | oui | oui (L) | — | — |
| SAV | oui | — | — | — |
| Catalogue | oui | oui | — | — |
| Planning | — | — | oui | — |
| Validation | — | — | oui | — |
| Heures | — | — | — | oui |
| Photos | — | — | — | oui |
| Profil | oui | oui | oui | oui |

L = lecture seule.

## Type d’entreprise et mode de chantier

Les **onglets** suivent le rôle ci-dessus pour les entreprises générale, spécialisée et sous-traitance.

Une entreprise de type **fournisseur**, ou un rôle assistante / fournisseur, n’a pas accès au mobile (écran Accès refusé).

Le mode de chantier (travaux en propre, sous-traitance, mixte) n’ajoute pas d’onglet : il pourra affiner les données d’un chantier sans exposer de prix au sous-traitant.
