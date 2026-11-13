import { ActivityIndicator, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { TachesView } from "@/features/chantiers/views/TachesView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** /chantiers/taches?chantierId=12 — tâches d'un chantier. */
export default function TachesRoute() {
  const { chantierId } = useLocalSearchParams<{ chantierId: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canReadTasks(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="Vous n'avez pas accès aux tâches de ce chantier." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Tâches du chantier" }} />
      <TachesView chantierId={Number(chantierId)} />
    </>
  );
}
