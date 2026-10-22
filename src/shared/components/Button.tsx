import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children?: ReactNode;
};

export function Button({ label, onPress, disabled, children }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
  },
  dimmed: { opacity: 0.7 },
  label: { color: "#FFFFFF", fontWeight: "600" },
});
