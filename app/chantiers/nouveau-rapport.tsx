import { useLocalSearchParams } from "expo-router";
import { permissions } from "@/features/auth/utils/permissions";
import { EnvoiPhotosRapportView } from "@/features/photos-rapports/views/EnvoiPhotosRapportView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function NouveauRapportRoute() {
  const { chantierId } = useLocalSearchParams<{ chantierId: string }>();
  return (
    <RouteProtegee titre="Rapport de chantier" autorise={permissions.canSendPhotosChantier} refus="Les rapports sont réservés au chef de chantier et au bureau.">
      <EnvoiPhotosRapportView chantierId={Number(chantierId)} mode="rapport" />
    </RouteProtegee>
  );
}
