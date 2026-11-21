import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { PhotoMetadata } from "../models/photo-capture.types";
import { PhotoCompressionService } from "../services/photoCompressionService";

interface PhotoGridPreviewProps {
  photos: PhotoMetadata[];
  onSelectPhoto: (photo: PhotoMetadata) => void;
  onRemovePhoto: (id: string) => void;
  onPickGalleryMultiple: () => void;
}

export function PhotoGridPreview({
  photos,
  onSelectPhoto,
  onRemovePhoto,
  onPickGalleryMultiple,
}: PhotoGridPreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Photos capturées ({photos.length})</Text>
          <Text style={styles.subtitle}>
            Toutes compressées automatiquement &lt; 500 Ko
          </Text>
        </View>

        <TouchableOpacity
          style={styles.galleryButton}
          onPress={onPickGalleryMultiple}
          activeOpacity={0.8}
        >
          <Text style={styles.galleryButtonText}>🖼️ Galerie multiple</Text>
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyTitle}>Aucune photo enregistrée</Text>
          <Text style={styles.emptyDesc}>
            Prenez une photo ci-dessus ou importez plusieurs photos depuis la galerie.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {photos.map((photo, index) => {
            const formattedSize = PhotoCompressionService.formatBytes(
              photo.compressedSizeBytes
            );

            return (
              <View key={photo.id} style={styles.cardWrapper}>
                <TouchableOpacity
                  style={styles.photoCard}
                  activeOpacity={0.85}
                  onPress={() => onSelectPhoto(photo)}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  {/* Numéro photo */}
                  <View style={styles.indexBadge}>
                    <Text style={styles.indexBadgeText}>#{index + 1}</Text>
                  </View>

                  {/* Badge de compression (ex: -88%) */}
                  <View style={styles.reductionBadge}>
                    <Text style={styles.reductionBadgeText}>
                      -{photo.compressionRatioPercent}%
                    </Text>
                  </View>

                  {/* Bouton de suppression */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemovePhoto(photo.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>

                  {/* Pied de carte avec poids et statut <= 500 Ko */}
                  <View style={styles.cardFooter}>
                    <View
                      style={[
                        styles.sizePill,
                        photo.isUnderLimit
                          ? styles.sizePillSuccess
                          : styles.sizePillWarning,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizePillText,
                          photo.isUnderLimit
                            ? styles.sizePillTextSuccess
                            : styles.sizePillTextWarning,
                        ]}
                      >
                        {photo.isUnderLimit ? "✓ " : "⚠️ "}
                        {formattedSize}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
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
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  galleryButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  galleryButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  cardWrapper: {
    width: "48%",
  },
  photoCard: {
    height: 140,
    backgroundColor: "#1E293B",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  indexBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  indexBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  reductionBadge: {
    position: "absolute",
    top: 6,
    left: 36,
    backgroundColor: "#059669",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reductionBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  cardFooter: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
  },
  sizePill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  sizePillSuccess: {
    backgroundColor: "#DCFCE7",
  },
  sizePillWarning: {
    backgroundColor: "#FEF3C7",
  },
  sizePillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  sizePillTextSuccess: {
    color: "#166534",
  },
  sizePillTextWarning: {
    color: "#B45309",
  },
});
