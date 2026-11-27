import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function CreateDevisRoute() {
  return (
    <AccessGate permission="devis.write">
      <PlaceholderView title="Nouveau devis" description="Formulaire à venir." />
    </AccessGate>
  );
}
