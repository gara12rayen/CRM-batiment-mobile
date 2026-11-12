import { AccessGate } from "@/features/access/AccessGate";
import { ClientsView } from "@/features/clients/views/ClientsView";

export default function ClientsTabRoute() {
  return (
    <AccessGate permission="clients.read">
      <ClientsView />
    </AccessGate>
  );
}
