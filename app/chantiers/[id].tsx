import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { ChantierFicheView } from "@/features/chantier-fiche/views/ChantierFicheView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ChantierDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canReadChantierFiche(user.role)) {
    return <PlaceholderView title="Accès refusé" description="Les chantiers sont réservés à l’équipe et aux sous-traitants concernés." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Chantier" }} />
      <ChantierFicheView id={Number(id)} />
    </>
  );
}
