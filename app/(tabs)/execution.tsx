import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { ChefDashboardView } from "@/features/dashboard/views/ChefDashboardView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** Onglet « Exécution » : tableau de bord du chef de chantier (le bureau y voit tous les chantiers). */
export default function ExecutionRoute() {
  const { user } = useAuth();
  const allowed = user !== null && permissions.canAccessExecution(user.role);

  if (!allowed) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Votre rôle ne donne pas accès aux fonctionnalités d’exécution de l’API."
      />
    );
  }

  return <ChefDashboardView />;
}
