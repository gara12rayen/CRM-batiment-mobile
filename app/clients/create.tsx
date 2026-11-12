import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function CreateClientRoute() {
  return (
    <AccessGate permission="clients.write">
      <PlaceholderView title="Nouveau client" description="Formulaire à venir." />
    </AccessGate>
  );
}
