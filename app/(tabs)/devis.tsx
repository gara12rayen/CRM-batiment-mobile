import { AccessGate } from "@/features/access/AccessGate";
import { DevisView } from "@/features/devis/views/DevisView";

export default function DevisTabRoute() {
  return (
    <AccessGate permission="devis.read">
      <DevisView />
    </AccessGate>
  );
}
