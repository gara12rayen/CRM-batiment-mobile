import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { restoreSession } from "@/features/auth/services/sessionService";

export default function IndexRoute() {
  const [destination, setDestination] = useState<
    "/(tabs)" | "/(auth)/login" | null
  >(null);

  useEffect(() => {
    let mounted = true;

    void restoreSession().then((result) => {
      if (!mounted) {
        return;
      }

      setDestination(result.authenticated ? "/(tabs)" : "/(auth)/login");
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

  return <Redirect href={destination} />;
}
