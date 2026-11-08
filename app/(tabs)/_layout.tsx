import { Tabs, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
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
            <Pressable
              onPress={() => router.push("/permissions-test")}
              style={{
                marginRight: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: colors.primary,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
                🔐 Autorisations
              </Text>
            </Pressable>
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
