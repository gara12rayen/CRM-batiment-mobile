import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { DocumentFilterType, ScannedPage } from "../models/document-scan.types";

interface ScanPreviewProps {
  page: ScannedPage;
  totalPages: number;
  onRotate: () => void;
  onEditCrop: () => void;
  onApplyFilter: (filter: DocumentFilterType) => void;
}

export function ScanPreview({
  page,
  totalPages,
  onRotate,
  onEditCrop,
  onApplyFilter,
}: ScanPreviewProps) {
  const filters: Array<{ type: DocumentFilterType; label: string; icon: string }> = [
    { type: "bw_enhanced", label: "N&B Contraste", icon: "📄" },
    { type: "magic_color", label: "Couleur Nette", icon: "✨" },
    { type: "grayscale", label: "Gris", icon: "⚪" },
    { type: "original", label: "Original", icon: "📷" },
  ];

  return (
    <View style={styles.container}>
      {/* Barre supérieure de statut de page */}
      <View style={styles.statusBar}>
        <View style={styles.pageNumberBadge}>
          <Text style={styles.pageNumberText}>
            Page {page.pageNumber} sur {totalPages}
          </Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionPill} onPress={onRotate}>
            <Text style={styles.actionPillText}>↺ {page.rotation}°</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionPill, styles.actionPillPrimary]}
            onPress={onEditCrop}
          >
            <Text style={styles.actionPillTextPrimary}>✂ Recadrer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cadre de visualisation principale */}
      <View style={styles.imageFrame}>
        <Image
          source={{ uri: page.processedUri || page.originalUri }}
          style={styles.pageImage}
          resizeMode="contain"
        />
      </View>

      {/* Sélecteur de filtres de document */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Amélioration du document :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((f) => {
            const isSelected = page.filter === f.type;
            return (
              <TouchableOpacity
                key={f.type}
                activeOpacity={0.8}
                onPress={() => onApplyFilter(f.type)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
              >
                <Text style={styles.filterChipIcon}>{f.icon}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  pageNumberBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  topActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  actionPillPrimary: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  actionPillTextPrimary: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  imageFrame: {
    height: 380,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  pageImage: {
    width: "100%",
    height: "100%",
  },
  filterSection: {
    marginTop: spacing.md,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: colors.primary,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  filterChipTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
});
