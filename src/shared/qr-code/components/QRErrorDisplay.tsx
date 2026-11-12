import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { QRValidationError } from "../models/qr-code.types";

interface QRErrorDisplayProps {
  error: QRValidationError;
  rawValue?: string | null;
  onRetry: () => void;
}

export function QRErrorDisplay({ error, rawValue, onRetry }: QRErrorDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>⚠️</Text>
      </View>

      <Text style={styles.title}>QR code non valide</Text>

      <Text style={styles.message}>{error.userMessage}</Text>

      {rawValue ? (
        <View style={styles.rawValueBox}>
          <Text style={styles.rawLabel}>Valeur lue :</Text>
          <Text selectable style={styles.rawValue}>
            {rawValue}
          </Text>
        </View>
      ) : null}

      <View style={styles.formatGuide}>
        <Text style={styles.guideTitle}>Format attendu :</Text>
        <Text style={styles.guideExample}>DEV-AAAA-XXXX - vN</Text>
        <Text style={styles.guideDetail}>
          Exemple : DEV-2026-0042 - v1
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
      >
        <Text style={styles.retryButtonText}>Réessayer le scan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#991B1B",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: "#B91C1C",
    textAlign: "center",
  },
  rawValueBox: {
    width: "100%",
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: spacing.sm,
  },
  rawLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 2,
  },
  rawValue: {
    fontSize: 13,
    color: "#7F1D1D",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  formatGuide: {
    width: "100%",
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 2,
  },
  guideExample: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A5F",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  guideDetail: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    marginTop: spacing.xs,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  pressed: {
    opacity: 0.8,
  },
});

