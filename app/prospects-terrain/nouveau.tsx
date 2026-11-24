import { permissions } from "@/features/auth/utils/permissions";
import { NouveauProspectView } from "@/features/prospects-terrain/views/NouveauProspectView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function NouveauProspectRoute() {
  return (
    <RouteProtegee titre="Nouveau prospect" autorise={permissions.canSendProspectTerrain} refus="Les prospects terrain sont réservés à l’équipe.">
      <NouveauProspectView />
    </RouteProtegee>
  );
}
