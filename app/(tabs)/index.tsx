import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/context/AuthContext";
import { ChefDashboardView } from "@/features/dashboard/views/ChefDashboardView";
import { DashboardView } from "@/features/dashboard/views/DashboardView";

/** Onglet « Accueil » : tableau de bord du chef, ou tableau de bord commercial ; les portails vont sur « Portail ». */
export default function AccueilRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user?.role === "CHEF_CHANTIER") return <ChefDashboardView />;
  if (user?.role === "SOUS_TRAITANT" || user?.role === "FOURNISSEUR") return <Redirect href="/(tabs)/portail" />;
  return <DashboardView />;
}
