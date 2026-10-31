import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { typography } from "@/core/theme/typography";
import type { PermissionType } from "../models/permission.types";
import { PERMISSION_DESCRIPTIONS } from "../services/permission-descriptions";

type PermissionRationaleModalProps = {
  visible: boolean;
  type: PermissionType;
  /** Contexte métier optionnel (ex: "pour associer une photo à ce rapport de chantier") */
  contextReason?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PermissionRationaleModal({
  visible,
  type,
  contextReason,
  onConfirm,
  onCancel,
}: PermissionRationaleModalProps) {
  const config = PERMISSION_DESCRIPTIONS[type];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>
                {type === "camera" && "📷"}
                {type === "microphone" && "🎙️"}
                {type === "location" && "📍"}
                {type === "notifications" && "🔔"}
              </Text>
            </View>
            <Text style={styles.title}>{config.title}</Text>
          </View>

          <Text style={styles.rationale}>
            {contextReason ? contextReason : config.rationale}
          </Text>

          <View style={styles.featuresList}>
            <Text style={styles.featuresHeader}>Pourquoi est-ce utile ?</Text>
            {config.features.slice(0, 3).map((feat, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.bullet}>✓</Text>
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelButtonText}>Plus tard</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.confirmButtonText}>Continuer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    ...typography.title,
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
  },
  rationale: {
    ...typography.body,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  featuresList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  featuresHeader: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.xs,
  },
  bullet: {
    color: colors.primary,
    fontWeight: "700",
    marginRight: spacing.sm,
  },
  featureText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: "600",
    color: colors.muted,
  },
  confirmButton: {
    flex: 1.5,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    ...typography.body,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.8,
  },
});
