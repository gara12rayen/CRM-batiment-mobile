import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

export function Input(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.text.muted}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface.DEFAULT,
    borderColor: colors.border.DEFAULT,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text.DEFAULT,
    padding: spacing.md,
  },
});