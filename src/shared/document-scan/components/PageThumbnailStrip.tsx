import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { ScannedPage } from "../models/document-scan.types";

interface PageThumbnailStripProps {
  pages: ScannedPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onMovePage: (pageId: string, direction: "prev" | "next") => void;
}

export function PageThumbnailStrip({
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onMovePage,
}: PageThumbnailStripProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Pages numérisées ({pages.length})
        </Text>
        <Text style={styles.subtitle}>
          Touchez pour naviguer, réorganiser ou supprimer
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {pages.map((page, index) => {
          const isActive = index === activePageIndex;

          return (
            <View key={page.id} style={styles.thumbnailWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSelectPage(index)}
                style={[
                  styles.thumbnailCard,
                  isActive && styles.thumbnailCardActive,
                ]}
              >
                <Image
                  source={{ uri: page.processedUri || page.originalUri }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                <View style={styles.pageBadge}>
                  <Text style={styles.pageBadgeText}>{page.pageNumber}</Text>
                </View>
              </TouchableOpacity>

              {/* Commandes rapides : déplacer ou supprimer */}
              <View style={styles.thumbnailControls}>
                <TouchableOpacity
                  disabled={index === 0}
                  onPress={() => onMovePage(page.id, "prev")}
                  style={[
                    styles.miniButton,
                    index === 0 && styles.miniButtonDisabled,
                  ]}
                >
                  <Text style={styles.miniButtonText}>◀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onDeletePage(page.id)}
                  style={styles.miniDeleteButton}
                >
                  <Text style={styles.miniDeleteButtonText}>✕</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={index === pages.length - 1}
                  onPress={() => onMovePage(page.id, "next")}
                  style={[
                    styles.miniButton,
                    index === pages.length - 1 && styles.miniButtonDisabled,
                  ]}
                >
                  <Text style={styles.miniButtonText}>▶</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Bouton Ajouter une page */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddPage}
          style={styles.addPageCard}
        >
          <View style={styles.addIconCircle}>
            <Text style={styles.addIconText}>+</Text>
          </View>
          <Text style={styles.addPageText}>Ajouter</Text>
          <Text style={styles.addPageSubtext}>Page {pages.length + 1}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
  },
  scrollList: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  thumbnailWrapper: {
    alignItems: "center",
  },
  thumbnailCard: {
    width: 68,
    height: 92,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    position: "relative",
  },
  thumbnailCardActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  pageBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pageBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  thumbnailControls: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  miniButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniButtonDisabled: {
    opacity: 0.3,
  },
  miniButtonText: {
    fontSize: 8,
    color: colors.text,
  },
  miniDeleteButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  miniDeleteButtonText: {
    fontSize: 9,
    color: colors.danger,
    fontWeight: "bold",
  },
  addPageCard: {
    width: 68,
    height: 92,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  addIconText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 20,
  },
  addPageText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  addPageSubtext: {
    fontSize: 9,
    color: colors.muted,
  },
});
