import { useLocalSearchParams } from "expo-router";
import { permissions } from "@/features/auth/utils/permissions";
import { LivraisonsChantierView } from "@/features/livraisons/views/LivraisonsChantierView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function LivraisonsChantierRoute() {
  const { chantierId } = useLocalSearchParams<{ chantierId: string }>();
  return (
    <RouteProtegee titre="Livraisons" autorise={permissions.canReceiveDelivery} refus="Les livraisons sont réservées à l’équipe du chantier.">
      <LivraisonsChantierView chantierId={Number(chantierId)} />
    </RouteProtegee>
  );
}
