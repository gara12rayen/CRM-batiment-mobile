import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ChantiersRoute() {
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
        description="Vous n'avez pas accès aux chantiers."
      />
    );
  }

  return (
    <PlaceholderView
      title="Chantiers"
      description="Liste des chantiers à venir."
    />
  );
}
