import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { UserRole } from "@/features/auth/models/auth.types";
import { PlaceholderView } from "./PlaceholderView";

type Props = {
  titre: string;
  autorise: (role: UserRole) => boolean;
  refus: string;
  children: ReactNode;
};

/** Screen title + role check (« Accès refusé » screen outside the user's scope). */
export function RouteProtegee({ titre, autorise, refus, children }: Props) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!user || !autorise(user.role)) return <PlaceholderView title="Accès refusé" description={refus} />;
  return (
    <>
      <Stack.Screen options={{ title: titre }} />
      {children}
    </>
  );
}
