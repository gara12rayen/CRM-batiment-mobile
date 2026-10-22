import { useLocalSearchParams } from "expo-router";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ChantierDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderView title="Détail du chantier" description={`Chantier : ${id}`} />;
}
