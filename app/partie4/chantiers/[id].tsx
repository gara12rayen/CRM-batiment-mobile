import { useLocalSearchParams } from "expo-router";
import ChantierDetailScreen from "../../../src/features/admin-chantiers/ChantierDetailScreen";

export default function ChantierDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChantierDetailScreen id={String(id)} />;
}