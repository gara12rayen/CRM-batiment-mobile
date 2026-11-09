import { Link, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { DevisDetailView } from "@/features/devis/views/DevisDetailView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DevisDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canReadQuotes(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous ne pouvez pas consulter ce devis."
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Devis" }} />
      <DevisDetailView
        id={Number(id)}
        // Existing link kept (the Devis IA screen is still a placeholder)
        footer={(devis) =>
          permissions.canUseDevisIAForQuote(user.role, devis.statut) ? (
            <Link href={{ pathname: "/devis/ia", params: { id: String(devis.id) } }} style={{ color: "#2563EB", fontWeight: "600", textAlign: "center" }}>
              <Text>Ouvrir le Devis IA</Text>
            </Link>
          ) : null
        }
      />
    </>
  );
}
