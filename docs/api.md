# API

Ce dépôt ne contient pas de backend. `src/core/api/api-client.ts` fournit un point d'entrée HTTP minimal et `api-endpoints.ts` centralise des chemins indicatifs à aligner sur l'API existante.

Configurer `EXPO_PUBLIC_API_URL` dans un fichier `.env` local à partir de `.env.example`. Les variables `EXPO_PUBLIC_*` sont intégrées à l'application mobile et ne doivent donc jamais contenir de secret. Les jetons privés doivent être conservés dans un stockage côté serveur ; les données de session sur l'appareil peuvent utiliser `src/core/storage/secure-storage.ts`.

Le client signale une URL absente ou une réponse HTTP non réussie au code appelant. Les contrats de requêtes/réponses et l'authentification seront définis avec l'API réelle.

## Partie 2 — lot 2 (19/11/2026)

- Signature sur place : `GET/PUT /auth/me/signature`, `POST /devis/:id/signer-sur-place`, `POST /devis/:id/demander-signature`
- Devis IA : `POST /devis/:id/ia/proposer`, `…/ia/proposer-photo` (multipart `photos`, 3 max), `…/ia/transcrire` (multipart `audio`), `…/ia/appliquer`
- Rappel de la demande : `GET /demandes-devis/:id`, fichiers `GET /fichiers/:id/contenu` (avec le jeton)
- Accueil commercial : `GET /dashboard/commercial`, `POST /demandes-devis/:id/convertir-en-devis`
- Lecture de plan (OCR) : simulée dans `src/features/devis-ia/services/planOcr.service.ts` (aucune route API pour l’instant)
