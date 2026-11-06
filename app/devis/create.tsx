import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function CreateDevisRoute() {
  const { user } = useAuth();

  if (
  !user ||
  !permissions.canManageQuotes(user.role)
) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous ne pouvez pas créer de devis."
      />
    );
  }

  return (
    <PlaceholderView
      title="Nouveau devis"
      description="Formulaire à venir."
    />
  );
}