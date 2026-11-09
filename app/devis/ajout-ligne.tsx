import { Stack, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { AjoutLigneView } from "@/features/devis/views/AjoutLigneView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** /devis/ajout-ligne?devisId=12 — opened from a draft quote. */
export default function AjoutLigneRoute() {
  const { user } = useAuth();
  const { devisId } = useLocalSearchParams<{ devisId: string }>();

  if (!user || !permissions.canManageQuotes(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous ne pouvez pas modifier ce devis."
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Ajouter une ligne", presentation: "modal" }} />
      <AjoutLigneView devisId={Number(devisId)} />
    </>
  );
}
