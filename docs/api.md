# API

Ce dépôt ne contient pas de backend. `src/core/api/api-client.ts` fournit un point d'entrée HTTP minimal et `api-endpoints.ts` centralise des chemins indicatifs à aligner sur l'API existante.

Configurer `EXPO_PUBLIC_API_URL` dans un fichier `.env` local à partir de `.env.example`. Les variables `EXPO_PUBLIC_*` sont intégrées à l'application mobile et ne doivent donc jamais contenir de secret. Les jetons privés doivent être conservés dans un stockage côté serveur ; les données de session sur l'appareil peuvent utiliser `src/core/storage/secure-storage.ts`.

Le client signale une URL absente ou une réponse HTTP non réussie au code appelant. Les contrats de requêtes/réponses et l'authentification seront définis avec l'API réelle.
