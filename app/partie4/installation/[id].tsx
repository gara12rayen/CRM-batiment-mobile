import { useLocalSearchParams } from "expo-router";
import InstallationDetailScreen from "../../../src/features/admin-installations/InstallationDetailScreen";

export default function InstallationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <InstallationDetailScreen id={String(id)} />;
}