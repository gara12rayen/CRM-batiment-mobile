import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { restoreSession } from "@/features/auth/services/sessionService";
import { subscribeToSessionExpiration } from "@/features/auth/services/sessionEvents";

export function SessionLifecycle() {
  const segments = useSegments();
  const router = useRouter();
  const wasBackgrounded = useRef(false);
  const isAuthRoute = segments[0] === "(auth)";

  useEffect(() => {
    const handleAppStateChange = async (state: AppStateStatus) => {
      if (state !== "active") {
        wasBackgrounded.current = true;
        return;
      }

      if (!wasBackgrounded.current || isAuthRoute) {
        return;
      }

      wasBackgrounded.current = false;
      const result = await restoreSession();
      if (!result.authenticated) {
        router.replace("/(auth)/login");
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    const unsubscribe = subscribeToSessionExpiration(() => {
      if (!isAuthRoute) {
        router.replace("/(auth)/login");
      }
    });

    return () => {
      subscription.remove();
      unsubscribe();
    };
  }, [isAuthRoute, router, segments]);

  return null;
}
