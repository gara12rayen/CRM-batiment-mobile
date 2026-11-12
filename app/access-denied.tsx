import { useLocalSearchParams } from "expo-router";
import { AccessDeniedView } from "@/features/access/AccessDeniedView";

export default function AccessDeniedRoute() {
  const params = useLocalSearchParams<{ code?: string; permission?: string }>();
  return <AccessDeniedView code={params.code} permission={params.permission} />;
}
