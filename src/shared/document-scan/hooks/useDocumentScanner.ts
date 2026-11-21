import { useState, useCallback, useMemo } from "react";
import type {
  CompressionLevel,
  DocumentCorners,
  DocumentFilterType,
  DocumentScanOptions,
  ScanPdfResult,
  ScannedPage,
} from "../models/document-scan.types";
import { ScanService } from "../services/scanService";
import { EdgeDetectionService } from "../services/edgeDetectionService";
import { PerspectiveCorrectionService } from "../services/perspectiveCorrectionService";
import { PdfService } from "../services/pdfService";

export function useDocumentScanner(options: DocumentScanOptions = {}) {
  const [pages, setPages] = useState<ScannedPage[]>(() => {
    if (options.mockMode) {
      return ScanService.getMockDevisPages();
    }
    return [];
  });
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [status, setStatus] = useState<
    "idle" | "capturing" | "cropping" | "previewing" | "exporting" | "completed"
  >(options.mockMode ? "previewing" : "idle");
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>(
    options.defaultCompression || "medium"
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfResult, setPdfResult] = useState<ScanPdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPage = useMemo(() => {
    if (pages.length === 0) return null;
    const safeIndex = Math.min(Math.max(0, currentPageIndex), pages.length - 1);
    return pages[safeIndex];
  }, [pages, currentPageIndex]);

  /**
   * Ajoute une nouvelle page scannée
   */
  const addPageFromUri = useCallback(
    async (uri: string) => {
      try {
        setIsProcessing(true);
        setError(null);
        const nextNumber = pages.length + 1;
        const newPage = await ScanService.createPageFromUri(uri, nextNumber, {
          filter: options.defaultFilter || "bw_enhanced",
        });

        setPages((prev) => [...prev, newPage]);
        setCurrentPageIndex(pages.length);
        setStatus("cropping");
      } catch (err: any) {
        setError(err?.message || "Erreur lors de l'ajout de la page");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages.length, options.defaultFilter]
  );

  /**
   * Charge le jeu de démonstration devis 3 pages (version d'essai CDC)
   */
  const loadMockPages = useCallback(() => {
    setIsProcessing(true);
    const mockPages = ScanService.getMockDevisPages();
    setPages(mockPages);
    setCurrentPageIndex(0);
    setStatus("previewing");
    setPdfResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  /**
   * Sélectionne la page active
   */
  const selectPage = useCallback(
    (index: number) => {
      if (index >= 0 && index < pages.length) {
        setCurrentPageIndex(index);
      }
    },
    [pages.length]
  );

  /**
   * Met à jour les 4 coins de recadrage d'une page et recalcule l'aperçu
   */
  const updateCorners = useCallback(
    async (pageId: string, corners: DocumentCorners) => {
      setIsProcessing(true);
      try {
        setPages((prev) =>
          prev.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              corners,
            };
          })
        );

        // Mise à jour de l'image traitée
        const target = pages.find((p) => p.id === pageId);
        if (target) {
          const updatedUri = await PerspectiveCorrectionService.processImage(
            target.originalUri,
            corners,
            target.rotation,
            target.filter
          );
          setPages((prev) =>
            prev.map((p) => (p.id === pageId ? { ...p, processedUri: updatedUri } : p))
          );
        }
      } catch (err: any) {
        setError(err?.message || "Erreur de recadrage");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages]
  );

  /**
   * Réinitialise la détection automatique des bords (OpenCV-like)
   */
  const autoDetectCorners = useCallback(
    (pageId: string) => {
      const target = pages.find((p) => p.id === pageId);
      if (!target) return;
      const { corners, confidence } = EdgeDetectionService.detectCorners(
        target.width,
        target.height
      );
      updateCorners(pageId, corners);
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, detectedConfidence: confidence } : p))
      );
    },
    [pages, updateCorners]
  );

  /**
   * Change le filtre de la page (N&B Contraste, Niveaux de gris, Couleur, Original)
   */
  const applyFilter = useCallback(
    async (pageId: string, filter: DocumentFilterType) => {
      setIsProcessing(true);
      try {
        const target = pages.find((p) => p.id === pageId);
        if (!target) return;

        const updatedUri = await PerspectiveCorrectionService.processImage(
          target.originalUri,
          target.corners,
          target.rotation,
          filter
        );

        setPages((prev) =>
          prev.map((p) => (p.id === pageId ? { ...p, filter, processedUri: updatedUri } : p))
        );
      } catch (err: any) {
        setError(err?.message || "Erreur d'application du filtre");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages]
  );

  /**
   * Pivote la page de 90° dans le sens des aiguilles d'une montre
   */
  const rotatePage = useCallback(
    async (pageId: string) => {
      setIsProcessing(true);
      try {
        const target = pages.find((p) => p.id === pageId);
        if (!target) return;

        const nextRotation = ((target.rotation + 90) % 360) as 0 | 90 | 180 | 270;

        const updatedUri = await PerspectiveCorrectionService.processImage(
          target.originalUri,
          target.corners,
          nextRotation,
          target.filter
        );

        setPages((prev) =>
          prev.map((p) =>
            p.id === pageId ? { ...p, rotation: nextRotation, processedUri: updatedUri } : p
          )
        );
      } catch (err: any) {
        setError(err?.message || "Erreur de rotation");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages]
  );

  /**
   * Supprime une page
   */
  const deletePage = useCallback(
    (pageId: string) => {
      setPages((prev) => {
        const filtered = prev.filter((p) => p.id !== pageId);
        // Réindexation des numéros de page
        return filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      });
      setCurrentPageIndex((prev) => Math.max(0, prev - 1));
    },
    []
  );

  /**
   * Déplace une page dans la liste
   */
  const movePage = useCallback(
    (pageId: string, direction: "prev" | "next") => {
      const idx = pages.findIndex((p) => p.id === pageId);
      if (idx === -1) return;
      const targetIdx = direction === "prev" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= pages.length) return;

      const newPages = [...pages];
      const temp = newPages[idx];
      newPages[idx] = newPages[targetIdx];
      newPages[targetIdx] = temp;

      // Réindexation
      const reindexed = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      setPages(reindexed);
      setCurrentPageIndex(targetIdx);
    },
    [pages]
  );

  /**
   * Assemble toutes les pages en un seul fichier PDF
   */
  const generatePdf = useCallback(
    async (title?: string) => {
      if (pages.length === 0) {
        setError("Aucune page à assembler");
        return null;
      }

      setIsProcessing(true);
      setError(null);
      setStatus("exporting");

      try {
        const result = await PdfService.assemblePdf(pages, {
          compressionLevel,
          title: title || options.title || "Devis_Scan_MultiPages",
        });

        setPdfResult(result);
        setStatus("completed");
        return result;
      } catch (err: any) {
        setError(err?.message || "Erreur lors de l'assemblage PDF");
        setStatus("previewing");
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, compressionLevel, options.title]
  );

  /**
   * Envoie le PDF généré directement dans la file d'attente d'envoi différé hors-ligne (Module 4)
   */
  const sendToOfflineQueue = useCallback(
    async (devisId?: string, endpoint?: string) => {
      if (!pdfResult) {
        setError("Veuillez d'abord générer le PDF avant de l'envoyer");
        return null;
      }

      try {
        setIsProcessing(true);
        const res = await ScanService.queuePdfForOfflineSync(pdfResult, {
          devisId: devisId || "DEV-2026-0842",
          endpoint,
        });
        return res;
      } catch (err: any) {
        setError(err?.message || "Erreur lors de la mise en file d'attente");
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [pdfResult]
  );

  /**
   * Réinitialise le scanner
   */
  const resetScanner = useCallback(() => {
    setPages([]);
    setCurrentPageIndex(0);
    setStatus("idle");
    setPdfResult(null);
    setError(null);
  }, []);

  return {
    pages,
    currentPage,
    currentPageIndex,
    pageCount: pages.length,
    status,
    setStatus,
    compressionLevel,
    setCompressionLevel,
    isProcessing,
    pdfResult,
    error,
    // Actions
    addPageFromUri,
    loadMockPages,
    selectPage,
    updateCorners,
    autoDetectCorners,
    applyFilter,
    rotatePage,
    deletePage,
    movePage,
    generatePdf,
    sendToOfflineQueue,
    resetScanner,
  };
}
