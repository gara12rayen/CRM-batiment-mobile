import type {
  DevisQRData,
  QRValidationError,
  QRValidationErrorCode,
  QRValidationResult,
} from "../models/qr-code.types";

/**
 * Formats reconnus :
 *  - "DEV-2026-0042 - v1"
 *  - "N° DEV-2026-0042 – v2" (tiret court '-' ou tiret cadratin '–', avec ou sans "N°")
 */
const DEVIS_QR_REGEX = /^(?:N°\s*)?DEV-(\d{4})-(\d{4,})\s*[-–]\s*v(\d+)$/i;
const DEVIS_PARTIAL_REGEX = /^(?:N°\s*)?DEV-(\d{4})-(\d{4,})$/i;
const REFERENCE_ONLY_REGEX = /^DEV-(\d{4})-(\d{4,})$/i;

/**
 * Données de démonstration pour le mode simulation (version d'essai CDC).
 */
const MOCK_QR_VALUES = [
  "DEV-2026-0042 - v1",
  "DEV-2026-0108 - v2",
  '{"id":"devis-007","reference":"DEV-2025-0007","version":3,"securityCode":"SEC-89A1"}',
  "DEV-2026-1234 - v1",
];

class QRCodeService {
  private isMockMode: boolean = false;

  setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  getIsMockMode(): boolean {
    return this.isMockMode;
  }

  /**
   * Valide et parse une chaîne brute issue du scanner QR.
   * Supporte le format texte officiel (DEV-AAAA-XXXX - vN) ainsi que le JSON structuré.
   */
  validateQRData(rawValue: string): QRValidationResult {
    // 1. Vérifier que la chaîne n'est pas vide
    if (!rawValue || rawValue.trim().length === 0) {
      return {
        valid: false,
        error: this.createError(
          "EMPTY_DATA",
          "La valeur scannée est vide.",
          "Le QR code scanné ne contient aucune donnée. Veuillez réessayer avec un QR code valide.",
        ),
      };
    }

    const trimmed = rawValue.trim();

    // 2. Support du format JSON structuré (ex: { id, reference, version, securityCode })
    if (trimmed.startsWith("{")) {
      return this.validateJsonQR(trimmed);
    }

    // 3. Vérifier que c'est bien un devis (commence par DEV ou N° DEV)
    const upper = trimmed.toUpperCase();
    if (!upper.startsWith("DEV") && !upper.startsWith("N° DEV") && !upper.startsWith("N°DEV")) {
      return {
        valid: false,
        error: this.createError(
          "NOT_A_DEVIS",
          `QR code non reconnu : "${trimmed}".`,
          "Ce QR code ne correspond pas à un devis CRM Bâtiment. Vérifiez que vous scannez bien le QR code imprimé sur le devis.",
        ),
      };
    }

    // 4. Tenter le parsing du format complet
    const match = trimmed.match(DEVIS_QR_REGEX);

    if (!match) {
      // Vérifier si c'est un format partiel (référence sans version)
      const partialMatch = trimmed.match(DEVIS_PARTIAL_REGEX);

      if (partialMatch) {
        return {
          valid: false,
          error: this.createError(
            "VERSION_MISSING",
            `Version manquante dans "${trimmed}".`,
            "La référence du devis a été détectée, mais le numéro de version est absent. Le format attendu est : DEV-AAAA-XXXX - vN (exemple : DEV-2026-0042 - v1).",
          ),
        };
      }

      return {
        valid: false,
        error: this.createError(
          "FORMAT_INVALID",
          `Format non conforme : "${trimmed}".`,
          "Le QR code a été lu, mais son format ne correspond pas au standard des devis. Le format attendu est : DEV-AAAA-XXXX - vN (exemple : DEV-2026-0042 - v1).",
        ),
      };
    }

    const year = parseInt(match[1], 10);
    const sequentialNumber = parseInt(match[2], 10);
    const version = parseInt(match[3], 10);

    return this.buildValidatedDevis({
      rawValue: trimmed,
      year,
      sequentialNumber,
      version,
      yearStr: match[1],
      seqStr: match[2],
    });
  }

