import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

/** Onglet « SAV » du chef : l'écran sera fait dans la tâche « module ticket SAV » (routes API prêtes : /sav). */
export default function SavTabRoute() {
  const { user } = useAuth();
  if (!user || !permissions.canReadExecutionSav(user.role)) {
    return <PlaceholderView title="Accès non autorisé" description="Vous n'avez pas accès au SAV." />;
  }
  return <PlaceholderView title="SAV" description="La liste et la création des tickets SAV seront disponibles dans une prochaine version. Les SAV ouverts sont déjà sur l'Accueil." />;
}
