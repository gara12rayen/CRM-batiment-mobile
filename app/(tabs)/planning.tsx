import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** Onglet « Planning » du chef : l'écran sera fait dans une prochaine tâche (route API prête : GET /planning). */
export default function PlanningTabRoute() {
  const { user } = useAuth();
  if (!user || !permissions.canReadPlanning(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="Vous n'avez pas accès au planning." />;
  }
  return <PlaceholderView title="Planning" description="Le planning des équipes sera disponible dans une prochaine version. Les tâches en retard sont déjà sur l'Accueil." />;
}
