import { useCallback, useRef, useState } from "react";
import type {
  DevisQRData,
  QRValidationError,
  ScanStatus,
} from "../models/qr-code.types";
import { qrCodeService } from "../services/qrCodeService";

export function useQRScanner() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [scannedData, setScannedData] = useState<DevisQRData | null>(null);
  const [error, setError] = useState<QRValidationError | null>(null);
  const [rawValue, setRawValue] = useState<string | null>(null);

  // Empêche le traitement multiple du même scan
  const isProcessingRef = useRef(false);

  /**
   * Appelé par le composant caméra à chaque QR code détecté.
   * Valide automatiquement le format et met à jour l'état.
   */
  const handleBarcodeScan = useCallback((data: string) => {
    // Éviter les scans répétés pendant le traitement
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setRawValue(data);
    setStatus("validating");
    setError(null);

    const result = qrCodeService.validateQRData(data);

    if (result.valid) {
      setScannedData(result.data);
      setError(null);
      setStatus("success");
    } else {
      setScannedData(null);
      setError(result.error);
      setStatus("error");
    }

    // Permettre un nouveau scan après un court délai
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1500);
  }, []);

  /**
   * Simule un scan réussi avec des données de démo (mode d'essai CDC).
   */
  const simulateMockScan = useCallback(() => {
    const mockValue = qrCodeService.generateMockQRValue();
    handleBarcodeScan(mockValue);
  }, [handleBarcodeScan]);

  /**
   * Simule un scan échoué pour tester les messages d'erreur.
   */
  const simulateMockError = useCallback(
    (type: "empty" | "not_devis" | "no_version" | "bad_format") => {
      const mockValue = qrCodeService.generateMockInvalidQRValue(type);
      handleBarcodeScan(mockValue);
    },
    [handleBarcodeScan],
  );

  /**
   * Active le mode « QR code illisible » (solution de repli).
   */
  const triggerFallback = useCallback(() => {
    setStatus("fallback");
    setScannedData(null);
    setError(null);
    setRawValue(null);
  }, []);

  /**
   * Réinitialise le scanner pour un nouveau scan.
   */
  const reset = useCallback(() => {
    setStatus("scanning");
    setScannedData(null);
    setError(null);
    setRawValue(null);
    isProcessingRef.current = false;
  }, []);

  return {
    status,
    scannedData,
    error,
    rawValue,
    handleBarcodeScan,
    simulateMockScan,
    simulateMockError,
    triggerFallback,
    reset,
  };
}

