import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { CHANTIER_STATUT } from "@/features/chantiers/models/Chantier";
import { formatDate, fullName } from "@/shared/utils/format";
import { jourDe } from "@/shared/utils/dates";
import { COMMANDE_STATUT, SAV_PRIORITE, SAV_STATUT, type Bloc } from "../models/ChefDashboard";
import { useChefDashboardViewModel } from "../viewmodels/useChefDashboardViewModel";

/** Nombre d'éléments montrés par bloc (le total reste affiché dans l'en-tête). */
const MAX_PAR_BLOC = 5;

function Badge({ label, couleur, fond }: { label: string; couleur: string; fond: string }) {
  return <Text style={[styles.badge, { color: couleur, backgroundColor: fond }]}>{label}</Text>;
}

function Barre({ valeur }: { valeur: number }) {
  return (
    <View style={styles.barre} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: valeur }}>
      <View style={[styles.barreRemplie, { width: `${Math.max(0, Math.min(100, valeur))}%` }]} />
    </View>
  );
}

/** Un bloc : titre + compteur, puis la liste (ou le message vide / l'erreur du bloc). */
function Section<T>({ titre, alerte, bloc, vide, children }: { titre: string; alerte?: boolean; bloc: Bloc<T>; vide: string; children: (items: T[]) => ReactNode }) {
  const enAlerte = alerte && bloc.total > 0;
  return (
    <View style={styles.section}>
      <View style={styles.sectionEntete}>
        <Text style={styles.sectionTitre}>{titre}</Text>
        <Text style={[styles.compteur, enAlerte && styles.compteurAlerte]}>{bloc.erreur ? "—" : bloc.total}</Text>
      </View>
      {bloc.erreur ? (
        <Text style={styles.erreur}>{bloc.erreur}</Text>
      ) : bloc.donnees.length ? (
        <>
          {children(bloc.donnees.slice(0, MAX_PAR_BLOC))}
          {bloc.total > MAX_PAR_BLOC ? <Text style={styles.plus}>… et {bloc.total - MAX_PAR_BLOC} de plus</Text> : null}
        </>
      ) : (
        <Text style={styles.vide}>{vide}</Text>
      )}
    </View>
  );
}

/**
 * Tableau de bord d'exécution (chef de chantier) : chantiers du jour, tâches en retard,
 * livraisons attendues et SAV ouverts. Le bureau voit la même chose pour tous les chantiers.
 */
