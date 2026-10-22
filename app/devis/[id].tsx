import { useLocalSearchParams } from "expo-router";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DevisDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderView title="Détail du devis" description={`Devis : ${id}`} />;
}
