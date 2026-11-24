import { Stack } from "expo-router";
import { DemandesRoute } from "@/features/demandes/views/DemandesRoute";

export default function DemandesStackRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Demandes de devis" }} />
      <DemandesRoute />
    </>
  );
}
