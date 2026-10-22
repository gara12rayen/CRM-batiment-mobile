import { useLocalSearchParams } from "expo-router";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ProspectDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderView title="Détail du prospect" description={`Prospect : ${id}`} />;
}
