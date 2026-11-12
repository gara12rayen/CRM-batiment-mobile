/**
 * Types et interfaces pour le module Lecture QR Code — Socle Binôme 1B.
 *
 * Formats supportés pour le QR code imprimé sur un devis :
 *  1. Texte standard : "DEV-2026-0042 - v2" ou "N° DEV-2026-0042 – v2"
 *  2. JSON structuré : { id?, reference: "DEV-2026-0042", version: 2, securityCode? }
 */

/**
 * Résultat structuré après lecture et validation réussie d'un QR code de devis.
 */
export interface DevisQRData {
  /** Chaîne brute lue par le scanner */
  rawValue: string;
  /** Identifiant backend du devis (si présent dans un QR JSON) */
  id?: string;
  /** Référence complète du devis (ex: "DEV-2026-0042") */
  reference: string;
  /** Année extraite (ex: 2026) */
  year: number;
  /** Numéro séquentiel du devis (ex: 42) */
  sequentialNumber: number;
  /** Version du devis (ex: 2) */
  version: number;
  /** Code de sécurité du QR code (si présent) */
  securityCode?: string;
}

/**
 * Résultat de la validation d'un QR code.
 */
export type QRValidationResult =
  | { valid: true; data: DevisQRData }
  | { valid: false; error: QRValidationError };

export type QRValidationErrorCode =
  | "EMPTY_DATA"
  | "FORMAT_INVALID"
  | "REFERENCE_INVALID"
  | "VERSION_MISSING"
  | "NOT_A_DEVIS";

export interface QRValidationError {
  code: QRValidationErrorCode;
  message: string;
  userMessage: string;
}

/**
 * Statut de la procédure de scan.
 */
export type ScanStatus =
  | "idle"
  | "scanning"
  | "validating"
  | "success"
  | "error"
  | "fallback";

/**
 * Callback invoqué lorsque l'écran de scan produit un résultat.
 * Utilisé par les écrans appelants (ex: Binôme 4B — ScanDevisSigné).
 */
export interface QRScanCallbacks {
  /** Appelé avec les données structurées du devis quand le QR est valide */
  onDevisScanned: (data: DevisQRData) => void;
  /** Appelé lorsque l'utilisateur appuie sur « QR code illisible » */
  onFallback: () => void;
  /** Appelé si l'utilisateur ferme / annule l'écran de scan */
  onCancel?: () => void;
}

/**
 * Options de configuration du composant de scan.
 */
export interface QRScannerOptions {
  /** Titre affiché en haut de l'écran (par défaut: "Scanner le QR code du devis") */
  title?: string;
  /** Sous-titre d'instruction */
  instruction?: string;
  /** Autoriser la fermeture / annulation */
  allowCancel?: boolean;
  /** Activer le mode simulation (version d'essai sans caméra native) */
  mockMode?: boolean;
}
