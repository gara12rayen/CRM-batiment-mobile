import { Tabs, useRouter } from "expo-router";
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
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 12 }}>
                  🔐 Perms
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/location-contact-test")}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>
                  📍 GPS & Contact
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
