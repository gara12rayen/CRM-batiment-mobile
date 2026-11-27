import { AccessGate } from "@/features/access/AccessGate";
import { DevisView } from "@/features/devis/views/DevisView";

export default function DevisRoute() {
  return (
    <AccessGate permission="devis.read">
      <DevisView />
    </AccessGate>
  );
}
