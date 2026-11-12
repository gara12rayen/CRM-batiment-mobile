import { AccessPlaceholderScreen } from "@/features/access/AccessPlaceholderScreen";

export default function FacturesTabRoute() {
  return (
    <AccessPlaceholderScreen
      permission="factures.read"
      title="Factures"
      description="La liste des factures sera intégrée dans une prochaine étape."
    />
  );
}
