import { useLocalSearchParams } from "expo-router";
import { permissions } from "@/features/auth/utils/permissions";
import { NouveauSavView } from "@/features/sav-terrain/views/NouveauSavView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function NouveauSavRoute() {
  const { chantierId } = useLocalSearchParams<{ chantierId?: string }>();
  return (
    <RouteProtegee titre="Nouveau ticket SAV" autorise={permissions.canCreateSav} refus="La création de ticket SAV est réservée à l’équipe.">
      <NouveauSavView chantierIdInitial={chantierId ? Number(chantierId) : undefined} />
    </RouteProtegee>
  );
}
