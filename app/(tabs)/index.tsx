import { Redirect, type Href } from "expo-router";
import { AccessGate } from "@/features/access/AccessGate";
import { resolveDefaultTabHref } from "@/features/access/accessEngine";
import { useAccess } from "@/features/access/AccessProvider";
import { DashboardView } from "@/features/dashboard/views/DashboardView";
import { Loading } from "@/shared/components/Loading";

export default function HomeTabRoute() {
  const { ready, has, profile } = useAccess();

  if (!ready) {
    return <Loading />;
  }

  if (!has("dashboard")) {
    return <Redirect href={resolveDefaultTabHref(profile) as Href} />;
  }

  return (
    <AccessGate permission="dashboard">
      <DashboardView />
    </AccessGate>
  );
}
