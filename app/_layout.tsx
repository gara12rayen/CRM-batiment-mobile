import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/core/theme/colors";
import { AuthProvider } from "@/features/auth/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background.DEFAULT },
            headerTintColor: colors.text.DEFAULT,
            contentStyle: { backgroundColor: colors.background.DEFAULT },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ title: "Connexion" }} />
          <Stack.Screen
            name="(auth)/change-password"
            options={{ title: "Changer le mot de passe" }}
          />
          <Stack.Screen
            name="+not-found"
            options={{ title: "Page introuvable" }}
          />
        </Stack>
      </>
    </AuthProvider>
  );
}
