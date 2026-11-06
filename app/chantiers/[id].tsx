import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
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

  if (
    !user ||
    !permissions.canAccessExecution(user.role) ||
    !permissions.canReadChantiers(user.role)
  ) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Les chantiers sont accessibles selon les droits du mode exécution de votre entreprise."
      />
    );
  }

  return <PlaceholderView title="Détail du chantier" description={`Chantier : ${id}`} />;
}
