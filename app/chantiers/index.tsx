import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ChantiersRoute() {
  return (
    <AccessGate permission="chantiers.read">
      <PlaceholderView title="Chantiers" description="Liste des chantiers à venir." />
    </AccessGate>
  );
}
