import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";
import { DemandesView } from "./DemandesView";

/** Same screen for the « Prospects » tab and for /prospects (links of the home screen). */
export function DemandesRoute() {
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
  return <DemandesView />;
}
