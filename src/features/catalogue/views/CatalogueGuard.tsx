import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** Catalogue screens: Admin, Commercial, Assistante, Chef de chantier (the chef without prices). */
export function CatalogueGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!user || !permissions.canReadCatalogue(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="Vous n’avez pas accès au catalogue." />;
  }
  return <>{children}</>;
}
