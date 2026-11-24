import { permissions } from "@/features/auth/utils/permissions";
import { EnvoisEnAttenteView } from "@/features/terrain/EnvoisEnAttenteView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function EnvoisRoute() {
  return (
    <RouteProtegee titre="Envois en attente" autorise={permissions.canReadChantierFiche} refus="Rien à envoyer pour ce compte.">
      <EnvoisEnAttenteView />
    </RouteProtegee>
  );
}
