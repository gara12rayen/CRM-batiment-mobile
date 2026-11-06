import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { apiClient } from "@/core/api/api-client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

type SupplierDashboard = {
  aAccuser: number;
  aExpedier: number;
  enLivraison: number;
  livrees: number;
};

type SubcontractorDashboard = {
  chantiersActifs: number;
  tachesOuvertes: number;
  rapportsARevoir: number;
  rapportsEnAttente: number;
};

type PortalDashboard = SupplierDashboard | SubcontractorDashboard;

export default function PortalRoute() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isSupplier = user !== null && permissions.canAccessSupplierOrders(user.role);
  const isSubcontractor = user !== null && permissions.canAccessSubcontractorPortal(user.role);

  useEffect(() => {
    if (!isSupplier && !isSubcontractor) {
      setLoading(false);
      return;
    }

    let active = true;
    const endpoint = isSupplier
      ? "/portail/fournisseur/tableau-de-bord"
      : "/portail/sous-traitant/tableau-de-bord";

    apiClient
      .get<PortalDashboard>(endpoint)
      .then(({ data }) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        if (active) setError("Impossible de charger les informations du portail.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isSupplier, isSubcontractor]);

  if (!user || (!isSupplier && !isSubcontractor)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Ce portail est réservé aux comptes fournisseur et sous-traitant."
      />
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !dashboard) {
    return (
      <PlaceholderView
        title={isSupplier ? "Portail fournisseur" : "Portail sous-traitant"}
        description={error ?? "Aucune donnée de portail disponible."}
      />
    );
  }

  const metrics = isSupplier
    ? [
        ["À accuser réception", (dashboard as SupplierDashboard).aAccuser],
        ["À expédier", (dashboard as SupplierDashboard).aExpedier],
        ["En livraison", (dashboard as SupplierDashboard).enLivraison],
        ["Livrées", (dashboard as SupplierDashboard).livrees],
      ]
    : [
        ["Chantiers actifs", (dashboard as SubcontractorDashboard).chantiersActifs],
        ["Tâches ouvertes", (dashboard as SubcontractorDashboard).tachesOuvertes],
        ["Rapports à reprendre", (dashboard as SubcontractorDashboard).rapportsARevoir],
        ["Rapports en attente", (dashboard as SubcontractorDashboard).rapportsEnAttente],
      ];

  return (
    <PlaceholderView
      title={isSupplier ? "Portail fournisseur" : "Portail sous-traitant"}
      description={
        isSupplier
          ? "Suivi de vos commandes fournisseur."
          : "Suivi de vos chantiers, tâches et rapports."
      }
    >
      {metrics.map(([label, value]) => (
        <View key={label} style={{ marginTop: 14 }}>
          <Text style={{ fontWeight: "600" }}>{label}</Text>
          <Text>{value}</Text>
        </View>
      ))}
    </PlaceholderView>
  );
}
