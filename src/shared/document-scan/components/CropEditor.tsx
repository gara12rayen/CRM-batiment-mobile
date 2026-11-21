import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { DocumentCorners, ScannedPage } from "../models/document-scan.types";
import { EdgeDetectionService } from "../services/edgeDetectionService";

interface CropEditorProps {
  page: ScannedPage;
  onApplyCrop: (corners: DocumentCorners) => void;
  onCancel: () => void;
}

export function CropEditor({ page, onApplyCrop, onCancel }: CropEditorProps) {
  const [corners, setCorners] = useState<DocumentCorners>(page.corners);
  const [selectedCorner, setSelectedCorner] = useState<
    "topLeft" | "topRight" | "bottomRight" | "bottomLeft" | null
  >(null);

  const previewWidth = 320;
  const previewHeight = 420;

  // Facteurs d'échelle entre l'image réelle et le conteneur de prévisualisation
  const scaleX = previewWidth / page.width;
  const scaleY = previewHeight / page.height;

  const handleNudgeCorner = (
    cornerKey: keyof DocumentCorners,
    deltaX: number,
    deltaY: number
  ) => {
    setCorners((prev) => ({
      ...prev,
      [cornerKey]: {
        x: Math.max(0, Math.min(page.width, prev[cornerKey].x + deltaX)),
        y: Math.max(0, Math.min(page.height, prev[cornerKey].y + deltaY)),
      },
    }));
  };

  const handleAutoDetect = () => {
    const { corners: detected } = EdgeDetectionService.detectCorners(
      page.width,
      page.height
    );
    setCorners(detected);
  };

  const handleResetCorners = () => {
    const defaultCorners = EdgeDetectionService.getDefaultCorners(
      page.width,
      page.height
    );
    setCorners(defaultCorners);
  };

  const cornerLabels: Record<keyof DocumentCorners, string> = {
    topLeft: "Haut Gauche",
    topRight: "Haut Droit",
    bottomRight: "Bas Droit",
    bottomLeft: "Bas Gauche",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recadrage & Bords du document</Text>
        <Text style={styles.headerSubtitle}>
          Page {page.pageNumber} • Détection auto : {page.detectedConfidence}% de confiance
        </Text>
      </View>

      {/* Cadre de visualisation de l'image et du contour */}
      <View style={[styles.canvasWrapper, { width: previewWidth, height: previewHeight }]}>
        <Image
          source={{ uri: page.originalUri }}
          style={styles.previewImage}
          resizeMode="contain"
        />

        {/* Repères des 4 coins */}
        {(["topLeft", "topRight", "bottomRight", "bottomLeft"] as const).map((key) => {
          const pt = corners[key];
          const posX = pt.x * scaleX;
          const posY = pt.y * scaleY;
          const isSelected = selectedCorner === key;

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.8}
              onPress={() => setSelectedCorner(key)}
              style={[
                styles.cornerHandle,
                { left: posX - 14, top: posY - 14 },
                isSelected && styles.cornerHandleSelected,
              ]}
            >
              <View style={styles.cornerHandleInner} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Outils d'ajustement fin */}
      <View style={styles.nudgeSection}>
        <Text style={styles.nudgeTitle}>
          Coin sélectionné :{" "}
          <Text style={styles.nudgeHighlight}>
            {selectedCorner ? cornerLabels[selectedCorner] : "Touchez un coin pour ajuster"}
          </Text>
        </Text>

        {selectedCorner && (
          <View style={styles.nudgeButtonsRow}>
            <TouchableOpacity
              style={styles.nudgeButton}
              onPress={() => handleNudgeCorner(selectedCorner, 0, -20)}
            >
              <Text style={styles.nudgeButtonText}>▲ Haut</Text>
            </TouchableOpacity>
            <View style={styles.nudgeButtonsSubRow}>
              <TouchableOpacity
                style={styles.nudgeButton}
                onPress={() => handleNudgeCorner(selectedCorner, -20, 0)}
              >
                <Text style={styles.nudgeButtonText}>◀ Gauche</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nudgeButton}
                onPress={() => handleNudgeCorner(selectedCorner, 20, 0)}
              >
                <Text style={styles.nudgeButtonText}>Droite ▶</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.nudgeButton}
              onPress={() => handleNudgeCorner(selectedCorner, 0, 20)}
            >
              <Text style={styles.nudgeButtonText}>▼ Bas</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Barre d'actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.utilityButton} onPress={handleAutoDetect}>
          <Text style={styles.utilityButtonText}>🔍 Détection auto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.utilityButton} onPress={handleResetCorners}>
          <Text style={styles.utilityButtonText}>↺ Plein cadre</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => onApplyCrop(corners)}
        >
          <Text style={styles.confirmButtonText}>Valider le recadrage ✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: "center",
  },
  header: {
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  canvasWrapper: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  cornerHandle: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(37, 99, 235, 0.4)",
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  cornerHandleSelected: {
    backgroundColor: "rgba(220, 38, 38, 0.5)",
    borderColor: colors.danger,
    transform: [{ scale: 1.25 }],
  },
  cornerHandleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  nudgeSection: {
    width: "100%",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginVertical: spacing.sm,
    alignItems: "center",
  },
  nudgeTitle: {
    fontSize: 12,
    color: colors.muted,
  },
  nudgeHighlight: {
    fontWeight: "700",
    color: colors.primary,
  },
  nudgeButtonsRow: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  nudgeButtonsSubRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginVertical: 4,
  },
  nudgeButton: {
    backgroundColor: colors.background,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nudgeButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  utilityButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  utilityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  footerRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
