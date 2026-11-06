import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export function ProspectsView() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canAccessCommercial(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous n'avez pas accès aux prospects."
      />
    );
  }

  return (
    <PlaceholderView
      title="Prospects"
      description="La liste des prospects sera intégrée dans une prochaine étape."
    />
  );
}