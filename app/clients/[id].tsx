import { useLocalSearchParams } from "expo-router";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function ClientDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderView title="Détail du client" description={`Client : ${id}`} />;
}
