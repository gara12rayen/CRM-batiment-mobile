import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { apiClient } from "@/core/api/api-client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DevisIARoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, isLoading } = useAuth();
  const [quoteStatus, setQuoteStatus] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  useEffect(() => {
    if (!id || !user || !permissions.canUseDevisIA(user.role)) {
      setLoadingQuote(false);
      return;
    }

    let active = true;
    apiClient
      .get<{ statut: string }>(`/devis/${id}`)
      .then(({ data }) => {
        if (active) setQuoteStatus(data.statut);
      })
      .catch(() => {
        if (active) setQuoteStatus(null);
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
    !permissions.canUseDevisIAForQuote(user.role, quoteStatus)
  ) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Le Devis IA est réservé à l’admin, au technico et à l’assistante, uniquement sur un devis en brouillon."
      />
    );
  }

  return (
    <PlaceholderView
      title="Devis IA"
      description={id ? `Assistant IA pour le devis ${id}.` : "Ouvrez le Devis IA depuis un devis existant."}
    />
  );
}
