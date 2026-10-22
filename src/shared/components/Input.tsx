import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

export function Input(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.muted}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    padding: spacing.md,
  },
});
