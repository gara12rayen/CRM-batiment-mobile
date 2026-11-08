import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { permissionsService } from "@/shared/permissions";

export interface LocationDeniedNoticeProps {
  /** Message d'explication personnalisé optionnel */
  customMessage?: string;
  /** Action à déclencher pour réévaluer / réessayer */
  onRetry?: () => void;
  /** Format compact en bandeau ou carte complète */
  variant?: "card" | "banner";
}

export function LocationDeniedNotice({
  customMessage,
  onRetry,
  variant = "card",
}: LocationDeniedNoticeProps) {
  const guideText =
    Platform.OS === "ios"
      ? "Réglages > CRM Bâtiment > Position > « Lorsque l'app est active »"
      : "Paramètres > Applications > CRM Bâtiment > Autorisations > Position";

  const handleOpenSettings = async () => {
    await permissionsService.openSettings();
  };

  if (variant === "banner") {
    return (
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerIcon}>📍</Text>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Position GPS désactivée</Text>
          <Text style={styles.bannerSubtitle}>
            {customMessage ?? "Activez la localisation pour certifier vos interventions."}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleOpenSettings}
          style={styles.bannerButton}
        >
          <Text style={styles.bannerButtonText}>Régler</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>📍</Text>
      </View>

      <Text style={styles.title}>Localisation GPS requise</Text>

      <Text style={styles.message}>
        {customMessage ??
          "Le CRM Bâtiment a besoin de votre position pour horodater vos passages, certifier la présence sur le chantier et faciliter le guidage vers vos rendez-vous."}
      </Text>

      <View style={styles.guideBox}>
        <Text style={styles.guideTitle}>Comment réactiver la position ?</Text>
        <Text style={styles.guideText}>{guideText}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={handleOpenSettings}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Ouvrir les réglages</Text>
        </Pressable>

        {onRetry && (
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Vérifier à nouveau</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: spacing.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  guideBox: {
    width: "100%",
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 2,
  },
  guideText: {
    fontSize: 12,
    color: "#B45309",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.8,
  },
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 10,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    gap: spacing.sm,
  },
  bannerIcon: {
    fontSize: 20,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#B45309",
  },
  bannerButton: {
    backgroundColor: "#D97706",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bannerButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
});
