import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import type { DevisDetail } from "@/features/devis/models/Devis";
import { getDevis } from "@/features/devis/services/devis.service";
import { DevisIAView } from "@/features/devis-ia/views/DevisIAView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** /devis/ia?id=… — checks the draft and the role, then opens the Devis IA. */
export default function DevisIARoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, isLoading } = useAuth();
  const [devis, setDevis] = useState<Pick<DevisDetail, "statut" | "createur"> | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  useEffect(() => {
    if (!id || !user || !permissions.canUseDevisIA(user.role)) {
      setLoadingQuote(false);
      return;
    }

    let active = true;
    getDevis(Number(id))
      .then((d) => {
        if (active) setDevis({ statut: d.statut, createur: d.createur });
      })
      .catch(() => {
        if (active) setDevis(null);
      })
      .finally(() => {
        if (active) setLoadingQuote(false);
      });

    return () => {
      active = false;
    };
  }, [id, user]);

  if (isLoading || loadingQuote) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (
    !user ||
    !id ||
    !permissions.canUseDevisIAForQuote(user.role, devis?.statut, { createurId: devis?.createur?.id, userId: user.id })
  ) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Le Devis IA se fait uniquement sur un devis en brouillon. Le chef de chantier l’utilise seulement sur les brouillons qu’il a créés."
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Devis IA" }} />
      <DevisIAView id={Number(id)} />
    </>
  );
}
