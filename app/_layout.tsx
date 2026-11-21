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
        <Stack.Screen
          name="permissions-test"
          options={{ title: "Autorisations (Socle 1B)" }}
        />
        <Stack.Screen
          name="location-contact-test"
          options={{ title: "Localisation & Contact (Socle 1B)" }}
        />
        <Stack.Screen
          name="qr-code-test"
          options={{ title: "QR Code Devis (Socle 1B)" }}
        />
        <Stack.Screen
          name="offline-sync-test"
          options={{ title: "Envoi Différé (Socle 1B)" }}
        />
        <Stack.Screen
          name="document-scan-test"
          options={{ title: "Scan Multi-Pages (Socle 1B)" }}
        />
        <Stack.Screen
          name="photo-capture-test"
          options={{ title: "Outils Photo (Socle 1B)" }}
        />
        <Stack.Screen name="+not-found" options={{ title: "Page introuvable" }} />
      </Stack>
    </>
  );
}
