import { Stack, useLocalSearchParams } from "expo-router";
import { CatalogueGuard } from "@/features/catalogue/views/CatalogueGuard";
import { MateriauDetailView } from "@/features/catalogue/views/MateriauDetailView";

export default function MateriauDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ title: "Matériau" }} />
      <CatalogueGuard>
        <MateriauDetailView id={Number(id)} />
      </CatalogueGuard>
    </>
  );
}
