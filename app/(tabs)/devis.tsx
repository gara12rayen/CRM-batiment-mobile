
import { DevisView } from "@/features/devis/views/DevisView";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DevisTabRoute() {
  const { user } = useAuth();

  if (!user || !permissions.canReadQuotes(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous ne pouvez pas consulter les devis."
      />
    );
  }

  return <DevisView />;
}
