import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export function DevisView() {
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
        description="Vous n'avez pas accès aux devis."
      />
    );
  }

  return (
    <PlaceholderView
      title="Devis"
      description="La liste des devis sera intégrée dans une prochaine étape."
    >
      {permissions.canUseDevisIA(user.role) && (
        <Text style={{ marginTop: 12, color: "#64748B" }}>
          Le Devis IA est disponible depuis un devis en brouillon.
        </Text>
      )}
    </PlaceholderView>
  );
}
