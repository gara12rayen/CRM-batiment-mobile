import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { fullName } from "@/shared/utils/format";
import { TACHE_STATUT, TACHE_STATUTS } from "../models/Tache";
import { AVANCEMENTS, useTacheFormViewModel } from "../viewmodels/useTacheFormViewModel";

function Choix({ label, actif, disabled, onPress }: { label: string; actif: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: actif, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.choix, actif && styles.choixActif, disabled && !actif && styles.dim]}
    >
      <Text style={[styles.choixTexte, actif && styles.choixTexteActif]}>{label}</Text>
    </Pressable>
  );
}

const ROLE_COURT: Record<string, string> = { SOUS_TRAITANT: "sous-traitant", CHEF_CHANTIER: "chef", ADMIN: "bureau", ASSISTANTE: "bureau", TECHNICO: "bureau" };

/** Nouvelle tâche, ou fiche d'une tâche existante (lecture seule pour le TECHNICO). */
export function TacheFormView({ chantierId, tacheId }: { chantierId: number; tacheId?: number }) {
  const vm = useTacheFormViewModel(chantierId, tacheId);
  const f = vm.champs;
  const lectureSeule = !vm.peutModifier;

  if (vm.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  if (!vm.creation && !vm.tache) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={vm.error ?? "Tâche introuvable."} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {vm.chantierFerme ? <Text style={styles.info}>Ce chantier est clôturé ou annulé : ses tâches ne peuvent plus être modifiées.</Text> : null}
        {lectureSeule && !vm.chantierFerme ? <Text style={styles.info}>Consultation seulement.</Text> : null}

        <Text style={styles.label}>Libellé *</Text>
        <TextInput value={f.libelle} onChangeText={f.setLibelle} editable={!lectureSeule} maxLength={200} placeholder="Ex. : Pose du carrelage" placeholderTextColor={colors.text.muted} style={styles.input} accessibilityLabel="Libellé" />

        <Text style={styles.label}>Description</Text>
        <TextInput value={f.description} onChangeText={f.setDescription} editable={!lectureSeule} maxLength={2000} multiline placeholder="Détails, consignes…" placeholderTextColor={colors.text.muted} style={[styles.input, styles.multiline]} accessibilityLabel="Description" />

        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.label}>Début</Text>
            <TextInput value={f.debut} onChangeText={f.setDebut} editable={!lectureSeule} placeholder="JJ/MM/AAAA" placeholderTextColor={colors.text.muted} keyboardType="numbers-and-punctuation" maxLength={10} style={styles.input} accessibilityLabel="Date de début" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.label}>Fin</Text>
            <TextInput value={f.fin} onChangeText={f.setFin} editable={!lectureSeule} placeholder="JJ/MM/AAAA" placeholderTextColor={colors.text.muted} keyboardType="numbers-and-punctuation" maxLength={10} style={styles.input} accessibilityLabel="Date de fin" />
          </View>
        </View>
        {vm.erreurDates ? <Text style={styles.erreurChamp}>{vm.erreurDates}</Text> : null}

        <Text style={styles.label}>Affectée à</Text>
        {vm.intervenants.length ? (
          <View style={styles.choixListe}>
            {vm.intervenants.map((i) => (
              <Choix key={i.id} label={`${fullName(i)}${ROLE_COURT[i.role] ? ` (${ROLE_COURT[i.role]})` : ""}`} actif={vm.assignes.includes(i.id)} disabled={lectureSeule} onPress={() => vm.basculerIntervenant(i.id)} />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>Aucun intervenant disponible.</Text>
        )}

        {!vm.creation && vm.tache ? (
          <>
            <Text style={styles.label}>Statut</Text>
            <View style={styles.choixListe}>
              {TACHE_STATUTS.map((s) => (
                <Choix key={s} label={TACHE_STATUT[s].label} actif={vm.statut === s} disabled={lectureSeule} onPress={() => vm.choisirStatut(s)} />
              ))}
            </View>

            <Text style={styles.label}>Avancement : {vm.avancement} %</Text>
            {vm.avancementAuto ? (
              <Text style={styles.muted}>Calculé à partir de la checklist.</Text>
            ) : (
              <View style={styles.choixListe}>
                {AVANCEMENTS.map((a) => (
                  <Choix key={a} label={`${a} %`} actif={vm.avancement === a} disabled={lectureSeule} onPress={() => vm.choisirAvancement(a)} />
                ))}
              </View>
            )}

            <Text style={styles.label}>Checklist</Text>
            <View style={styles.card}>
              {vm.checklist.items.length ? null : <Text style={styles.muted}>Aucun point à cocher.</Text>}
              {vm.checklist.items.map((item) => (
                <View key={item.id} style={styles.point}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.fait, disabled: lectureSeule || vm.checklist.enCours }}
                    disabled={lectureSeule || vm.checklist.enCours}
                    onPress={() => vm.checklist.cocher(item.id, !item.fait)}
                    style={styles.pointCase}
                  >
                    <View style={[styles.case, item.fait && styles.caseFaite]}>{item.fait ? <Text style={styles.coche}>✓</Text> : null}</View>
                    <Text style={[styles.pointTexte, item.fait && styles.pointFait]}>{item.libelle}</Text>
                  </Pressable>
                  {!lectureSeule ? (
                    <Pressable accessibilityRole="button" accessibilityLabel={`Supprimer ${item.libelle}`} disabled={vm.checklist.enCours} onPress={() => vm.checklist.supprimer(item.id)} hitSlop={8}>
                      <Text style={styles.supprimerPoint}>✕</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
              {!lectureSeule ? (
                <View style={styles.row}>
                  <TextInput
                    value={vm.checklist.nouveauPoint}
                    onChangeText={vm.checklist.setNouveauPoint}
                    onSubmitEditing={vm.checklist.ajouter}
                    maxLength={200}
                    placeholder="Ajouter un point…"
                    placeholderTextColor={colors.text.muted}
                    style={[styles.input, styles.flex]}
                    accessibilityLabel="Nouveau point de checklist"
                  />
                  <Pressable accessibilityRole="button" disabled={!vm.checklist.nouveauPoint.trim() || vm.checklist.enCours} onPress={vm.checklist.ajouter} style={[styles.ajouter, (!vm.checklist.nouveauPoint.trim() || vm.checklist.enCours) && styles.dim]}>
                    {vm.checklist.enCours ? <ActivityIndicator color={colors.white} /> : <Text style={styles.ajouterTexte}>Ajouter</Text>}
                  </Pressable>
                </View>
              ) : null}
            </View>

            <Text style={styles.label}>Note</Text>
            <TextInput value={f.commentaire} onChangeText={f.setCommentaire} editable={!lectureSeule} multiline placeholder="Remarque sur la tâche" placeholderTextColor={colors.text.muted} style={[styles.input, styles.multiline]} accessibilityLabel="Note" />
          </>
        ) : null}

        {vm.error ? <ErrorMessage message={vm.error} /> : null}

        {!vm.creation && vm.peutModifier ? (
          vm.confirmerSuppression ? (
            <View style={styles.confirmation}>
              <Text style={styles.confirmationTexte}>Supprimer définitivement cette tâche et ses photos ?</Text>
              <View style={styles.row}>
                <Pressable accessibilityRole="button" onPress={vm.annulerSuppression} style={[styles.bouton, styles.boutonOutline, styles.flex]}>
                  <Text style={styles.boutonOutlineTexte}>Annuler</Text>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={vm.enregistrement} onPress={() => void vm.supprimer()} style={[styles.bouton, styles.boutonDanger, styles.flex]}>
                  <Text style={styles.boutonTexte}>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => void vm.supprimer()} style={styles.lienDanger}>
              <Text style={styles.lienDangerTexte}>Supprimer la tâche</Text>
            </Pressable>
          )
        ) : null}
      </ScrollView>

      {vm.peutModifier ? (
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" disabled={!vm.peutEnregistrer} onPress={() => void vm.enregistrer()} style={[styles.bouton, styles.boutonPrimaire, !vm.peutEnregistrer && styles.dim]}>
            {vm.enregistrement ? <ActivityIndicator color={colors.white} /> : <Text style={styles.boutonTexte}>{vm.creation ? "Créer la tâche" : "Enregistrer"}</Text>}
          </Pressable>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background.DEFAULT },
  info: { fontSize: 13, color: colors.status.warning, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "700", color: colors.text.DEFAULT, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface.DEFAULT, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 10, padding: spacing.md, fontSize: 15, color: colors.text.DEFAULT },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flex: { flex: 1 },
  erreurChamp: { fontSize: 13, color: colors.status.error },
  muted: { fontSize: 13, color: colors.text.muted },
  choixListe: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choix: { borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT, paddingHorizontal: spacing.md, paddingVertical: 8 },
  choixActif: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  choixTexte: { fontSize: 13, fontWeight: "600", color: colors.text.DEFAULT },
  choixTexteActif: { color: colors.white },
  dim: { opacity: 0.45 },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 12, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: spacing.sm },
  point: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pointCase: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 36 },
  case: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.brand[500], alignItems: "center", justifyContent: "center" },
  caseFaite: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  coche: { color: colors.white, fontSize: 13, fontWeight: "800" },
  pointTexte: { flex: 1, fontSize: 14, color: colors.text.DEFAULT },
  pointFait: { color: colors.text.muted, textDecorationLine: "line-through" },
  supprimerPoint: { fontSize: 16, color: colors.text.muted, paddingHorizontal: 4 },
  ajouter: { minHeight: 44, borderRadius: 10, backgroundColor: colors.brand[700], paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center" },
  ajouterTexte: { color: colors.white, fontWeight: "700" },
  confirmation: { backgroundColor: "#FEE2E2", borderRadius: 12, padding: spacing.md, gap: spacing.sm, marginTop: spacing.md },
  confirmationTexte: { color: colors.status.error, fontWeight: "600" },
  lienDanger: { alignSelf: "center", padding: spacing.md, marginTop: spacing.md },
  lienDangerTexte: { color: colors.status.error, fontWeight: "700" },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  bouton: { minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  boutonPrimaire: { backgroundColor: colors.brand[700] },
  boutonDanger: { backgroundColor: colors.status.error },
  boutonOutline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  boutonTexte: { color: colors.white, fontWeight: "800", fontSize: 16 },
  boutonOutlineTexte: { color: colors.text.DEFAULT, fontWeight: "700" },
});
