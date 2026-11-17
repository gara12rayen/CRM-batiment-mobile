import type {
  FileValidationResult,
  FileValidationRules,
  UploadFileType,
} from "../models/offline-sync.types";

/**
 * Règles de validation métier par catégorie de document.
 * Conforme aux spécifications du CRM Bâtiment (API-ENDPOINTS.txt & CDC).
 */
export const FILE_VALIDATION_RULES: Record<UploadFileType, FileValidationRules> = {
  photo: {
    categoryLabel: "une photo de chantier",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 10 * 1024 * 1024, // 10 Mo
  },
  scan: {
    categoryLabel: "un scan de document / devis",
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 25 * 1024 * 1024, // 25 Mo
  },
  rapport: {
    categoryLabel: "un rapport d'intervention",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "text/plain",
    ],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".txt"],
    maxSizeBytes: 25 * 1024 * 1024, // 25 Mo
  },
  signature: {
    categoryLabel: "une preuve de signature",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
    allowedExtensions: [".png", ".jpg", ".jpeg", ".webp", ".pdf"],
    maxSizeBytes: 5 * 1024 * 1024, // 5 Mo
  },
  audio: {
    categoryLabel: "une note vocale",
    allowedMimeTypes: [
      "audio/m4a",
      "audio/mp4",
      "audio/mpeg",
      "audio/wav",
      "audio/webm",
      "audio/x-m4a",
    ],
    allowedExtensions: [".m4a", ".mp3", ".wav", ".webm", ".aac"],
    maxSizeBytes: 15 * 1024 * 1024, // 15 Mo
  },
};

/**
 * Formate une taille en octets vers une chaîne lisible (Ko, Mo).
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 Ko";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Octets", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Extrait l'extension d'un nom de fichier (en minuscules avec le point).
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

/**
 * Valide le type et la taille d'un fichier avant ajout à la file d'attente.
 * Renvoie un message clair et explicite en cas de refus.
 */
export function validateFileForQueue(params: {
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: UploadFileType;
}): FileValidationResult {
  const { fileName, fileSize, mimeType, type } = params;
  const rules = FILE_VALIDATION_RULES[type];

  // 1. Contrôle fichier vide
  if (!fileSize || fileSize <= 0) {
    return {
      valid: false,
      error: "FICHIER_VIDE",
      reason: `Le fichier sélectionné « ${fileName} » est vide (0 octets).`,
    };
  }

  // 2. Contrôle de taille maximale
  if (fileSize > rules.maxSizeBytes) {
    const currentSizeStr = formatBytes(fileSize);
    const maxSizeStr = formatBytes(rules.maxSizeBytes);
    return {
      valid: false,
      error: "TAILLE_DEPASSEE",
      reason: `Fichier trop volumineux (${currentSizeStr}). La taille maximale autorisée pour ${rules.categoryLabel} est de ${maxSizeStr}.`,
    };
  }

  // 3. Contrôle d'extension et de type MIME
  const ext = getFileExtension(fileName);
  const isExtensionAllowed = rules.allowedExtensions.includes(ext);
  const isMimeAllowed = rules.allowedMimeTypes.some(
    (allowed) =>
      allowed.toLowerCase() === mimeType.toLowerCase() ||
      mimeType.toLowerCase().startsWith(allowed.split("/")[0]),
  );

  if (!isExtensionAllowed && !isMimeAllowed) {
    const acceptedList = rules.allowedExtensions
      .map((e) => e.replace(".", "").toUpperCase())
      .join(", ");
    return {
      valid: false,
      error: "TYPE_NON_SUPPORTE",
      reason: `Le format « ${ext || mimeType} » n'est pas autorisé pour ${rules.categoryLabel}. Formats acceptés : ${acceptedList}.`,
    };
  }

  return { valid: true };
}
