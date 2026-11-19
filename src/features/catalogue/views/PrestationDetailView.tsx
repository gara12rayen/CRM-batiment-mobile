import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { formatUnite, nombreVersTexte } from "@/shared/utils/format";
import type { PrestationDetail } from "../models/Prestation";
import { getPrestation } from "../services/catalogue.service";
import { fourchettePrix, impactPrix } from "../utils/prix";
import { useCatalogueDetailViewModel } from "../viewmodels/useCatalogueDetailViewModel";
import { detailStyles as styles } from "./CatalogueDetailStyles";

/** One prestation, read only: description, price range, options and what it is made of. */
export function PrestationDetailView({ id }: { id: number }) {
  const vm = useCatalogueDetailViewModel<PrestationDetail>(id, getPrestation, "Impossible de charger la prestation.");

  if (vm.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  const p = vm.element;
  if (!p) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={vm.error ?? "Prestation introuvable."} />
        <Pressable accessibilityRole="button" onPress={vm.retry}>
          <Text style={styles.link}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const prix = fourchettePrix(p);
  const options = p.options.filter((o) => o.choix.some((c) => c.actif));
  const compositions = p.compositions ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.titre}>{p.nom}</Text>
        <Text style={styles.muted}>
          {p.categorie.nom}
          {p.sousCategorie ? ` › ${p.sousCategorie.nom}` : ""}
        </Text>
        {prix ? (
          <>
            <Text style={styles.muted}>Fourchette de prix</Text>
            <Text style={styles.prix}>{prix}</Text>
          </>
        ) : (
          <Text style={styles.muted}>Unité : {formatUnite(p.unite)}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={p.description ? styles.texte : styles.muted}>{p.description || "Pas de description."}</Text>
      </View>

      {options.length ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Options</Text>
          {options.map((o) => (
            <View key={o.id} style={styles.ligne}>
              <Text style={styles.valeur}>
                {o.nom}
                {o.obligatoire ? " (obligatoire)" : ""}
              </Text>
              {o.choix
                .filter((c) => c.actif)
                .map((c) => {
                  const impact = impactPrix(c.impactPrix);
                  return (
                    <View key={c.id} style={styles.rowBetween}>
                      <Text style={styles.label}>• {c.nom}</Text>
                      {impact ? <Text style={styles.valeur}>{impact}</Text> : null}
                    </View>
                  );
                })}
            </View>
          ))}
        </View>
      ) : null}

      {compositions.length ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Caractéristiques (pour 1 {formatUnite(p.unite)})</Text>
          {compositions.map((c) => {
            const element = c.materiau ?? c.serviceMainOeuvre;
            if (!element) return null;
            return (
              <View key={c.id} style={styles.rowBetween}>
                <Text style={styles.label}>
                  {c.materiau ? "Matériau" : "Main-d’œuvre"} : {element.nom}
                </Text>
                <Text style={styles.valeur}>
                  {nombreVersTexte(Number(c.quantiteParUnite))} {formatUnite(element.unite)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}