export function ChefDashboardView() {
  const router = useRouter();
  const vm = useChefDashboardViewModel();
  const ouvrirTaches = (chantierId: number) => router.push({ pathname: "/chantiers/taches", params: { chantierId: String(chantierId) } });

  if (vm.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}>
      <Text style={styles.date}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</Text>

      {/* Chiffres clés : un coup d'œil, puis le détail en dessous */}
      <View style={styles.tuiles}>
        {[
          { label: "Chantiers du jour", bloc: vm.chantiersDuJour, alerte: false },
          { label: "Tâches en retard", bloc: vm.tachesEnRetard, alerte: true },
          { label: "Livraisons attendues", bloc: vm.livraisons, alerte: false },
          { label: "SAV ouverts", bloc: vm.sav, alerte: true },
        ].map((t) => (
          <View key={t.label} style={styles.tuile}>
            <Text style={[styles.tuileValeur, t.alerte && t.bloc.total > 0 && styles.tuileAlerte]}>{t.bloc.erreur ? "—" : t.bloc.total}</Text>
            <Text style={styles.tuileLabel}>{t.label}</Text>
          </View>
        ))}
      </View>

      <Section titre="Chantiers du jour" bloc={vm.chantiersDuJour} vide="Aucun chantier prévu aujourd’hui.">
        {(items) =>
          items.map((c) => {
            const s = CHANTIER_STATUT[c.statut];
            return (
              <Pressable key={c.id} accessibilityRole="button" onPress={() => ouvrirTaches(c.id)} style={({ pressed }) => [styles.ligne, pressed && styles.pressed]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.ligneTitre}>{c.reference}</Text>
                  {s ? <Badge {...s} /> : null}
                </View>
                <Text style={styles.muted}>
                  {fullName(c.client) || "Client"} · {c.adresse}
                </Text>
                <View style={styles.rowBetween}>
                  <Barre valeur={c.avancement} />
                  <Text style={styles.pourcent}>{c.avancement} %</Text>
                </View>
                <Text style={styles.lien}>Voir les {c.nombreTaches} tâche{c.nombreTaches > 1 ? "s" : ""} →</Text>
              </Pressable>
            );
          })
        }
      </Section>

      <Section titre="Tâches en retard" alerte bloc={vm.tachesEnRetard} vide="Aucune tâche en retard.">
        {(items) =>
          items.map((t) => (
            <Pressable key={t.id} accessibilityRole="button" onPress={() => ouvrirTaches(t.chantier.id)} style={({ pressed }) => [styles.ligne, pressed && styles.pressed]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.ligneTitre, styles.flex]}>{t.libelle}</Text>
                <Text style={styles.retard}>prévue le {formatDate(t.dateFin ?? t.dateDebut)}</Text>
              </View>
              <Text style={styles.muted}>
                {t.chantier.reference} · {t.avancement} %{t.intervenants.length ? ` · ${t.intervenants.map((i) => fullName(i)).join(", ")}` : ""}
              </Text>
            </Pressable>
          ))
        }
      </Section>

      <Section titre="Livraisons attendues" bloc={vm.livraisons} vide="Aucune livraison attendue.">
        {(items) =>
          items.map((c) => {
            const prevue = jourDe(c.dateLivraisonPrevue);
            const enRetard = prevue !== null && prevue < vm.jour;
            return (
              <Pressable
                key={c.id}
                accessibilityRole={c.chantier ? "button" : undefined}
                disabled={!c.chantier}
                onPress={() => c.chantier && ouvrirTaches(c.chantier.id)}
                style={({ pressed }) => [styles.ligne, pressed && styles.pressed]}
              >
                <View style={styles.rowBetween}>
                  <Text style={[styles.ligneTitre, styles.flex]}>{c.fournisseur.nom}</Text>
                  <Text style={[styles.muted, enRetard && styles.retard]}>{c.dateLivraisonPrevue ? `le ${formatDate(c.dateLivraisonPrevue)}` : "date à confirmer"}</Text>
                </View>
                <Text style={styles.muted}>
                  {c.reference} · {COMMANDE_STATUT[c.statutLivraison] ?? c.statutLivraison}
                  {c.chantier ? ` · ${c.chantier.reference}` : ""}
                </Text>
              </Pressable>
            );
          })
        }
      </Section>

      <Section titre="SAV ouverts" alerte bloc={vm.sav} vide="Aucun ticket SAV ouvert.">
        {(items) =>
          items.map((s) => {
            const p = SAV_PRIORITE[s.priorite];
            return (
              <Pressable
                key={s.id}
                accessibilityRole={s.chantierId ? "button" : undefined}
                disabled={!s.chantierId}
                onPress={() => s.chantierId && ouvrirTaches(s.chantierId)}
                style={({ pressed }) => [styles.ligne, pressed && styles.pressed]}
              >
                <View style={styles.rowBetween}>
                  <Text style={[styles.ligneTitre, styles.flex]}>{s.titre}</Text>
                  {p ? <Badge {...p} /> : null}
                </View>
                <Text style={styles.muted}>
                  {s.reference} · {s.client.nom} · {SAV_STATUT[s.statut] ?? s.statut}
                </Text>
              </Pressable>
            );
          })
        }
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background.DEFAULT },
  date: { fontSize: 15, fontWeight: "600", color: colors.text.muted, textTransform: "capitalize" },
  tuiles: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tuile: { flexGrow: 1, flexBasis: "45%", backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 2 },
  tuileValeur: { fontSize: 26, fontWeight: "800", color: colors.brand[900] },
  tuileAlerte: { color: colors.status.error },
  tuileLabel: { fontSize: 13, color: colors.text.muted },
  section: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  sectionEntete: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitre: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  compteur: { minWidth: 28, textAlign: "center", fontSize: 13, fontWeight: "700", color: colors.brand[700], backgroundColor: colors.brand[100], borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: "hidden" },
  compteurAlerte: { color: colors.white, backgroundColor: colors.status.error },
  ligne: { paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.DEFAULT, gap: 4 },
  pressed: { opacity: 0.7 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  flex: { flex: 1 },
  ligneTitre: { fontSize: 15, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  retard: { fontSize: 13, fontWeight: "600", color: colors.status.error },
  lien: { fontSize: 13, fontWeight: "700", color: colors.brand[700] },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  barre: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surface.muted, overflow: "hidden" },
  barreRemplie: { height: 6, borderRadius: 3, backgroundColor: colors.brand[500] },
  pourcent: { width: 44, textAlign: "right", fontSize: 13, fontWeight: "600", color: colors.text.DEFAULT },
  erreur: { fontSize: 13, color: colors.status.error },
  vide: { fontSize: 13, color: colors.text.muted },
  plus: { fontSize: 13, color: colors.text.muted, textAlign: "center" },
});
