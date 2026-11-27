import { StyleSheet, Text } from "react-native";
import { colors } from "@/core/theme/colors";

type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Text accessibilityRole="alert" style={styles.message}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: { color: colors.danger, paddingVertical: 8 },
});
