import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { typography } from "@/core/theme/typography";
import type { PermissionType } from "../models/permission.types";
import { PERMISSION_DESCRIPTIONS } from "../services/permission-descriptions";
import { permissionsService } from "../services/permissionsService";

type PermissionDeniedViewProps = {
  type: PermissionType;
  /** Message personnalisé si besoin de spécifier un écran particulier */
  customMessage?: string;
  /** Action à déclencher lorsque l'utilisateur clique sur "Vérifier à nouveau" */
  onRetry?: () => void;
  /** Action optionnelle pour fermer ou annuler */
  onCancel?: () => void;
};

export function PermissionDeniedView({
  type,
  customMessage,
  onRetry,
  onCancel,
}: PermissionDeniedViewProps) {
  const config = PERMISSION_DESCRIPTIONS[type];
  const settingsGuide =
    Platform.OS === "ios"
      ? config.settingsGuide.ios
      : config.settingsGuide.android;

  const handleOpenSettings = async () => {
    await permissionsService.openSettings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.warningIcon}>⚠️</Text>
        </View>

        <Text style={styles.title}>{config.deniedTitle}</Text>

        <Text style={styles.message}>
          {customMessage ? customMessage : config.deniedMessage}
        </Text>

        <View style={styles.guideBox}>
          <Text style={styles.guideTitle}>{"Comment l'activer ?"}</Text>
          <Text style={styles.guideText}>{settingsGuide}</Text>
        </View>

        <View style={styles.buttonGroup}>
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
              <Text style={styles.secondaryButtonText}>
                {"J'ai activé l'autorisation, réessayer"}
              </Text>
            </Pressable>
          )}

          {onCancel && (
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelButtonText}>Retour</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  warningIcon: {
    fontSize: 28,
  },
  title: {
    ...typography.title,
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  guideBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  guideTitle: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  guideText: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
  },
  buttonGroup: {
    width: "100%",
    gap: spacing.sm,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    ...typography.body,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  cancelButton: {
    width: "100%",
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.8,
  },
});
