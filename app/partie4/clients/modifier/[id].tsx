import { useLocalSearchParams } from "expo-router";
import ClientFormScreen from "../../../../src/features/admin-clients/ClientFormScreen";

export default function ModifierClientRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClientFormScreen id={String(id)} />;
}