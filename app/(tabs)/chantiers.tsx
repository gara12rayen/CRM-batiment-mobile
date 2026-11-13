import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { ChantiersView } from "@/features/chantiers/views/ChantiersView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** Onglet « Chantiers » : liste (le chef ne voit que ses chantiers) → tâches. */
export default function ChantiersTabRoute() {
  const { user } = useAuth();
  if (!user || !permissions.canReadChantiers(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="Vous n'avez pas accès aux chantiers." />;
  }
  return <ChantiersView />;
}
