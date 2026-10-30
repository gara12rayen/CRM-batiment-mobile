import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PlaceholderView } from "@/shared/components/PlaceholderView";

export function DevisView() {
  return (
    <View style={styles.container}>
      <PlaceholderView
        title="Devis"
        description="La liste des devis sera intégrée dans une prochaine étape."
      />

      <Pressable
        style={styles.scanButton}
        onPress={() => router.push("/devis/scan")}
      >
        <Text style={styles.scanButtonText}>
          Scanner un devis signé
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scanButton: {
    backgroundColor: "#0284c7",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});