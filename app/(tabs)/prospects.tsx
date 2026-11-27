import { AccessGate } from "@/features/access/AccessGate";
import { ProspectsView } from "@/features/prospects/views/ProspectsView";

export default function ProspectsTabRoute() {
  return (
    <AccessGate permission="demandes.read">
      <ProspectsView />
    </AccessGate>
  );
}
