import { Stack } from "expo-router";
import { CatalogueGuard } from "@/features/catalogue/views/CatalogueGuard";
import { CatalogueView } from "@/features/catalogue/views/CatalogueView";

export default function CatalogueRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Catalogue" }} />
      <CatalogueGuard>
        <CatalogueView />
      </CatalogueGuard>
    </>
  );
}
