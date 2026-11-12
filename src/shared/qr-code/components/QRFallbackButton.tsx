import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

interface QRFallbackButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Bouton de repli « QR code illisible » affiché sous la zone de scan.
 * Prévient l'écran appelant que l'utilisateur ne peut pas scanner
 * et souhaite saisir manuellement ou sélectionner le devis autrement.
 */
export function QRFallbackButton({ onPress, disabled }: QRFallbackButtonProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="QR code illisible — sélection manuelle"
        accessibilityHint="Permet de chercher le devis manuellement si le QR code est endommagé ou illisible"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text style={styles.buttonIcon}>🔍</Text>
        <View style={styles.buttonTextGroup}>
          <Text style={styles.buttonTitle}>QR code illisible ?</Text>
          <Text style={styles.buttonSubtitle}>
            Rechercher le devis manuellement
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: spacing.sm,
  },
  buttonIcon: {
    fontSize: 22,
  },
  buttonTextGroup: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
  },
  buttonSubtitle: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 1,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: "#FEF3C7",
  },
  disabled: {
    opacity: 0.5,
  },
});

