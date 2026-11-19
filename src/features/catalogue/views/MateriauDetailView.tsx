import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { formatEuros, formatUnite } from "@/shared/utils/format";
import type { Materiau } from "../models/Catalogue";
import { getMateriau } from "../services/catalogue.service";
import { useCatalogueDetailViewModel } from "../viewmodels/useCatalogueDetailViewModel";
import { detailStyles as styles } from "./CatalogueDetailStyles";

function Ligne({ label, valeur }: { label: string; valeur?: string | null }) {
  if (!valeur) return null;
  return (
    <View style={styles.rowBetween}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valeur}>{valeur}</Text>
    </View>
  );
}

/** One material, read only. The purchase price is shown to the office only (absent for a chef). */
export function MateriauDetailView({ id }: { id: number }) {
  const vm = useCatalogueDetailViewModel<Materiau>(id, getMateriau, "Impossible de charger le matériau.");

  if (vm.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  const m = vm.element;
  if (!m) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={vm.error ?? "Matériau introuvable."} />
        <Pressable accessibilityRole="button" onPress={vm.retry}>
          <Text style={styles.link}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.titre}>{m.nom}</Text>
        {!m.actif ? <Text style={styles.badge}>Plus utilisé</Text> : null}
        {m.prixAchatFixe !== undefined ? (
          <>
            <Text style={styles.muted}>Prix d’achat</Text>
            <Text style={styles.prix}>
              {formatEuros(m.prixAchatFixe)} HT / {formatUnite(m.unite)}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Caractéristiques</Text>
        <Ligne label="Unité" valeur={formatUnite(m.unite)} />
        <Ligne label="Couleur" valeur={m.couleur} />
        <Ligne label="Finition" valeur={m.finition} />
        <Ligne label="Fournisseur" valeur={m.fournisseur?.nom} />
      </View>
    </ScrollView>
  );
}
