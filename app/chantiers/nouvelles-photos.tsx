import { useLocalSearchParams } from "expo-router";
import { permissions } from "@/features/auth/utils/permissions";
import { EnvoiPhotosRapportView } from "@/features/photos-rapports/views/EnvoiPhotosRapportView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function NouvellesPhotosRoute() {
  const { chantierId } = useLocalSearchParams<{ chantierId: string }>();
  return (
    <RouteProtegee titre="Ajouter des photos" autorise={permissions.canSendPhotosChantier} refus="L’envoi de photos est réservé au chef de chantier et au bureau.">
      <EnvoiPhotosRapportView chantierId={Number(chantierId)} mode="photos" />
    </RouteProtegee>
  );
}
