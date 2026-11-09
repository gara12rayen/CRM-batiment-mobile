# BÂTIFLOW — Application mobile

##  Lancer le backend web
###  Configurer `backend/.env`

Copier `.env.example` en `.env`, puis renseigner au minimum :

.env
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/crm_batiment
JWT_SECRET=une-longue-chaine-aleatoire
APP_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:8081

> `CORS_ORIGINS` n'est utile que pour tester le mobile dans un navigateur (Expo web, port 8081).

### Première installation

```bash
cd backend
pnpm install
pnpm db:reset     # base de TEST uniquement : efface tout et applique la migration
pnpm db:seed      # entreprise, catalogue et comptes de test
```

PostgreSQL avec Docker (facultatif) : `docker compose up -d` dans le dossier `backend`.

###  Démarrer le backend

```bash
cd backend
pnpm dev
```

## Configurer le mobile

Créer `.env` à la racine du projet mobile :

.env
# navigateur (touche w)
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1

# téléphone (Expo Go) : utiliser cette ligne à la place
# EXPO_PUBLIC_API_URL=http://192.168.1.12:3000/api/v1


Règles :
- l'adresse se termine **toujours** par `/api/v1`
- **jamais** de `DATABASE_URL`, mot de passe ou clé dans ce fichier : tout ce qui commence par `EXPO_PUBLIC_` est lisible dans l'application
- après chaque modification du `.env`, relancer avec `npx expo start -c`

---

## 4. Lancer le mobile

Première installation :

```bash
npm install
npm run typecheck
```

Démarrage :

```bash
npx expo start -c
```

- Téléphone : scanner le QR code avec Expo Go
- Navigateur : touche `w`
- Émulateur Android : touche `a`

---

## Se connecter

Comptes créés par `pnpm db:seed` (mots de passe de test, **jamais en production**) :

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | admin@batiment-pro.fr | Admin@2026! |
| TECHNICO | technico@batiment-pro.fr | Technico@2026! |
| ASSISTANTE | assistante@batiment-pro.fr | Assistante@2026! |
| CHEF_CHANTIER | chef@batiment-pro.fr | Chef@2026! |
| SOUS_TRAITANT | soustraitant@batiment-pro.fr | Soustraitant@2026! |
| FOURNISSEUR | fournisseur@batiment-pro.fr | Fournisseur@2026! |

---

