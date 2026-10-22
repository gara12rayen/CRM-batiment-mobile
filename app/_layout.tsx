import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/core/theme/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: "Connexion" }} />
        <Stack.Screen
          name="(auth)/forgot-password"
          options={{ title: "Mot de passe oublié" }}
        />
        <Stack.Screen name="+not-found" options={{ title: "Page introuvable" }} />
      </Stack>
    </>
  );
}
