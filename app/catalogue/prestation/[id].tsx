import { Stack, useLocalSearchParams } from "expo-router";
import { CatalogueGuard } from "@/features/catalogue/views/CatalogueGuard";
import { PrestationDetailView } from "@/features/catalogue/views/PrestationDetailView";

export default function PrestationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ title: "Prestation" }} />
      <CatalogueGuard>
        <PrestationDetailView id={Number(id)} />
      </CatalogueGuard>
    </>
  );
}
