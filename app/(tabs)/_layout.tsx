import { type Href, Tabs, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 6, marginRight: 12 }}>
              <Pressable
                onPress={() => router.push("/permissions-test")}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 11 }}>
                  🔐
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/location-contact-test")}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 11 }}>
                  📍
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/qr-code-test" as Href)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 11 }}>
                  📷 QR
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/offline-sync-test" as Href)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  backgroundColor: colors.surface,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 11 }}>
                  📤 Différé
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/document-scan-test" as Href)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  backgroundColor: colors.surface,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 11 }}>
                  📄 Scan
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/photo-capture-test" as Href)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 11 }}>
                  📷 Photo
                </Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="clients" options={{ title: "Clients" }} />
      <Tabs.Screen name="prospects" options={{ title: "Prospects" }} />
      <Tabs.Screen name="devis" options={{ title: "Devis" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
