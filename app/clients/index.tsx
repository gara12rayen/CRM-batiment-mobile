import { AccessGate } from "@/features/access/AccessGate";
import { ClientsView } from "@/features/clients/views/ClientsView";

export default function ClientsRoute() {
  return (
    <AccessGate permission="clients.read">
      <ClientsView />
    </AccessGate>
  );
}
