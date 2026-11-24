import { useLocalSearchParams } from "expo-router";
import { permissions } from "@/features/auth/utils/permissions";
import { ReceptionView } from "@/features/livraisons/views/ReceptionView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function ReceptionRoute() {
  const { commandeId } = useLocalSearchParams<{ commandeId: string }>();
  return (
    <RouteProtegee titre="Réceptionner" autorise={permissions.canReceiveDelivery} refus="La réception des livraisons est réservée à l’équipe du chantier.">
      <ReceptionView commandeId={Number(commandeId)} />
    </RouteProtegee>
  );
}
