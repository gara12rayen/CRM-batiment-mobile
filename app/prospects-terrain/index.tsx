import { permissions } from "@/features/auth/utils/permissions";
import { MesProspectsView } from "@/features/prospects-terrain/views/MesProspectsView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function MesProspectsRoute() {
  return (
    <RouteProtegee titre="Mes prospects terrain" autorise={permissions.canSendProspectTerrain} refus="Les prospects terrain sont réservés à l’équipe.">
      <MesProspectsView />
    </RouteProtegee>
  );
}
