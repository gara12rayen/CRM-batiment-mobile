import { useLocalSearchParams } from "expo-router";
import ClientDetailScreen from "../../../src/features/admin-clients/ClientDetailScreen";

export default function ClientDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClientDetailScreen id={String(id)} />;
}