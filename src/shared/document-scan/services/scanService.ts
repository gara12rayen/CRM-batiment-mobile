import { EdgeDetectionService } from "./edgeDetectionService";
import { PerspectiveCorrectionService } from "./perspectiveCorrectionService";
import { PdfService } from "./pdfService";
import type {
  CompressionLevel,
  DocumentFilterType,
  ScanPdfResult,
  ScannedPage,
} from "../models/document-scan.types";

/**
 * Service orchestrateur de numérisation de documents multi-pages.
 * Fournit également un générateur de pages de simulation (Devis bâtiment réaliste 3 pages)
 * pour la version d'essai (CDC).
 */
export class ScanService {
  /**
   * Crée une page numérisée à partir d'une image brute avec détection automatique des bords.
   */
  static async createPageFromUri(
    uri: string,
    pageNumber: number,
    options: {
      imageWidth?: number;
      imageHeight?: number;
      filter?: DocumentFilterType;
    } = {}
  ): Promise<ScannedPage> {
    const width = options.imageWidth || 1200;
    const height = options.imageHeight || 1600;
    const filter = options.filter || "bw_enhanced";

    // 1. Détection automatique des bords (OpenCV-like)
    const { corners, confidence } = EdgeDetectionService.detectCorners(width, height);

    // 2. Traitement initial & redressement de perspective
    const processedUri = await PerspectiveCorrectionService.processImage(
      uri,
      corners,
      0,
      filter
    );

    const id = `scan_page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id,
      pageNumber,
      originalUri: uri,
      processedUri,
      corners,
      filter,
      rotation: 0,
      width,
      height,
      detectedConfidence: confidence,
      createdAt: Date.now(),
    };
  }

  /**
   * Génère des pages de simulation réalistes d'un devis de rénovation bâtiment
   * (Page 1 : Devis en-tête & coordonnées, Page 2 : Détail des postes gros-œuvre, Page 3 : Mentions légales & Signature client).
   */
  static getMockDevisPages(): ScannedPage[] {
    const pagesDef = [
      {
        pageNumber: 1,
        title: "Devis N° DEV-2026-0842 - Page 1/3 (En-tête & Lot Maçonnerie)",
        color: "#2563EB",
        badge: "LOT 01 - GROS ŒUVRE",
        contentLines: [
          "ENTREPRISE : BATIMENT MODERNE PRO SAS",
          "CLIENT : SCI IMMOBILIERE SAINT-LAZARE",
          "CHANTIER : Réhabilitation Immeuble 14 rue de Paris",
          "--------------------------------------------------",
          "1. Démolition cloisons plâtre (85 m²) ...... 2 125,00 €",
          "2. Création trémie escalier béton ......... 4 800,00 €",
          "3. Reprise sous-œuvre poutres IPN ......... 6 450,00 €",
          "4. Coulage chape allégée isolée (110 m²) ... 5 500,00 €",
          "--------------------------------------------------",
          "Sous-total Lot 01 HT : ................... 18 875,00 €",
        ],
      },
      {
        pageNumber: 2,
        title: "Devis N° DEV-2026-0842 - Page 2/3 (Menuiserie & Électricité)",
        color: "#059669",
        badge: "LOT 02 - FINITIONS",
        contentLines: [
          "5. Pose 6 fenêtres PVC double vitrage ...... 5 400,00 €",
          "6. Porte d'entrée blindée A2P BP1 ......... 2 850,00 €",
          "7. Rénovation tableau électrique NF C15-100 . 3 200,00 €",
          "8. Câblage RJ45 et appareillage Legrand .... 1 950,00 €",
          "--------------------------------------------------",
          "Sous-total Lot 02 HT : ................... 13 400,00 €",
          "TOTAL GENERAL HT : ....................... 32 275,00 €",
          "TVA 10% (Rénovation éligible) : ........... 3 227,50 €",
          "TOTAL TTC : .............................. 35 502,50 €",
        ],
      },
      {
        pageNumber: 3,
        title: "Devis N° DEV-2026-0842 - Page 3/3 (Bon pour accord & Signature)",
        color: "#DC2626",
        badge: "SIGNATURE MANUSCRITE",
        contentLines: [
          "MODALITES : Acompte 30% à la commande, solde à réception.",
          "DELAI D'EXECUTION : 6 semaines à compter du 01/12/2026.",
          "--------------------------------------------------",
          "Mention manuscrite du client :",
          "« BON POUR ACCORD ET EXECUTION DES TRAVAUX »",
          "",
          "[ Tampon Entreprise ]         [ Signature Client & Paraphe ]",
          "  Batiment Moderne               Jean-Marc DUPONT",
          "  21/11/2026                     Fait à Paris, le 21/11/2026",
        ],
      },
    ];

    const now = Date.now();
    return pagesDef.map((def, idx) => {
      const width = 1200;
      const height = 1600;
      const { corners, confidence } = EdgeDetectionService.detectCorners(width, height, 94 - idx * 2);

      // Génération d'une image SVG data URI ultra-légère et vectorielle
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <rect width="100%" height="100%" fill="#F8FAFC"/>
          <rect x="50" y="50" width="1100" height="1500" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4"/>
          <rect x="90" y="90" width="1020" height="120" rx="8" fill="#1E293B"/>
          <text x="120" y="160" fill="#FFFFFF" font-family="sans-serif" font-size="34" font-weight="bold">3LM SOLUTIONS - CRM BATIMENT</text>
          <rect x="880" y="125" width="200" height="50" rx="6" fill="${def.color}"/>
          <text x="980" y="157" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">${def.badge}</text>
          
          <text x="120" y="270" fill="#0F172A" font-family="sans-serif" font-size="28" font-weight="bold">${def.title}</text>
          
          ${def.contentLines
            .map(
              (line, lIdx) =>
                `<text x="120" y="${340 + lIdx * 45}" fill="${line.includes("TOTAL") || line.includes("BON POUR") ? "#DC2626" : "#334155"}" font-family="monospace" font-size="${line.includes("TOTAL") ? "24" : "21"}" font-weight="${line.includes("TOTAL") ? "bold" : "normal"}">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`
            )
            .join("\n")}
            
          ${
            def.pageNumber === 3
              ? `
            <circle cx="280" cy="850" r="80" fill="none" stroke="#2563EB" stroke-width="5" stroke-dasharray="8 6"/>
            <text x="280" y="855" fill="#2563EB" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">TAMPON VISE</text>
            <path d="M 680 880 Q 740 820 800 870 T 890 850" fill="none" stroke="#1E40AF" stroke-width="6" stroke-linecap="round"/>
            <path d="M 720 900 Q 770 860 840 890" fill="none" stroke="#1E40AF" stroke-width="4" stroke-linecap="round"/>
            `
              : ""
          }

          <rect x="90" y="1460" width="1020" height="2" fill="#CBD5E1"/>
          <text x="120" y="1510" fill="#94A3B8" font-family="sans-serif" font-size="18">Document numérisé via Socle Outils Communs (Module 5) - Page ${def.pageNumber}/3</text>
        </svg>
      `;

      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

      return {
        id: `mock_page_${idx + 1}_${now}`,
        pageNumber: def.pageNumber,
        originalUri: dataUri,
        processedUri: dataUri,
        corners,
        filter: "bw_enhanced",
        rotation: 0,
        width,
        height,
        detectedConfidence: confidence,
        createdAt: now - (3 - idx) * 30000,
      };
    });
  }

  /**
   * Envoie le résultat PDF dans la file d'attente d'envoi différé hors-ligne (Module 4).
   */
  static async queuePdfForOfflineSync(
    pdfResult: ScanPdfResult,
    options: {
      devisId?: string;
      endpoint?: string;
    } = {}
  ): Promise<{ queueItemId: string; scheduled: boolean }> {
    const endpoint =
      options.endpoint ||
      (options.devisId
        ? `/api/v1/devis/${options.devisId}/signature-papier`
        : `/api/v1/fichiers`);

    // Import dynamique propre du service de la file d'attente hors-ligne (Module 4)
    try {
      const { offlineQueueService } = await import("@/shared/offline-sync");
      const res = await offlineQueueService.enqueueItem({
        type: "scan",
        fileName: pdfResult.fileName,
        fileUri: pdfResult.fileUri,
        fileSize: pdfResult.fileSize,
        mimeType: "application/pdf",
        endpoint,
        fieldName: "fichier",
        payload: {
          pageCount: pdfResult.pageCount,
          compressionLevel: pdfResult.compressionLevel,
          devisId: options.devisId || "DEV-2026-0842",
        },
      });

      return {
        queueItemId: res.item?.id || `queued_${Date.now()}`,
        scheduled: res.success,
      };
    } catch {
      // Fallback si module hors-ligne indisponible
      return { queueItemId: `fallback_${Date.now()}`, scheduled: false };
    }
  }
}
