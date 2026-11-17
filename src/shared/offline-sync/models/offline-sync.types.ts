/**
 * Types et interfaces pour le module Envoi Différé Hors-Ligne (Offline Queue).
 * Socle Binôme 1B — #4618
 */

export type UploadFileType = "photo" | "scan" | "rapport" | "signature" | "audio";

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface QueueItem {
  /** Identifiant unique de l'envoi (UUID) */
  id: string;
  /** Catégorie de fichier */
  type: UploadFileType;
  /** Nom du fichier avec extension (ex: "devis_signe_DEV-2026-0042.pdf") */
  fileName: string;
  /** Chemin local vers le fichier (file:// ou URI) */
  fileUri: string;
  /** Taille en octets */
  fileSize: number;
  /** Type MIME (ex: "application/pdf", "image/jpeg") */
  mimeType: string;
  /** Empreinte de contenu pour la protection contre les doublons */
  checksum: string;
  /** Route API cible (ex: "/api/v1/devis/42/signature-papier") */
  endpoint: string;
  /** Méthode HTTP (POST par défaut) */
  httpMethod: "POST" | "PUT" | "PATCH";
  /** Nom du champ multipart/form-data attendu par le backend (ex: "fichier", "photos", "audio") */
  fieldName: string;
  /** Données textuelles associées (ex: devisId, notes, chantierId) */
  payload?: Record<string, unknown>;
  /** Statut actuel dans la file d'attente */
  status: UploadStatus;
  /** Nombre de tentatives déjà effectuées */
  attempts: number;
  /** Nombre maximal de tentatives avant blocage en erreur (défaut : 5) */
  maxAttempts: number;
  /** Horodatage de la dernière tentative */
  lastAttemptAt?: number | null;
  /** Horodatage calculé pour la prochaine tentative (backoff exponentiel) */
  nextAttemptAt?: number | null;
  /** Message d'erreur explicatif lors du dernier échec */
  lastError?: string | null;
  /** Date de création (mise en file) */
  createdAt: number;
  /** Date de dernière modification */
  updatedAt: number;
}

export interface AddQueueItemParams {
  type: UploadFileType;
  fileName: string;
  fileUri: string;
  fileSize: number;
  mimeType: string;
  endpoint: string;
  httpMethod?: "POST" | "PUT" | "PATCH";
  fieldName?: string;
  payload?: Record<string, unknown>;
  /** Optionnel : calculé automatiquement si omis */
  checksum?: string;
  maxAttempts?: number;
}

export interface QueueStats {
  total: number;
  pending: number;
  uploading: number;
  error: number;
  success: number;
}

export type FileValidationResult =
  | { valid: true }
  | { valid: false; error: string; reason: string };

export interface FileValidationRules {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes: number;
  categoryLabel: string;
}
