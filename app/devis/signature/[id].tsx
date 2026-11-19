import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { SignatureSurPlaceView } from "@/features/signature/views/SignatureSurPlaceView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function SignatureSurPlaceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canSignOnSite(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="La signature sur place est réservée au bureau (administrateur, technico-commercial, assistante)." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Signer sur place" }} />
      <SignatureSurPlaceView id={Number(id)} />
    </>
  );
}
