import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { choisirPhotos, prendrePhoto } from "@/shared/media/media.service";
import { formatUnite } from "@/shared/utils/format";
import { COMMANDE_STATUTS, type EcartType } from "../models/Livraison";
import { useReceptionViewModel } from "../viewmodels/useReceptionViewModel";

const ECART_LABEL: Record<EcartType, string> = { MANQUANT: "Manquant", EN_TROP: "En trop", INCONNU: "Non commandé", ABIME: "Abîmé" };
const fr = (n: number) => String(n).replace(".", ",");

/** Check a delivery against the order, with the AI reading of the delivery note. */
export function ReceptionView({ commandeId }: { commandeId: number }) {
  const vm = useReceptionViewModel(commandeId);
  const router = useRouter();
  const c = vm.commande;

  const photographier = async (source: "camera" | "galerie") => {
    try {
      const p = source === "camera" ? await prendrePhoto() : (await choisirPhotos(1))[0] ?? null;
      if (p) await vm.lire(p);
    } catch (e) {
      Alert.alert("Photo", getErrorMessage(e));
    }
  };

  if (vm.loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  if (!c) {
    return (
      <View style={styles.centre}>
        <ErrorMessage message={vm.erreur ?? "Commande introuvable."} />
      </View>
    );
  }
  if (vm.fini) {
    return (
      <View style={styles.centre}>
        <Text style={styles.succesIcone}>✓</Text>
        <Text style={styles.succes}>{vm.fini}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={[styles.bouton, styles.primaire, styles.large]}>
          <Text style={styles.primaireTexte}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const s = COMMANDE_STATUTS[c.statutLivraison];

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <View style={styles.carte}>
          <View style={styles.entre}>
            <Text style={styles.reference}>{c.reference}</Text>
            {s ? <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text> : null}
          </View>
          <Text style={styles.muted}>
            {c.fournisseur.nom}
            {c.chantier ? ` · ${c.chantier.reference}` : ""}
          </Text>
        </View>

        {!vm.receptionnable ? <ErrorMessage message="Cette commande n’attend plus de livraison." /> : null}

        {/* 1. Photo of the delivery note */}
        <View style={styles.carte}>
          <Text style={styles.titre}>1. Photo du bon de livraison</Text>
          {vm.photo ? <Image source={{ uri: vm.photo.uri }} style={styles.photo} resizeMode="cover" accessibilityLabel="Bon de livraison" /> : null}
          {vm.lectureEnCours ? (
            <View style={styles.lecture}>
              <ActivityIndicator color={colors.brand[700]} />
              <Text style={styles.muted}>Lecture du bon par l’IA…</Text>
            </View>
          ) : (
            <View style={styles.rangee}>
              <Pressable accessibilityRole="button" onPress={() => void photographier("camera")} style={[styles.bouton, styles.outline, styles.flex]}>
                <Text style={styles.outlineTexte}>📷 {vm.photo ? "Reprendre" : "Photographier"}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => void photographier("galerie")} style={[styles.bouton, styles.outline, styles.flex]}>
                <Text style={styles.outlineTexte}>🖼 Galerie</Text>
              </Pressable>
            </View>
          )}
          {vm.lecture?.numeroBL ? <Text style={styles.muted}>Bon n° {vm.lecture.numeroBL}</Text> : null}
          {vm.info ? (
            <View style={styles.alerte}>
              <Text style={styles.alerteTexte}>{vm.info}</Text>
            </View>
          ) : null}
          <Text style={styles.aide}>Sans photo, saisissez directement les quantités ci-dessous.</Text>
        </View>

        {/* 2. Counted quantities */}
        <View style={styles.carte}>
          <View style={styles.entre}>
            <Text style={styles.titre}>2. Quantités reçues</Text>
            <Pressable accessibilityRole="button" onPress={vm.toutRecu} hitSlop={8}>
              <Text style={styles.lien}>Tout reçu</Text>
            </Pressable>
          </View>
          {!vm.lignes.length ? <Text style={styles.muted}>Tout a déjà été reçu.</Text> : null}
          {vm.lignes.map((l) => (
            <View key={l.ligneId} style={[styles.ligne, l.douteux && styles.douteux]}>
              <Text style={styles.nom}>{l.nom}</Text>
              <Text style={styles.muted}>
                Reste à recevoir : {fr(l.restant)} {formatUnite(l.unite)}
                {l.surBon !== null ? ` · sur le bon : ${fr(l.surBon)}` : ""}
                {l.douteux ? " · lecture à vérifier" : ""}
              </Text>
              <View style={styles.rangee}>
                <View style={styles.flex}>
                  <Text style={styles.label}>Reçu</Text>
                  <TextInput value={l.recuTexte} onChangeText={(v) => vm.modifierLigne(l.ligneId, "recuTexte", v)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.text.muted} style={styles.input} accessibilityLabel={`Reçu ${l.nom}`} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.label}>Dont abîmé</Text>
                  <TextInput value={l.abimeTexte} onChangeText={(v) => vm.modifierLigne(l.ligneId, "abimeTexte", v)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.text.muted} style={styles.input} accessibilityLabel={`Abîmé ${l.nom}`} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 3. Articles not ordered */}
        <View style={styles.carte}>
          <View style={styles.entre}>
            <Text style={styles.titre}>3. Articles non commandés</Text>
            <Pressable accessibilityRole="button" onPress={vm.ajouterInconnu} hitSlop={8}>
              <Text style={styles.lien}>+ Ajouter</Text>
            </Pressable>
          </View>
          {!vm.inconnus.length ? <Text style={styles.muted}>Aucun.</Text> : null}
          {vm.inconnus.map((a) => (
            <View key={a.cle} style={styles.rangee}>
              <TextInput value={a.libelle} onChangeText={(v) => vm.modifierInconnu(a.cle, "libelle", v)} placeholder="Article" placeholderTextColor={colors.text.muted} style={[styles.input, styles.flex2]} accessibilityLabel="Article non commandé" />
              <TextInput value={a.quantiteTexte} onChangeText={(v) => vm.modifierInconnu(a.cle, "quantiteTexte", v)} keyboardType="decimal-pad" placeholder="Qté" placeholderTextColor={colors.text.muted} style={[styles.input, styles.flex]} accessibilityLabel="Quantité" />
              <Pressable accessibilityRole="button" accessibilityLabel="Retirer l’article" onPress={() => vm.retirerInconnu(a.cle)} style={styles.retirer}>
                <Text style={styles.retirerTexte}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Summary of the gaps */}
        {vm.calcul.ecarts.length ? (
          <View style={[styles.carte, styles.douteux]}>
            <Text style={styles.titre}>Écarts signalés au bureau</Text>
            {vm.calcul.ecarts.map((e, i) => (
              <Text key={i} style={styles.texte}>
                - {ECART_LABEL[e.type]} : {e.libelle}
                {e.quantite ? ` (${fr(e.quantite)})` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        <TextInput value={vm.notes} onChangeText={vm.setNotes} placeholder="Remarque (facultatif)" placeholderTextColor={colors.text.muted} multiline maxLength={2000} style={[styles.input, styles.notes]} accessibilityLabel="Remarque" />

        {vm.calcul.invalide ? <ErrorMessage message="Corrigez les quantités : nombres positifs, « abîmé » pas plus grand que « reçu »." /> : null}
        {vm.erreur ? <ErrorMessage message={vm.erreur} /> : null}
        <Pressable accessibilityRole="button" disabled={!vm.pret} onPress={() => void vm.valider()} style={[styles.bouton, styles.primaire, !vm.pret && styles.dim]}>
          <Text style={styles.primaireTexte}>{vm.envoi ? "Enregistrement…" : "Valider la réception"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background.DEFAULT },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  rangee: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-end" },
  flex: { flex: 1 },
  flex2: { flex: 2 },
  reference: { fontSize: 18, fontWeight: "700", color: colors.text.DEFAULT },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  titre: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  nom: { fontWeight: "600", color: colors.text.DEFAULT },
  texte: { color: colors.text.DEFAULT },
  muted: { color: colors.text.muted, fontSize: 12 },
  aide: { color: colors.text.muted, fontSize: 12 },
  label: { color: colors.text.muted, fontSize: 12 },
  lien: { color: colors.brand[700], fontWeight: "700" },
  photo: { width: "100%", height: 180, borderRadius: 10, backgroundColor: colors.surface.muted },
  lecture: { flexDirection: "row", gap: spacing.sm, alignItems: "center", paddingVertical: spacing.md },
  ligne: { gap: 6, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border.DEFAULT },
  douteux: { backgroundColor: "#FFFBEB", borderColor: colors.status.warning },
  input: { backgroundColor: colors.background.DEFAULT, borderColor: colors.border.DEFAULT, borderWidth: 1, borderRadius: 10, padding: spacing.md, color: colors.text.DEFAULT },
  notes: { minHeight: 70, textAlignVertical: "top" },
  retirer: { width: 40, height: 44, alignItems: "center", justifyContent: "center" },
  retirerTexte: { color: colors.status.error, fontSize: 22, fontWeight: "700" },
  alerte: { backgroundColor: "#FEF3C7", borderRadius: 10, padding: spacing.md },
  alerteTexte: { color: "#92400E" },
  bouton: { borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center", padding: spacing.sm },
  large: { alignSelf: "stretch" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700", fontSize: 15 },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.brand[700], fontWeight: "600" },
  dim: { opacity: 0.5 },
  succesIcone: { fontSize: 44, color: colors.status.success, fontWeight: "700" },
  succes: { textAlign: "center", color: colors.text.DEFAULT, fontSize: 16 },
});
