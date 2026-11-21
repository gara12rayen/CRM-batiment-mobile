/**
 * Types et interfaces pour le module Photo et capture d'image (Binôme 1B - Socle Outils Communs).
 * Cible : prise de vue, choix galerie multiple, compression automatique max 500 Ko.
 */

export type CameraFacing = "back" | "front";

export type FlashMode = "off" | "on" | "auto";

export interface PhotoMetadata {
  id: string;
  uri: string;
  originalUri: string;
  fileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatioPercent: number; // ex: 68%
  width: number;
  height: number;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  capturedAt: number;
  source: "camera" | "gallery" | "mock";
  isUnderLimit: boolean; // true si <= 500 Ko
}

export interface CompressionConfig {
  maxSizeBytes: number; // 500 * 1024 = 512 000 octets
  maxDimension: number; // 1920px (résolution Full HD suffisante pour inspection chantier)
  defaultQuality: number; // 0.75 à 0.85
  minQuality: number; // 0.50
}

export interface PhotoCaptureOptions {
  maxPhotos?: number;
  targetMaxSizeBytes?: number;
  allowsMultiple?: boolean;
  enableGrid?: boolean;
  mockMode?: boolean;
  chantierId?: string;
}

export interface PhotoBatchResult {
  photos: PhotoMetadata[];
  totalOriginalSizeBytes: number;
  totalCompressedSizeBytes: number;
  averageCompressionRatio: number;
  allUnderLimit: boolean;
}
