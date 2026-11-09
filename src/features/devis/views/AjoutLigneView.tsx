import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { UNITES } from "@/features/catalogue/models/Prestation";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Input } from "@/shared/components/Input";
import { formatEuros, formatUnite, lireNombre } from "@/shared/utils/format";
import { type ModeAjout, useAjoutLigneViewModel } from "../viewmodels/useAjoutLigneViewModel";

const MODES: { value: ModeAjout; label: string }[] = [
  { value: "catalogue", label: "Depuis le catalogue" },
  { value: "libre", label: "Ligne libre" },
];

function Choix({ label, actif, onPress }: { label: string; actif: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: actif }} onPress={onPress} style={[styles.choix, actif && styles.choixActif]}>
      <Text style={[styles.choixTexte, actif && styles.choixTexteActif]}>{label}</Text>
    </Pressable>
  );
}

/** Add a line to the draft: catalogue prestation (options + suggested price) or free line. */
export function AjoutLigneView({ devisId }: { devisId: number }) {
  const vm = useAjoutLigneViewModel(devisId);
  const c = vm.catalogue;
  const l = vm.libre;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.modes}>
        {MODES.map((m) => (
          <Choix key={m.value} label={m.label} actif={vm.mode === m.value} onPress={() => vm.setMode(m.value)} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {vm.mode === "catalogue" && !c.prestation ? (
          <>
            <Input value={c.search} onChangeText={c.setSearch} placeholder="Rechercher une prestation…" accessibilityLabel="Rechercher une prestation" />
            {c.error ? <ErrorMessage message={c.error} /> : null}
            {c.recherche || c.chargementPrestation ? <ActivityIndicator color={colors.brand[700]} style={styles.loader} /> : null}
            {!c.recherche && !c.resultats.length ? <Text style={styles.muted}>Aucune prestation trouvée.</Text> : null}
            {c.resultats.map((p) => (
              <Pressable key={p.id} accessibilityRole="button" disabled={c.chargementPrestation} onPress={() => c.choisirPrestation(p)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <Text style={styles.nom}>{p.nom}</Text>
                <Text style={styles.muted}>
                  {p.categorie.nom}
                  {p.sousCategorie ? ` › ${p.sousCategorie.nom}` : ""}
                </Text>
                <Text style={styles.prix}>
                  {formatEuros(p.prixVenteMin)} – {formatEuros(p.prixVenteMax)} / {formatUnite(p.unite)}
                </Text>
              </Pressable>
            ))}
          </>
        ) : null}

        {vm.mode === "catalogue" && c.prestation ? (
          <>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={[styles.nom, styles.flex]}>{c.prestation.nom}</Text>
                <Pressable accessibilityRole="button" onPress={c.changerPrestation}>
                  <Text style={styles.link}>Changer</Text>
                </Pressable>
              </View>
              <Text style={styles.muted}>
                {formatEuros(c.prestation.prixVenteMin)} – {formatEuros(c.prestation.prixVenteMax)} HT / {formatUnite(c.prestation.unite)}
              </Text>
            </View>

            <Text style={styles.label}>Quantité ({formatUnite(c.prestation.unite)})</Text>
            <TextInput value={c.quantite} onChangeText={c.setQuantite} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Quantité" />

            {c.prestation.options.map((o) => (
              <View key={o.id} style={styles.option}>
                <Text style={styles.label}>
                  {o.nom}
                  {o.obligatoire ? " *" : ""}
                </Text>
                <View style={styles.choixListe}>
                  {!o.obligatoire ? <Choix label="Aucun" actif={!c.choix[o.id]} onPress={() => c.choisirOption(o.id, null)} /> : null}
                  {o.choix.map((ch) => (
                    <Choix
                      key={ch.id}
                      label={ch.impactPrix ? `${ch.nom} (${ch.impactPrix > 0 ? "+" : ""}${formatEuros(ch.impactPrix)})` : ch.nom}
                      actif={c.choix[o.id] === ch.id}
                      onPress={() => c.choisirOption(o.id, ch.id)}
                    />
                  ))}
                </View>
              </View>
            ))}

            <View style={[styles.card, styles.suggestion]}>
              {c.optionsManquantes.length ? (
                <Text style={styles.muted}>Choisissez : {c.optionsManquantes.join(", ")}.</Text>
              ) : c.calcul ? (
                <ActivityIndicator color={colors.brand[700]} />
              ) : c.suggestion ? (
                <>
                  <Text style={styles.muted}>Prix suggéré</Text>
                  <Text style={styles.prixGros}>
                    {formatEuros(c.suggestion.prixVenteSuggereUnite)} HT / {formatUnite(c.prestation.unite)}
                  </Text>
                  <Text style={styles.muted}>Total : {formatEuros(c.suggestion.totalVenteHT)} HT</Text>
                  {c.suggestion.avertissements.map((a) => (
                    <Text key={a} style={styles.avertissement}>
                      {a}
                    </Text>
                  ))}
                </>
              ) : (
                <Text style={styles.muted}>Indiquez une quantité.</Text>
              )}
            </View>

            <Text style={styles.label}>Prix unitaire HT (facultatif)</Text>
            <TextInput
              value={c.prix}
              onChangeText={c.setPrix}
              keyboardType="decimal-pad"
              placeholder={c.suggestion ? `Prix suggéré : ${formatEuros(c.suggestion.prixVenteSuggereUnite)}` : "Prix suggéré"}
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              accessibilityLabel="Prix unitaire HT"
            />
          </>
        ) : null}

        {vm.mode === "libre" ? (
          <>
            <Text style={styles.label}>Description *</Text>
            <TextInput value={l.description} onChangeText={l.setDescription} multiline placeholder="Ex. : Déplacement, évacuation des gravats…" placeholderTextColor={colors.text.muted} style={[styles.input, styles.multiline]} accessibilityLabel="Description" />
            <Text style={styles.label}>Quantité *</Text>
            <TextInput value={l.quantite} onChangeText={l.setQuantite} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Quantité" />
            <Text style={styles.label}>Unité</Text>
            <View style={styles.choixListe}>
              {UNITES.map((u) => (
                <Choix key={u} label={formatUnite(u)} actif={l.unite === u} onPress={() => l.setUnite(u)} />
              ))}
            </View>
            <Text style={styles.label}>Prix unitaire HT (€) *</Text>
            <TextInput value={l.prix} onChangeText={l.setPrix} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Prix unitaire HT" />
            {lireNombre(l.quantite) > 0 && lireNombre(l.prix) >= 0 ? (
              <Text style={styles.prixGros}>Total : {formatEuros(Math.round(lireNombre(l.quantite) * lireNombre(l.prix) * 100) / 100)} HT</Text>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          disabled={!vm.peutValider || vm.enregistrement}
          onPress={() => void vm.valider()}
          style={[styles.valider, (!vm.peutValider || vm.enregistrement) && styles.dim]}
        >
          {vm.enregistrement ? <ActivityIndicator color={colors.white} /> : <Text style={styles.validerTexte}>Ajouter au devis</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  modes: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  loader: { marginVertical: spacing.md },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 12, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 2 },
  pressed: { opacity: 0.8 },
  rowBetween: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flex: { flex: 1 },
  nom: { fontSize: 15, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  prix: { fontSize: 13, color: colors.text.DEFAULT, marginTop: 2 },
  prixGros: { fontSize: 18, fontWeight: "800", color: colors.text.DEFAULT },
  avertissement: { fontSize: 12, color: colors.status.warning },
  link: { color: colors.brand[700], fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", color: colors.text.DEFAULT, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface.DEFAULT, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 10, padding: spacing.md, fontSize: 16, color: colors.text.DEFAULT },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  option: { gap: 6 },
  choixListe: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choix: { borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT, paddingHorizontal: spacing.md, paddingVertical: 8 },
  choixActif: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  choixTexte: { fontSize: 13, color: colors.text.DEFAULT, fontWeight: "600" },
  choixTexteActif: { color: colors.white },
  suggestion: { alignItems: "flex-start", gap: 4, marginTop: spacing.sm },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  valider: { minHeight: 50, borderRadius: 12, backgroundColor: colors.brand[700], alignItems: "center", justifyContent: "center" },
  validerTexte: { color: colors.white, fontWeight: "800", fontSize: 16 },
  dim: { opacity: 0.5 },
});
