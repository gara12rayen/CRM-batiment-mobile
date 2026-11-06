import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function CreateProspectRoute() {
  const { user } = useAuth();

  if (!user || !permissions.canAccessCommercial(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous ne pouvez pas créer de prospects."
      />
    );
  }

  return (
    <PlaceholderView
      title="Nouveau prospect"
      description="Formulaire à venir."
    />
  );
}