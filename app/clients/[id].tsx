import { useLocalSearchParams } from "expo-router";
import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ClientDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <AccessGate permission="clients.read">
      <PlaceholderView title="Détail du client" description={`Client : ${id}`} />
    </AccessGate>
  );
}
