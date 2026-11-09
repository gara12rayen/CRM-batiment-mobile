import { Stack, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { NouveauDevisView } from "@/features/devis/views/NouveauDevisView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** /devis/create  or  /devis/create?clientId=12 (from a client page: the draft is created at once). */
export default function CreateDevisRoute() {
  const { user } = useAuth();
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();

  if (!user || !permissions.canManageQuotes(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous ne pouvez pas créer de devis."
      />
    );
  }

  const id = Number(clientId);
  return (
    <>
      <Stack.Screen options={{ title: "Nouveau devis" }} />
      <NouveauDevisView clientId={Number.isInteger(id) && id > 0 ? id : undefined} />
    </>
  );
}
