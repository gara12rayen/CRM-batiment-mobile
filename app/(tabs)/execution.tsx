import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

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

  return (
    <PlaceholderView
      title="Mode exécution"
      description="Le suivi opérationnel des chantiers sera intégré dans une prochaine étape."
    />
  );
}
