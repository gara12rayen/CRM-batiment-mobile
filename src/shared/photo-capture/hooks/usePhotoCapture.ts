import { useState, useCallback, useMemo } from "react";
import type {
  CameraFacing,
  FlashMode,
  PhotoBatchResult,
  PhotoCaptureOptions,
  PhotoMetadata,
} from "../models/photo-capture.types";
import {
  PhotoCompressionService,
  DEFAULT_COMPRESSION_CONFIG,
} from "../services/photoCompressionService";
import { PhotoCaptureService } from "../services/photoCaptureService";

export function usePhotoCapture(options: PhotoCaptureOptions = {}) {
  const [photos, setPhotos] = useState<PhotoMetadata[]>(() => {
    if (options.mockMode) {
      return PhotoCaptureService.getMockChantierPhotos();
    }
    return [];
  });

  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [gridEnabled, setGridEnabled] = useState<boolean>(
    options.enableGrid ?? true
  );
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcul des statistiques de compression globale du lot de photos.
   */
  const batchStats: PhotoBatchResult = useMemo(() => {
    const totalOriginalSizeBytes = photos.reduce(
      (sum, p) => sum + p.originalSizeBytes,
      0
    );
    const totalCompressedSizeBytes = photos.reduce(
      (sum, p) => sum + p.compressedSizeBytes,
      0
    );
    const averageCompressionRatio =
      photos.length > 0
        ? Math.round(
            photos.reduce((sum, p) => sum + p.compressionRatioPercent, 0) /
              photos.length
          )
        : 0;
    const allUnderLimit = photos.every((p) => p.isUnderLimit);

    return {
      photos,
      totalOriginalSizeBytes,
      totalCompressedSizeBytes,
      averageCompressionRatio,
      allUnderLimit,
    };
  }, [photos]);

  /**
   * Prise de photo via caméra avec compression automatique immédiate.
   */
  const takePhoto = useCallback(
    async (customUri?: string) => {
      try {
        setIsCapturing(true);
        setIsCompressing(true);
        setError(null);

        // Si URI non fournie, génère un cliché SVG simulé avec les paramètres actuels
        const timestamp = Date.now();
        const photoNumber = photos.length + 1;
        const uri =
          customUri ||
          `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1440" viewBox="0 0 1920 1440"><rect width="100%" height="100%" fill="#0F172A"/><circle cx="960" cy="720" r="300" fill="none" stroke="#38BDF8" stroke-width="8"/><text x="960" y="700" fill="#FFFFFF" font-family="sans-serif" font-size="44" font-weight="bold" text-anchor="middle">PHOTO CHANTIER N°${photoNumber}</text><text x="960" y="760" fill="#94A3B8" font-family="sans-serif" font-size="28" text-anchor="middle">Caméra : ${cameraFacing.toUpperCase()} • Flash : ${flashMode.toUpperCase()}</text><rect x="120" y="1240" width="1680" height="100" rx="12" fill="rgba(30,41,59,0.9)"/><text x="160" y="1302" fill="#38BDF8" font-family="monospace" font-size="30">TIMESTAMP: ${new Date(timestamp).toLocaleString("fr-FR")}</text></svg>`;

        const compressed = await PhotoCompressionService.compressPhoto(uri, {
          maxSizeBytes: options.targetMaxSizeBytes || DEFAULT_COMPRESSION_CONFIG.maxSizeBytes,
          source: "camera",
          fileNameHint: `chantier_photo_${timestamp}.jpg`,
        });

        setPhotos((prev) => [compressed, ...prev]);
        setSelectedPhoto(compressed);
        return compressed;
      } catch (err: any) {
        setError(err?.message || "Erreur lors de la capture photo");
        return null;
      } finally {
        setIsCapturing(false);
        setIsCompressing(false);
      }
    },
    [photos.length, cameraFacing, flashMode, options.targetMaxSizeBytes]
  );

  /**
   * Sélection multiple de photos depuis la galerie avec compression par lot.
   */
  const pickMultipleFromGallery = useCallback(async () => {
    try {
      setIsCompressing(true);
      setError(null);

      const uris = await PhotoCaptureService.pickMultipleFromGallery(
        options.maxPhotos || 10
      );

      if (uris.length === 0) return;

      const compressedList: PhotoMetadata[] = [];
      for (const uri of uris) {
        const compressed = await PhotoCompressionService.compressPhoto(uri, {
          maxSizeBytes: options.targetMaxSizeBytes || DEFAULT_COMPRESSION_CONFIG.maxSizeBytes,
          source: "gallery",
        });
        compressedList.push(compressed);
      }

      setPhotos((prev) => [...compressedList, ...prev]);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la sélection dans la galerie");
    } finally {
      setIsCompressing(false);
    }
  }, [options.maxPhotos, options.targetMaxSizeBytes]);

  /**
   * Charge le jeu de photos de démonstration de chantier (version d'essai CDC).
   */
  const addMockChantierPhotos = useCallback(() => {
    setIsCompressing(true);
    const mock = PhotoCaptureService.getMockChantierPhotos();
    setPhotos(mock);
    setSelectedPhoto(mock[0] || null);
    setError(null);
    setIsCompressing(false);
  }, []);

  /**
   * Bascule caméra avant / arrière
   */
  const toggleCameraFacing = useCallback(() => {
    setCameraFacing((prev) => (prev === "back" ? "front" : "back"));
  }, []);

  /**
   * Bascule mode flash (Off -> On -> Auto)
   */
  const toggleFlashMode = useCallback(() => {
    setFlashMode((prev) => {
      if (prev === "off") return "on";
      if (prev === "on") return "auto";
      return "off";
    });
  }, []);

  /**
   * Active / désactive le quadrillage de cadrage chantier
   */
  const toggleGrid = useCallback(() => {
    setGridEnabled((prev) => !prev);
  }, []);

  /**
   * Supprime une photo
   */
  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setSelectedPhoto((current) => (current?.id === id ? null : current));
  }, []);

  /**
   * Supprime toutes les photos
   */
  const clearAllPhotos = useCallback(() => {
    setPhotos([]);
    setSelectedPhoto(null);
  }, []);

  /**
   * Envoi différé par lot dans la file d'attente persistante (Module 4)
   */
  const sendPhotosToOfflineQueue = useCallback(
    async (chantierId?: string) => {
      if (photos.length === 0) {
        setError("Aucune photo à synchroniser");
        return { queuedCount: 0, success: false };
      }

      try {
        setIsCompressing(true);
        const result = await PhotoCaptureService.queuePhotosForOfflineSync(
          photos,
          chantierId || options.chantierId || "CH-2026-0042"
        );
        return result;
      } catch (err: any) {
        setError(err?.message || "Erreur de mise en file d'attente");
        return { queuedCount: 0, success: false };
      } finally {
        setIsCompressing(false);
      }
    },
    [photos, options.chantierId]
  );

  return {
    photos,
    photoCount: photos.length,
    selectedPhoto,
    batchStats,
    cameraFacing,
    flashMode,
    gridEnabled,
    isCapturing,
    isCompressing,
    error,
    // Actions
    takePhoto,
    pickMultipleFromGallery,
    addMockChantierPhotos,
    toggleCameraFacing,
    toggleFlashMode,
    toggleGrid,
    removePhoto,
    clearAllPhotos,
    setSelectedPhoto,
    sendPhotosToOfflineQueue,
  };
}
