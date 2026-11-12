import { AccessGate } from "@/features/access/AccessGate";
import { ProspectsView } from "@/features/prospects/views/ProspectsView";

export default function ProspectsRoute() {
  return (
    <AccessGate permission="demandes.read">
      <ProspectsView />
    </AccessGate>
  );
}
