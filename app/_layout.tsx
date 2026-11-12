import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/core/theme/colors";
import { AccessProvider } from "@/features/access/AccessProvider";
import { SessionLifecycle } from "@/features/auth/components/SessionLifecycle";

export default function RootLayout() {
  return (
    <AccessProvider>
      <SessionLifecycle />
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
          name="access-denied"
          options={{ title: "Accès refusé", headerBackVisible: false }}
        />
        <Stack.Screen
          name="+not-found"
          options={{ title: "Page introuvable" }}
        />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/verify-reset-code" />
        <Stack.Screen name="(auth)/reset-password" />
      </Stack>
    </AccessProvider>
  );
}
