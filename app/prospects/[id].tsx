import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { DemandeDetailView } from "@/features/demandes/views/DemandeDetailView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DemandeDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!user || !permissions.canReadRequests(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="Les demandes de devis sont réservées au bureau." />;
  }
  return (
    <>
      <Stack.Screen options={{ title: "Demande de devis" }} />
      <DemandeDetailView id={Number(id)} />
    </>
  );
}
