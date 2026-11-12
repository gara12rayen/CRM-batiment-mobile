import { useLocalSearchParams } from "expo-router";
import { AccessGate } from "@/features/access/AccessGate";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DevisDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <AccessGate permission="devis.read">
      <PlaceholderView title="Détail du devis" description={`Devis : ${id}`} />
    </AccessGate>
  );
}
