import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { formatDate, formatEuros, formatUnite, fullName } from "@/shared/utils/format";
import { LigneEditModal } from "../components/LigneEditModal";
import { DEVIS_STATUT, TAUX_TVA, type DevisDetail } from "../models/Devis";
import { useDevisDetailViewModel } from "../viewmodels/useDevisDetailViewModel";
import { useDevisEditionViewModel } from "../viewmodels/useDevisEditionViewModel";

/** A quote: client, lines (editable on a draft), VAT, totals and internal notes. */
export function DevisDetailView({ id, footer }: { id: number; footer?: (devis: DevisDetail) => ReactNode }) {
  const vm = useDevisDetailViewModel(id);
  const ed = useDevisEditionViewModel(vm.devis, vm.setDevis);
  const d = vm.devis;
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(d?.notes ?? ""), [d?.notes]);

  if (vm.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  if (!d) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={vm.error ?? "Devis introuvable."} />
        <Pressable accessibilityRole="button" onPress={vm.retry}>
          <Text style={styles.link}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const statut = DEVIS_STATUT[d.statut] ?? { label: d.statut, couleur: colors.text.muted, fond: colors.surface.muted };
  const montants = d.totalTTC !== undefined;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.reference}>{d.reference}</Text>
            <Text style={[styles.badge, { color: statut.couleur, backgroundColor: statut.fond }]}>{statut.label}</Text>
          </View>
          <Text style={styles.client}>{fullName(d.client) || "Client"}</Text>
          <Text style={styles.muted}>
            Créé le {formatDate(d.dateCreation)}
            {d.createur ? ` par ${fullName(d.createur)}` : ""} · version {d.versionCourante}
          </Text>
          {d.client.adresseChantier ? <Text style={styles.muted}>Chantier : {d.client.adresseChantier}</Text> : null}
        </View>

        {/* Lines */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Lignes ({d.lignes.length})</Text>
          {!d.lignes.length ? <Text style={styles.muted}>Aucune ligne pour l’instant.</Text> : null}
          {d.lignes.map((l) => (
            <Pressable key={l.id} accessibilityRole={ed.modifiable ? "button" : undefined} disabled={!ed.modifiable} onPress={() => ed.ouvrirLigne(l)} style={({ pressed }) => [styles.ligne, pressed && styles.pressed]}>
              <View style={styles.flex}>
                <Text style={styles.ligneNom}>{l.description ?? "Prestation"}</Text>
                {l.optionsChoisies?.length ? <Text style={styles.muted}>{l.optionsChoisies.map((o) => `${o.optionNom} : ${o.choixNom}`).join(" · ")}</Text> : null}
                <Text style={styles.muted}>
                  {String(l.quantite).replace(".", ",")} {formatUnite(l.unite)}
                  {montants ? ` × ${formatEuros(l.prixUnitaireVente)}` : ""}
                </Text>
              </View>
              {montants ? <Text style={styles.ligneTotal}>{formatEuros(l.totalHT)}</Text> : null}
            </Pressable>
          ))}
          {ed.modifiable ? (
            <Pressable accessibilityRole="button" onPress={ed.ajouterLigne} style={styles.ajouter}>
              <Text style={styles.ajouterTexte}>+ Ajouter une ligne</Text>
            </Pressable>
          ) : null}
        </View>

        {/* VAT and totals (hidden for the chef de chantier: the API sends no amount) */}
        {montants ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>TVA</Text>
            <View style={styles.chips}>
              {TAUX_TVA.map((t) => {
                const actif = Number(d.tauxTVA) === t;
                return (
                  <Pressable key={t} accessibilityRole="button" accessibilityState={{ selected: actif }} disabled={!ed.modifiable || ed.enregistrement} onPress={() => ed.changerTva(t)} style={[styles.chip, actif && styles.chipActif, !ed.modifiable && !actif && styles.dim]}>
                    <Text style={[styles.chipTexte, actif && styles.chipTexteActif]}>{String(t).replace(".", ",")} %</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Total HT</Text>
              <Text style={styles.valeur}>{formatEuros(d.totalHT)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>TVA</Text>
              <Text style={styles.valeur}>{formatEuros(d.totalTVA)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.totalLabel}>Total TTC</Text>
              <Text style={styles.total}>{formatEuros(d.totalTTC)}</Text>
            </View>
          </View>
        ) : null}

        {/* Internal notes */}
        {d.notes !== undefined ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes internes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              onEndEditing={() => ed.enregistrerNotes(notes)}
              editable={ed.modifiable}
              multiline
              placeholder="Visible seulement par l’équipe"
              placeholderTextColor={colors.text.muted}
              style={styles.notes}
              accessibilityLabel="Notes internes"
            />
          </View>
        ) : null}

        {footer?.(d)}
      </ScrollView>

      <LigneEditModal ligne={ed.ligneOuverte} enregistrement={ed.enregistrement} onFermer={ed.fermerLigne} onEnregistrer={(q, p) => void ed.modifierLigneOuverte(q, p)} onSupprimer={ed.supprimerLigneOuverte} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  flex: { flex: 1, gap: 2 },
  reference: { fontSize: 18, fontWeight: "800", color: colors.brand[900] },
  badge: { fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  client: { fontSize: 15, fontWeight: "600", color: colors.text.DEFAULT },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  ligne: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.DEFAULT },
  pressed: { opacity: 0.7 },
  ligneNom: { fontSize: 14, fontWeight: "600", color: colors.text.DEFAULT },
  ligneTotal: { fontSize: 14, fontWeight: "700", color: colors.text.DEFAULT },
  ajouter: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand[500], alignItems: "center", justifyContent: "center", marginTop: spacing.xs },
  ajouterTexte: { color: colors.brand[700], fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, paddingHorizontal: spacing.md, paddingVertical: 6 },
  chipActif: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  chipTexte: { fontSize: 13, fontWeight: "600", color: colors.text.DEFAULT },
  chipTexteActif: { color: colors.white },
  dim: { opacity: 0.4 },
  valeur: { fontSize: 14, color: colors.text.DEFAULT },
  totalLabel: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  total: { fontSize: 18, fontWeight: "800", color: colors.brand[900] },
  notes: { minHeight: 80, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 10, padding: spacing.md, fontSize: 15, color: colors.text.DEFAULT, textAlignVertical: "top" },
  link: { color: colors.brand[700], fontWeight: "700" },
});
