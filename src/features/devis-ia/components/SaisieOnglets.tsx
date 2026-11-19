import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { DUREE_MAX_SECONDES, useEnregistreurVocal } from "@/shared/media/useEnregistreurVocal";
import { DESCRIPTION_MAX, DESCRIPTION_MIN, MAX_PHOTOS_IA, ONGLETS } from "../models/DevisIA";
import type { DevisIAViewModel } from "../viewmodels/useDevisIAViewModel";
import { PlanOnglet } from "./PlanOnglet";
import { ia } from "./iaStyles";

/** The 4 ways to describe the work: Texte / Photo / Vocal / Plan. */
export function SaisieOnglets({ vm }: { vm: DevisIAViewModel }) {
  return (
    <View style={ia.carte}>
      <View style={styles.barre} accessibilityRole="tablist">
        {ONGLETS.map((o) => {
          const actif = vm.onglet === o.value;
          return (
            <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: actif }} onPress={() => vm.setOnglet(o.value)} style={[styles.onglet, actif && styles.ongletActif]}>
              <Text style={[styles.ongletTexte, actif && styles.ongletTexteActif]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {vm.onglet === "texte" ? <TexteOnglet vm={vm} /> : null}
      {vm.onglet === "photo" ? <PhotoOnglet vm={vm} /> : null}
      {vm.onglet === "vocal" ? <VocalOnglet vm={vm} /> : null}
      {vm.onglet === "plan" ? <PlanOnglet onEnvoyer={vm.proposerDepuisPlan} onCopier={vm.copierDansTexte} /> : null}
    </View>
  );
}

function TexteOnglet({ vm }: { vm: DevisIAViewModel }) {
  const n = vm.texte.trim().length;
  return (
    <>
      <Text style={ia.muted}>Décrivez les travaux : pièces, surfaces, matériaux, ce qui est à déposer…</Text>
      <TextInput
        value={vm.texte}
        onChangeText={vm.setTexte}
        multiline
        maxLength={DESCRIPTION_MAX}
        placeholder="Ex. Salle de bain 8 m² : dépose de la baignoire, douche à l’italienne, faïence murale et carrelage sol."
        placeholderTextColor={colors.text.muted}
        style={[ia.input, ia.zoneTexte]}
        accessibilityLabel="Description des travaux"
      />
      <Text style={[ia.aide, n > 0 && n < DESCRIPTION_MIN && { color: colors.status.error }]}>
        {n}/{DESCRIPTION_MAX} — {DESCRIPTION_MIN} caractères au minimum
      </Text>
      <Pressable accessibilityRole="button" disabled={!vm.texteValide} onPress={vm.proposerDepuisTexte} style={[ia.bouton, ia.primaire, !vm.texteValide && ia.dim]}>
        <Text style={ia.primaireTexte}>Proposer les lignes</Text>
      </Pressable>
    </>
  );
}

function PhotoOnglet({ vm }: { vm: DevisIAViewModel }) {
  const plein = vm.photos.length >= MAX_PHOTOS_IA;
  return (
    <>
      <Text style={ia.muted}>
        {MAX_PHOTOS_IA} photos au maximum. Le texte de l’onglet « Texte » est envoyé avec les photos (facultatif). Les photos ne sont pas gardées.
      </Text>
      <View style={styles.photos}>
        {vm.photos.map((p, i) => (
          <View key={`${p.uri}-${i}`}>
            <Image source={{ uri: p.uri }} style={styles.photo} accessibilityLabel={`Photo ${i + 1}`} />
            <Pressable accessibilityRole="button" accessibilityLabel={`Retirer la photo ${i + 1}`} onPress={() => vm.retirerPhoto(i)} style={styles.retirer}>
              <Text style={styles.retirerTexte}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={ia.rangee}>
        <Pressable accessibilityRole="button" disabled={plein} onPress={() => void vm.ajouterPhotos("camera")} style={[ia.bouton, ia.outline, ia.flex1, plein && ia.dim]}>
          <Text style={ia.outlineTexte}>Prendre une photo</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={plein} onPress={() => void vm.ajouterPhotos("galerie")} style={[ia.bouton, ia.outline, ia.flex1, plein && ia.dim]}>
          <Text style={ia.outlineTexte}>Galerie</Text>
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" disabled={!vm.photos.length} onPress={vm.proposerDepuisPhotos} style={[ia.bouton, ia.primaire, !vm.photos.length && ia.dim]}>
        <Text style={ia.primaireTexte}>Analyser {vm.photos.length > 1 ? `les ${vm.photos.length} photos` : "la photo"}</Text>
      </Pressable>
    </>
  );
}

function VocalOnglet({ vm }: { vm: DevisIAViewModel }) {
  const rec = useEnregistreurVocal();

  const basculer = async () => {
    if (!rec.enCours) {
      await rec.demarrer();
      return;
    }
    const fichier = await rec.arreter();
    if (fichier) await vm.transcrireNote(fichier);
  };

  // Stops by itself at the limit
  useEffect(() => {
    if (rec.enCours && rec.secondes >= DUREE_MAX_SECONDES) void basculer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.secondes]);

  return (
    <>
      <Text style={ia.muted}>Parlez comme au client : le texte apparaît ensuite dans l’onglet « Texte » pour le corriger.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={rec.enCours ? "Arrêter l’enregistrement" : "Commencer l’enregistrement"}
        disabled={vm.transcription}
        onPress={() => void basculer()}
        style={[styles.micro, rec.enCours && styles.microActif, vm.transcription && ia.dim]}
      >
        <Text style={styles.microIcone}>{rec.enCours ? "■" : "●"}</Text>
      </Pressable>
      <Text style={styles.centre}>
        {vm.transcription ? "Transcription…" : rec.enCours ? `Enregistrement ${Math.floor(rec.secondes / 60)}:${String(rec.secondes % 60).padStart(2, "0")} — touchez pour arrêter` : "Touchez pour parler"}
      </Text>
      {rec.erreur ? <Text style={ia.danger}>{rec.erreur}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  barre: { flexDirection: "row", backgroundColor: colors.surface.muted, borderRadius: 10, padding: 3 },
  onglet: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, alignItems: "center" },
  ongletActif: { backgroundColor: colors.surface.DEFAULT },
  ongletTexte: { color: colors.text.muted, fontWeight: "600" },
  ongletTexteActif: { color: colors.brand[700] },
  photos: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  photo: { width: 96, height: 96, borderRadius: 8 },
  retirer: { position: "absolute", top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.status.error, alignItems: "center", justifyContent: "center" },
  retirerTexte: { color: colors.white, fontWeight: "700" },
  micro: { alignSelf: "center", width: 84, height: 84, borderRadius: 42, backgroundColor: colors.brand[700], alignItems: "center", justifyContent: "center", marginVertical: spacing.md },
  microActif: { backgroundColor: colors.status.error },
  microIcone: { color: colors.white, fontSize: 28 },
  centre: { textAlign: "center", color: colors.text.muted },
});
