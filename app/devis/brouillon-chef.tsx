import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { BrouillonChefView } from "@/features/devis-ia/views/BrouillonChefView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function BrouillonChefRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!user || !permissions.canCreateChefDraft(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="Le brouillon terrain est réservé au chef de chantier." />;
  }
  return (
    <>
      <Stack.Screen options={{ title: "Préparer un devis" }} />
      <BrouillonChefView />
    </>
  );
}
