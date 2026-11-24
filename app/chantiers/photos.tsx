import { useLocalSearchParams } from "expo-router";
import { permissions } from "@/features/auth/utils/permissions";
import { PhotosRapportsView } from "@/features/photos-rapports/views/PhotosRapportsView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function PhotosChantierRoute() {
  const { chantierId } = useLocalSearchParams<{ chantierId: string }>();
  return (
    <RouteProtegee titre="Photos et rapports" autorise={permissions.canReadPhotosChantier} refus="Les photos de chantier sont réservées à l’équipe.">
      <PhotosRapportsView chantierId={Number(chantierId)} />
    </RouteProtegee>
  );
}
