import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function CreateProspectRoute() {
  return (
    <AccessGate permission="demandes.write">
      <PlaceholderView title="Nouvelle demande" description="Formulaire à venir." />
    </AccessGate>
  );
}
