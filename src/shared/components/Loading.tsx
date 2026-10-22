import { ActivityIndicator, View } from "react-native";
import { colors } from "@/core/theme/colors";

export function Loading() {
  return (
    <View accessibilityRole="progressbar" style={{ padding: 16 }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
