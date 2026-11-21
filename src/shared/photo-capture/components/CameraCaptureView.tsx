import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { CameraFacing, FlashMode } from "../models/photo-capture.types";

interface CameraCaptureViewProps {
  cameraFacing: CameraFacing;
  flashMode: FlashMode;
  gridEnabled: boolean;
  photoCount: number;
  isCapturing: boolean;
  onTakePhoto: () => void;
  onToggleFacing: () => void;
  onToggleFlash: () => void;
  onToggleGrid: () => void;
}

export function CameraCaptureView({
  cameraFacing,
  flashMode,
  gridEnabled,
  photoCount,
  isCapturing,
  onTakePhoto,
  onToggleFacing,
  onToggleFlash,
  onToggleGrid,
}: CameraCaptureViewProps) {
  const flashIcons: Record<FlashMode, string> = {
    off: "⚡ Off",
    on: "⚡ On",
    auto: "⚡ Auto",
  };

  return (
    <View style={styles.container}>
      {/* Viseur caméra */}
      <View style={styles.viewfinder}>
        {/* Grille de cadrage (Règle des tiers) */}
        {gridEnabled && (
          <View style={styles.gridOverlay}>
            <View style={[styles.gridLineVertical, { left: "33.3%" }]} />
            <View style={[styles.gridLineVertical, { left: "66.6%" }]} />
            <View style={[styles.gridLineHorizontal, { top: "33.3%" }]} />
            <View style={[styles.gridLineHorizontal, { top: "66.6%" }]} />
          </View>
        )}

        {/* Cible centrale de mise au point */}
        <View style={styles.focusTarget}>
          <View style={styles.focusCornerTL} />
          <View style={styles.focusCornerTR} />
          <View style={styles.focusCornerBL} />
          <View style={styles.focusCornerBR} />
        </View>

        {/* Barre d'outils supérieure dans le viseur */}
        <View style={styles.topToolbar}>
          <TouchableOpacity
            style={styles.toolPill}
            onPress={onToggleFlash}
            activeOpacity={0.8}
          >
            <Text style={styles.toolPillText}>{flashIcons[flashMode]}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolPill, gridEnabled && styles.toolPillActive]}
            onPress={onToggleGrid}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toolPillText,
                gridEnabled && styles.toolPillTextActive,
              ]}
            >
              # Grille
            </Text>
          </TouchableOpacity>

          <View style={styles.counterBadge}>
            <Text style={styles.counterBadgeText}>{photoCount} photo(s)</Text>
          </View>
        </View>

        {/* Indicateur de caméra active */}
        <View style={styles.cameraFacingIndicator}>
          <Text style={styles.cameraFacingText}>
            Objectif {cameraFacing === "back" ? "Arrière (Chantier)" : "Avant (Selfie)"}
          </Text>
        </View>
      </View>

      {/* Barre inférieure des commandes de capture */}
      <View style={styles.bottomControls}>
        {/* Bascule Caméra Avant / Arrière */}
        <TouchableOpacity
          style={styles.switchButton}
          onPress={onToggleFacing}
          activeOpacity={0.7}
        >
          <Text style={styles.switchButtonIcon}>↺</Text>
          <Text style={styles.switchButtonLabel}>
            {cameraFacing === "back" ? "Avant" : "Arrière"}
          </Text>
        </TouchableOpacity>

        {/* Déclencheur principal */}
        <TouchableOpacity
          style={styles.shutterOuter}
          onPress={onTakePhoto}
          disabled={isCapturing}
          activeOpacity={0.8}
        >
          <View style={styles.shutterInner}>
            {isCapturing ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Espace symétrique ou indicateur */}
        <View style={styles.controlSpacer}>
          <Text style={styles.max500Badge}>Max 500 Ko</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0B0F19",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  viewfinder: {
    height: 320,
    backgroundColor: "#020617",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  focusTarget: {
    width: 100,
    height: 100,
    position: "relative",
  },
  focusCornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#38BDF8",
  },
  focusCornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#38BDF8",
  },
  focusCornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#38BDF8",
  },
  focusCornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#38BDF8",
  },
  topToolbar: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toolPill: {
    backgroundColor: "rgba(30, 41, 59, 0.75)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  toolPillActive: {
    backgroundColor: "rgba(37, 99, 235, 0.8)",
    borderColor: colors.primary,
  },
  toolPillText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "600",
  },
  toolPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  counterBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  counterBadgeText: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "700",
  },
  cameraFacingIndicator: {
    position: "absolute",
    bottom: spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cameraFacingText: {
    color: "#94A3B8",
    fontSize: 10,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
    backgroundColor: "#0B0F19",
  },
  switchButton: {
    alignItems: "center",
    width: 60,
  },
  switchButtonIcon: {
    fontSize: 24,
    color: "#E2E8F0",
  },
  switchButtonLabel: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 2,
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  controlSpacer: {
    width: 60,
    alignItems: "center",
  },
  max500Badge: {
    fontSize: 9,
    color: "#059669",
    fontWeight: "700",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
