# CRM Bâtiment Mobile

Application mobile React Native avec Expo Router et TypeScript. Le projet suit une organisation Feature-Based + MVVM ; les écrans présents sont des squelettes de navigation, sans fonctionnalités métier ni backend.

## Démarrage

1. Installer Node.js (LTS) et npm.
2. Installer les dépendances : `npm install`.
3. Copier `.env.example` vers `.env` et renseigner `EXPO_PUBLIC_API_URL` lorsqu'une API est disponible.
4. Lancer Expo : `npx expo start`.

Scannez le QR code avec Expo Go, ou utilisez `npm run android`, `npm run ios` ou `npm run web`. La compilation TypeScript se vérifie avec `npm run typecheck`.

Voir [docs/architecture.md](docs/architecture.md), [docs/api.md](docs/api.md) et [docs/git-workflow.md](docs/git-workflow.md).
