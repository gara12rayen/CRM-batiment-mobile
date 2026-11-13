import { ActivityIndicator, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { TacheFormView } from "@/features/chantiers/views/TacheFormView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** /chantiers/tache?chantierId=12 (nouvelle tâche) ou ?chantierId=12&tacheId=5 (fiche). */
export default function TacheRoute() {
  const { chantierId, tacheId } = useLocalSearchParams<{ chantierId: string; tacheId?: string }>();
  const { user, isLoading } = useAuth();
  const id = Number(tacheId);
  const existante = Number.isInteger(id) && id > 0;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Créer : ADMIN, ASSISTANTE, CHEF_CHANTIER. Consulter : aussi le TECHNICO.
  const autorise = !!user && (existante ? permissions.canReadTasks(user.role) : permissions.canManageChantiers(user.role));
  if (!autorise) {
    return <PlaceholderView title="Accès non autorisé" description="Vous ne pouvez pas modifier les tâches de ce chantier." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: existante ? "Tâche" : "Nouvelle tâche" }} />
      <TacheFormView chantierId={Number(chantierId)} tacheId={existante ? id : undefined} />
    </>
  );
}
