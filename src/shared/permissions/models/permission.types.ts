export type PermissionType = "camera" | "microphone" | "location" | "notifications";

export type PermissionStatus =
  | "undetermined" // Jamais demandé à l'utilisateur
  | "granted"      // Autorisé par l'utilisateur
  | "denied"       // Refusé lors de la demande (peut être redemandé)
  | "blocked";     // Refusé définitivement ("Ne plus demander"), nécessite les réglages

export type PermissionConfig = {
  type: PermissionType;
  title: string;
  shortTitle: string;
  rationale: string;
  features: string[];
  deniedTitle: string;
  deniedMessage: string;
  settingsGuide: {
    ios: string;
    android: string;
  };
  iconName: "camera" | "microphone" | "location" | "bell";
};

export type PermissionRequestOptions = {
  /** Contexte métier spécifique à l'action en cours (ex: "pour numériser ce devis signé") */
  contextReason?: string;
  /** Force l'affichage de la modale explicative avant la boîte de dialogue système */
  showRationaleFirst?: boolean;
};

export type PermissionState = {
  status: PermissionStatus;
  isLoading: boolean;
  canAskAgain: boolean;
  lastCheckedAt?: number;
};

