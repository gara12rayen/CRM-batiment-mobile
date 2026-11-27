# CRM Bâtiment Mobile

Application Android React Native avec Expo Router et TypeScript. Le projet suit une organisation Feature-Based + MVVM ; plusieurs écrans restent des squelettes de navigation et le backend est externe.

## Démarrage

1. Installer Node.js, npm, Android Studio et le SDK Android, puis démarrer un émulateur ou connecter un appareil Android.
2. Installer les dépendances : `npm install`.
3. Copier `.env.example` vers `.env` et renseigner `EXPO_PUBLIC_API_URL` avec l'adresse HTTPS de l'API accessible par l'appareil.
4. Lancer la compilation et l'application Android : `npm run android`. Pour utiliser Expo Go à la place, lancer `npx expo start --android`.

Pour un backend local sur l'émulateur Android, l'adresse de l'ordinateur est `10.0.2.2` et non `localhost`. Android peut bloquer le HTTP non chiffré dans une application compilée ; utilisez HTTPS. `EXPO_PUBLIC_APP_URL` reste facultative pour le lien externe proposé aux profils sans accès mobile.

L'identifiant Android généré pour le développement est `com.troislmsolutions.crmbatimentmobile` ; il doit être confirmé avant une publication.

Vérifications : `npm run typecheck`, `npm run lint`, `npm run test:access`, `npm run test:signature` et `npx expo export --platform android`.

Voir [docs/architecture.md](docs/architecture.md), [docs/api.md](docs/api.md) et [docs/git-workflow.md](docs/git-workflow.md).
