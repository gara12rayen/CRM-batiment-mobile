import { useLocalSearchParams } from "expo-router";
import { permissions } from "@/features/auth/utils/permissions";
import { NouvelleDepenseView } from "@/features/depenses/views/NouvelleDepenseView";
import { RouteProtegee } from "@/shared/components/RouteProtegee";

export default function NouvelleDepenseRoute() {
  const { chantierId, commandeId } = useLocalSearchParams<{ chantierId?: string; commandeId?: string }>();
  return (
    <RouteProtegee titre="Facture fournisseur" autorise={permissions.canSendSupplierInvoice} refus="L’envoi de factures fournisseur est réservé à l’équipe.">
      <NouvelleDepenseView chantierId={chantierId ? Number(chantierId) : undefined} commandeId={commandeId ? Number(commandeId) : undefined} />
    </RouteProtegee>
  );
}