  private validateJsonQR(trimmed: string): QRValidationResult {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      const ref = typeof parsed.reference === "string" ? parsed.reference.trim() : "";

      if (!ref) {
        return {
          valid: false,
          error: this.createError(
            "NOT_A_DEVIS",
            "Objet JSON sans référence de devis.",
            "Ce QR code ne contient pas de référence de devis valide.",
          ),
        };
      }

      const refMatch = ref.match(REFERENCE_ONLY_REGEX);
      if (!refMatch) {
        return {
          valid: false,
          error: this.createError(
            "FORMAT_INVALID",
            `Référence invalide dans le QR JSON : "${ref}".`,
            "La référence du devis contenue dans le QR code est invalide (format attendu : DEV-AAAA-XXXX).",
          ),
        };
      }

      const rawVersion = parsed.version;
      const version =
        typeof rawVersion === "number"
          ? rawVersion
          : typeof rawVersion === "string"
            ? parseInt(rawVersion.replace(/^v/i, ""), 10)
            : NaN;

      if (!Number.isInteger(version) || version < 1) {
        return {
          valid: false,
          error: this.createError(
            "VERSION_MISSING",
            "Numéro de version absent ou invalide dans le QR JSON.",
            "Le numéro de version du devis est manquant ou invalide dans le QR code.",
          ),
        };
      }

      return this.buildValidatedDevis({
        rawValue: trimmed,
        id: typeof parsed.id === "string" ? parsed.id : undefined,
        securityCode:
          typeof parsed.securityCode === "string" ? parsed.securityCode : undefined,
        year: parseInt(refMatch[1], 10),
        sequentialNumber: parseInt(refMatch[2], 10),
        version,
        yearStr: refMatch[1],
        seqStr: refMatch[2],
      });
    } catch {
      return {
        valid: false,
        error: this.createError(
          "FORMAT_INVALID",
          `JSON malformé : "${trimmed}".`,
          "Le QR code lu est corrompu ou malformé. Utilisez « QR code illisible » pour rechercher le devis manuellement.",
        ),
      };
    }
  }

  private buildValidatedDevis(params: {
    rawValue: string;
    id?: string;
    securityCode?: string;
    year: number;
    sequentialNumber: number;
    version: number;
    yearStr: string;
    seqStr: string;
  }): QRValidationResult {
    if (params.year < 2020 || params.year > 2040) {
      return {
        valid: false,
        error: this.createError(
          "REFERENCE_INVALID",
          `Année invalide dans la référence : ${params.year}.`,
          `L'année "${params.year}" dans la référence du devis semble incorrecte. Vérifiez que le document est bien un devis émis par votre entreprise.`,
        ),
      };
    }

    const data: DevisQRData = {
      rawValue: params.rawValue,
      reference: `DEV-${params.yearStr}-${params.seqStr}`.toUpperCase(),
      year: params.year,
      sequentialNumber: params.sequentialNumber,
      version: params.version,
      ...(params.id ? { id: params.id } : {}),
      ...(params.securityCode ? { securityCode: params.securityCode } : {}),
    };

    return { valid: true, data };
  }

  /**
   * Génère une valeur QR simulée aléatoire (version d'essai CDC).
   */
  generateMockQRValue(): string {
    const index = Math.floor(Math.random() * MOCK_QR_VALUES.length);
    return MOCK_QR_VALUES[index];
  }

  /**
   * Génère une valeur QR invalide pour tester les cas d'erreur.
   */
  generateMockInvalidQRValue(
    type: "empty" | "not_devis" | "no_version" | "bad_format",
  ): string {
    switch (type) {
      case "empty":
        return "";
      case "not_devis":
        return "FACT-2026-0012 - v1";
      case "no_version":
        return "DEV-2026-0042";
      case "bad_format":
        return "DEV-26-42-v1";
    }
  }

  private createError(
    code: QRValidationErrorCode,
    message: string,
    userMessage: string,
  ): QRValidationError {
    return { code, message, userMessage };
  }
}

export const qrCodeService = new QRCodeService();
