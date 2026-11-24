import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { SavListeView } from "@/features/sav-terrain/views/SavListeView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** « SAV » tab of the chef: his tickets and « Nouveau ticket SAV ». */
export default function SavTabRoute() {
  const { user } = useAuth();
  if (!user || !permissions.canReadExecutionSav(user.role)) {
    return <PlaceholderView title="Accès refusé" description="Vous n'avez pas accès au SAV." />;
  }
  return <SavListeView />;
}
