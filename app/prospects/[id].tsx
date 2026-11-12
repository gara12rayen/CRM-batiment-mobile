import { useLocalSearchParams } from "expo-router";
import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ProspectDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <AccessGate permission="demandes.read">
      <PlaceholderView title="Détail de la demande" description={`Demande : ${id}`} />
    </AccessGate>
  );
}
