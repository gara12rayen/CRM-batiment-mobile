import { useLocalSearchParams } from "expo-router";
import DetailScreen from "../../../src/features/admin-dashboard/DetailScreen";
import { IndicatorKey } from "../../../src/features/admin-dashboard/types";

export default function DetailRoute() {
  const { key } = useLocalSearchParams<{ key: IndicatorKey }>();
  return <DetailScreen indicator={key as IndicatorKey} />;
}
