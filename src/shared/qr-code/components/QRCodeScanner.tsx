import React, { ReactNode, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { PermissionGate } from "@/shared/permissions";
import { useQRScanner } from "../hooks/useQRScanner";
import type {
  DevisQRData,
  QRScanCallbacks,
  QRScannerOptions,
} from "../models/qr-code.types";
import { QRErrorDisplay } from "./QRErrorDisplay";
import { QRFallbackButton } from "./QRFallbackButton";
import { QRSuccessDisplay } from "./QRSuccessDisplay";

export interface QRCodeScannerProps extends QRScanCallbacks, QRScannerOptions {
  /**
   * Rendu optionnel d'une vue caméra native (ex: CameraView d'expo-camera).
   * Reçoit `onScan(data)` et `disabled`.
   * En l'absence de caméra native, affiche l'aperçu en version d'essai.
   */
  renderCamera?: (props: {
    onScan: (data: string) => void;
    disabled: boolean;
  }) => ReactNode;
  /** Si true, saute le PermissionGate (utile si géré en amont ou en mode simulation pure) */
  skipPermissionGate?: boolean;
}

/**
 * Composant réutilisable de lecture et validation de QR code de devis.
 *
 * Intègre :
 *  - PermissionGate('camera') pour les demandes et refus d'accès caméra
 *  - Aperçu caméra avec cadre visuel de visée et retour de reconnaissance
 *  - Validation du format officiel des devis (DEV-AAAA-XXXX - vN)
 *  - Affichage des erreurs explicatives
 *  - Bouton de repli « QR code illisible » prévenant l'écran appelant
 */
export function QRCodeScanner({
  onDevisScanned,
  onFallback,
  onCancel,
  title = "Scanner le QR code du devis",
  instruction = "Placez le QR code imprimé sur le devis à l'intérieur du cadre.",
  allowCancel = true,
  mockMode = true,
  renderCamera,
  skipPermissionGate = false,
}: QRCodeScannerProps) {
  const {
    status,
    scannedData,
    error,
    rawValue,
    handleBarcodeScan,
    simulateMockScan,
    simulateMockError,
    triggerFallback,
    reset,
  } = useQRScanner();

  const [manualInput, setManualInput] = useState("");

  const handleConfirmSuccess = (data: DevisQRData) => {
    onDevisScanned(data);
  };

  const handleFallbackPress = () => {
    triggerFallback();
    onFallback();
  };

  const frameBorderColor =
    status === "success"
      ? "#22C55E"
      : status === "error"
        ? "#EF4444"
        : "#3B82F6";

  const content = (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.instruction}>{instruction}</Text>
        </View>
        {allowCancel && onCancel && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer le scanner"
            onPress={onCancel}
            style={styles.closeBtn}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Aperçu Caméra + Cadre visuel de reconnaissance */}
      {status !== "success" && status !== "error" && (
        <View style={styles.viewfinderWrapper}>
          {renderCamera ? (
            renderCamera({
              onScan: handleBarcodeScan,
              disabled: status === "validating" || status === "fallback",
            })
          ) : (
            <View style={styles.cameraMockBg}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraStatusText}>
                {mockMode
                  ? "Caméra prête (Version d'essai)"
                  : "En attente du QR code..."}
              </Text>
            </View>
          )}

          {/* Overlay visuel de visée (4 coins) */}
          <View pointerEvents="none" style={styles.overlayContainer}>
            <View style={styles.reticle}>
              <View style={[styles.corner, styles.topLeft, { borderColor: frameBorderColor }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: frameBorderColor }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: frameBorderColor }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: frameBorderColor }]} />
            </View>
            <View style={styles.scanFeedbackPill}>
              <View style={[styles.statusDot, { backgroundColor: frameBorderColor }]} />
              <Text style={styles.scanFeedbackText}>
                {status === "validating"
                  ? "Vérification du devis..."
                  : "Alignez le QR code dans le cadre"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Retour visuel : Succès */}
      {status === "success" && scannedData && (
        <QRSuccessDisplay
          data={scannedData}
          onConfirm={() => handleConfirmSuccess(scannedData)}
          onRescan={reset}
        />
      )}

      {/* Retour visuel : Erreur explicative */}
      {status === "error" && error && (
        <QRErrorDisplay
          error={error}
          rawValue={rawValue}
          onRetry={reset}
        />
      )}

      {/* Contrôles de test / version d'essai */}
      {mockMode && status !== "success" && status !== "error" && (
        <View style={styles.mockPanel}>
          <Text style={styles.mockTitle}>Simulation rapide (Version d'essai)</Text>
          <View style={styles.mockBtnRow}>
            <Pressable
              onPress={simulateMockScan}
              style={[styles.mockBtn, styles.mockBtnOk]}
            >
              <Text style={styles.mockBtnText}>✅ QR Valide</Text>
            </Pressable>
            <Pressable
              onPress={() => simulateMockError("not_devis")}
              style={[styles.mockBtn, styles.mockBtnErr]}
            >
              <Text style={styles.mockBtnText}>❌ Non reconnu</Text>
            </Pressable>
            <Pressable
              onPress={() => simulateMockError("no_version")}
              style={[styles.mockBtn, styles.mockBtnWarn]}
            >
              <Text style={styles.mockBtnText}>⚠️ Sans version</Text>
            </Pressable>
          </View>

          <View style={styles.manualTestRow}>
            <TextInput
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="Tester une chaîne (ex: DEV-2026-0042 - v1)"
              placeholderTextColor={colors.muted}
              style={styles.manualInput}
            />
            <Pressable
              onPress={() => {
                handleBarcodeScan(manualInput);
              }}
              style={styles.manualTestBtn}
            >
              <Text style={styles.manualTestBtnText}>Tester</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Bouton de repli obligatoire : « QR code illisible » */}
      <QRFallbackButton
        onPress={handleFallbackPress}
        disabled={status === "validating"}
      />
    </View>
  );

  if (skipPermissionGate) {
    return content;
  }

  return (
    <PermissionGate
      type="camera"
      contextReason="L'appareil photo est nécessaire pour lire le QR code imprimé sur le devis."
    >
      {content}
    </PermissionGate>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  instruction: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 18,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  viewfinderWrapper: {
    height: 240,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0F172A",
    position: "relative",
  },
  cameraMockBg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  cameraIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  cameraStatusText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: {
    width: 150,
    height: 150,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    borderWidth: 3.5,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanFeedbackPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scanFeedbackText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "600",
  },
  mockPanel: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: spacing.xs,
  },
  mockTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  mockBtnRow: {
    flexDirection: "row",
    gap: 6,
  },
  mockBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  mockBtnOk: {
    backgroundColor: "#DCFCE7",
  },
  mockBtnErr: {
    backgroundColor: "#FEE2E2",
  },
  mockBtnWarn: {
    backgroundColor: "#FEF3C7",
  },
  mockBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  manualTestRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  manualInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: colors.text,
  },
  manualTestBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  manualTestBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
});
