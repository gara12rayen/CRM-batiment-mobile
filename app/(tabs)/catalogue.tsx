import { AccessPlaceholderScreen } from "@/features/access/AccessPlaceholderScreen";

export default function CatalogueTabRoute() {
  return (
    <AccessPlaceholderScreen
      permission="catalogue.read"
      title="Catalogue"
      description="Le catalogue sera intégré dans une prochaine étape."
    />
  );
}
