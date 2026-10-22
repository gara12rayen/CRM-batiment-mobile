# Architecture mobile

L'application utilise React Native, Expo, TypeScript strict et Expo Router.

- `app/` contient uniquement les routes et layouts Expo Router. Les écrans des onglets et les vues fonctionnelles délèguent vers `src/features/`.
- `src/core/` regroupe les préoccupations transverses : client HTTP, configuration d'environnement, stockage sécurisé et thème.
- `src/shared/` accueillera les composants, hooks, types et utilitaires réutilisables.
- `src/features/` isole les domaines auth, dashboard, clients, prospects, devis, catalogue, chantiers et notifications. Chaque domaine peut contenir `models/`, `views/`, `viewmodels/`, `services/` et `components/` selon le besoin.
- `assets/` est réservé aux images, icônes et polices.

Les écrans actuels sont des placeholders. Dans le flux MVVM, les routes affichent les vues, les vues observent des viewmodels (hooks React), les viewmodels orchestrent les services et les modèles décrivent les données. Les viewmodels/services seront ajoutés avec les besoins métier correspondants.

Les imports `@/` pointent vers `src/`. Aucun backend n'est créé : l'URL d'une API existante est fournie par `EXPO_PUBLIC_API_URL`.
