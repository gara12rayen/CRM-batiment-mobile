import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { apiClient } from "@/core/api/api-client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DevisDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const [quoteStatus, setQuoteStatus] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  useEffect(() => {
    if (!id || !user || !permissions.canReadQuotes(user.role)) return;
    let active = true;
    setLoadingQuote(true);
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
        description="Vous ne pouvez pas consulter ce devis."
      />
    );
  }

  if (loadingQuote) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PlaceholderView
      title="Détail du devis"
      description={`Devis : ${id}`}
    >
      {Boolean(id) && permissions.canUseDevisIAForQuote(user.role, quoteStatus) && (
        <Link
          href={{ pathname: "/devis/ia", params: { id } }}
          style={{ marginTop: 16, color: "#2563EB", fontWeight: "600" }}
        >
          <Text>Ouvrir le Devis IA</Text>
        </Link>
      )}
    </PlaceholderView>
  );
}
