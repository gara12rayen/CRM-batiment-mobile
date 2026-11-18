import { useLocalSearchParams } from "expo-router";
import DevisDetailScreen from "../../../src/features/admin-devis/DevisDetailScreen";

export default function DevisDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DevisDetailScreen id={String(id)} />;
}
