import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { resolveAccess } from "@/features/access/accessEngine";
import type { AccessDenyCode } from "@/features/access/access.types";
import { clearSession } from "@/features/auth/services/authStorage";
import { restoreSession } from "@/features/auth/services/sessionService";

export default function IndexRoute() {
  const [destination, setDestination] = useState<
    "/(tabs)" | "/(auth)/login" | "/access-denied" | null
  >(null);
  const [denyCode, setDenyCode] = useState<AccessDenyCode>("ROLE_WEB_ONLY");

  useEffect(() => {
    let mounted = true;

    void restoreSession().then(async (result) => {
      if (!mounted) {
        return;
      }

      if (!result.authenticated) {
        setDestination("/(auth)/login");
        return;
      }

      const profile = resolveAccess(result.user);
      if (!profile.canUseApp) {
        await clearSession();
        setDenyCode(profile.denyCode ?? "ROLE_WEB_ONLY");
        setDestination("/access-denied");
        return;
      }

      setDestination("/(tabs)");
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!destination) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (destination === "/access-denied") {
    return <Redirect href={`/access-denied?code=${denyCode}` as Href} />;
  }

  return <Redirect href={destination} />;
}
