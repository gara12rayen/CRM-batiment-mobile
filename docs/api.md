# API

Ce dépôt ne contient pas de backend. `src/core/api/api-client.ts` fournit un point d'entrée HTTP minimal et `api-endpoints.ts` centralise des chemins indicatifs à aligner sur l'API existante.

Configurer `EXPO_PUBLIC_API_URL` dans un fichier `.env` local à partir de `.env.example`. Les variables `EXPO_PUBLIC_*` sont intégrées à l'application mobile et ne doivent donc jamais contenir de secret. Les jetons privés doivent être conservés dans un stockage côté serveur ; les données de session sur l'appareil peuvent utiliser `src/core/storage/secure-storage.ts`.

Utiliser une URL HTTPS accessible depuis Android. Pour un serveur local, `localhost` désigne l'appareil ; l'émulateur Android utilise `10.0.2.2` pour accéder à l'ordinateur hôte. Le HTTP en clair peut être bloqué par Android.

Le client ajoute le jeton d'accès conservé dans le Secure Store à chaque requête authentifiée. Comme l'API ne propose pas d'endpoint de renouvellement, une session restaurée au démarrage ou au retour au premier plan est vérifiée avec `GET /auth/me`; un jeton expiré ou une réponse `401` efface la session et redirige vers la connexion.
