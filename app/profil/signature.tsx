import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { MaSignatureView } from "@/features/signature/views/MaSignatureView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function MaSignatureRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canManageOwnSignature(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="La signature est réservée au bureau et aux chefs de chantier." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Ma signature" }} />
      <MaSignatureView />
    </>
  );
}
