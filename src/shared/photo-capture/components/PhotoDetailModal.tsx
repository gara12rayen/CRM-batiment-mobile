import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { PhotoMetadata } from "../models/photo-capture.types";
import { PhotoCompressionService } from "../services/photoCompressionService";

interface PhotoDetailModalProps {
  photo: PhotoMetadata | null;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export function PhotoDetailModal({
  photo,
  onClose,
  onRemove,
}: PhotoDetailModalProps) {
  if (!photo) return null;

  const originalStr = PhotoCompressionService.formatBytes(photo.originalSizeBytes);
  const compressedStr = PhotoCompressionService.formatBytes(photo.compressedSizeBytes);

  return (
    <View style={styles.overlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Inspection Technique Photo</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Aperçu grand format */}
          <View style={styles.imageFrame}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>

          {/* Badge de conformité CDC */}
          <View
            style={[
              styles.complianceBanner,
              photo.isUnderLimit
                ? styles.complianceBannerSuccess
                : styles.complianceBannerWarning,
            ]}
          >
            <Text style={styles.complianceIcon}>
              {photo.isUnderLimit ? "✓" : "⚠️"}
            </Text>
            <View>
              <Text
                style={[
                  styles.complianceTitle,
                  photo.isUnderLimit
                    ? styles.complianceTextSuccess
                    : styles.complianceTextWarning,
                ]}
              >
                {photo.isUnderLimit
                  ? "Conforme Exigence CDC (< 500 Ko)"
                  : "Attention : Poids supérieur à la cible"}
              </Text>
              <Text style={styles.complianceSub}>
                Taille compressée : {compressedStr} (Cible : max 500 Ko)
              </Text>
            </View>
          </View>

          {/* Grille de métriques de compression */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Taille originale</Text>
              <Text style={styles.metricValue}>{originalStr}</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Poids après compression</Text>
              <Text style={[styles.metricValue, { color: "#059669" }]}>
                {compressedStr}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Économie bande passante</Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                -{photo.compressionRatioPercent}%
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Résolution</Text>
              <Text style={styles.metricValue}>
                {photo.width} × {photo.height} px
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Format MIME</Text>
              <Text style={styles.metricValue}>{photo.mimeType}</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Date de prise</Text>
              <Text style={styles.metricValue}>
                {new Date(photo.capturedAt).toLocaleTimeString("fr-FR")}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              onRemove(photo.id);
              onClose();
            }}
          >
            <Text style={styles.deleteButtonText}>Supprimer cette photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <Text style={styles.okButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  closeIcon: {
    padding: 4,
  },
  closeIconText: {
    fontSize: 16,
    color: colors.muted,
  },
  scrollContent: {
    padding: spacing.md,
  },
  imageFrame: {
    height: 220,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  complianceBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  complianceBannerSuccess: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  complianceBannerWarning: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  complianceIcon: {
    fontSize: 20,
  },
  complianceTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  complianceTextSuccess: {
    color: "#166534",
  },
  complianceTextWarning: {
    color: "#B45309",
  },
  complianceSub: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  metricItem: {
    width: "48%",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  modalFooter: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  okButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  okButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
