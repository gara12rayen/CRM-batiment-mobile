
import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const isCommercial = permissions.canAccessCommercial(user.role);
  const canReadClients = permissions.canReadClients(user.role);
  const canReadQuotes = permissions.canReadQuotes(user.role);
  const canAccessExecution = permissions.canAccessExecution(user.role);

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          href: isCommercial ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          href: canReadClients ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="prospects"
        options={{
          title: "Prospects",
          href: isCommercial ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="devis"
        options={{
          title: "Devis",
          href: canReadQuotes ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="execution"
        options={{
          title: "Exécution",
          href: canAccessExecution ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="portail"
        options={{
          title: "Portail",
          href:
            permissions.canAccessSupplierOrders(user.role) ||
            permissions.canAccessSubcontractorPortal(user.role)
              ? undefined
              : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{ title: "Profil" }}
      />
    </Tabs>
  );
}
