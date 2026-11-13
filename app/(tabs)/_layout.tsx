import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/features/auth/context/AuthContext";
import { ongletVisible, type OngletNom } from "@/features/auth/utils/navigation";

/**
 * Barre de navigation inférieure. Les onglets de chaque rôle sont définis dans
 * src/features/auth/utils/navigation.ts (ONGLETS_PAR_ROLE) ; les autres sont masqués (href: null).
 */
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

  const href = (onglet: OngletNom) => (ongletVisible(user.role, onglet) ? undefined : null);

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Accueil", href: href("index") }} />
      <Tabs.Screen name="clients" options={{ title: "Clients", href: href("clients") }} />
      <Tabs.Screen name="prospects" options={{ title: "Prospects", href: href("prospects") }} />
      <Tabs.Screen name="devis" options={{ title: "Devis", href: href("devis") }} />
      <Tabs.Screen name="chantiers" options={{ title: "Chantiers", href: href("chantiers") }} />
      <Tabs.Screen name="planning" options={{ title: "Planning", href: href("planning") }} />
      <Tabs.Screen name="sav" options={{ title: "SAV", href: href("sav") }} />
      <Tabs.Screen name="portail" options={{ title: "Portail", href: href("portail") }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", href: href("profile") }} />
      {/* Ancien onglet « Exécution » : son contenu (tableau de bord du chef) est maintenant l'Accueil du chef */}
      <Tabs.Screen name="execution" options={{ title: "Exécution", href: null }} />
    </Tabs>
  );
}
