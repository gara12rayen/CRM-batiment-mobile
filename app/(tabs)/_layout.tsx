import { Redirect, Tabs, type Href } from "expo-router";
import { useAccess } from "@/features/access/AccessProvider";
import type { MenuId } from "@/features/access/access.types";
import { Loading } from "@/shared/components/Loading";

export default function TabsLayout() {
  const { ready, user, profile } = useAccess();

  if (!ready) {
    return <Loading />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile.canUseApp) {
    return (
      <Redirect
        href={
          `/access-denied?code=${profile.denyCode ?? "ROLE_WEB_ONLY"}` as Href
        }
      />
    );
  }

  const visible = new Set(profile.tabs.map((tab) => tab.id));
  const tabHref = (id: MenuId, href: Href): Href | null =>
    visible.has(id) ? href : null;

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Accueil", href: tabHref("home", "/(tabs)") }}
      />
      <Tabs.Screen
        name="prospects"
        options={{
          title: "Demandes",
          href: tabHref("demandes", "/(tabs)/prospects"),
        }}
      />
      <Tabs.Screen
        name="devis"
        options={{ title: "Devis", href: tabHref("devis", "/(tabs)/devis") }}
      />
      <Tabs.Screen
        name="chantiers"
        options={{
          title: "Chantiers",
          href: tabHref("chantiers", "/(tabs)/chantiers" as Href),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{ title: "Clients", href: tabHref("clients", "/(tabs)/clients") }}
      />
      <Tabs.Screen
        name="factures"
        options={{ title: "Factures", href: tabHref("factures", "/(tabs)/factures" as Href) }}
      />
      <Tabs.Screen
        name="sav"
        options={{ title: "SAV", href: tabHref("sav", "/(tabs)/sav" as Href) }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "Catalogue",
          href: tabHref("catalogue", "/(tabs)/catalogue" as Href),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: "Planning",
          href: tabHref("planning", "/(tabs)/planning" as Href),
        }}
      />
      <Tabs.Screen
        name="validation"
        options={{
          title: "Validation",
          href: tabHref("validation", "/(tabs)/validation" as Href),
        }}
      />
      <Tabs.Screen
        name="heures"
        options={{ title: "Heures", href: tabHref("heures", "/(tabs)/heures" as Href) }}
      />
      <Tabs.Screen
        name="photos"
        options={{ title: "Photos", href: tabHref("photos", "/(tabs)/photos" as Href) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profil", href: tabHref("profile", "/(tabs)/profile") }}
      />
    </Tabs>
  );
}
