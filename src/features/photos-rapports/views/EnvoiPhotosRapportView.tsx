import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { envoyerOuMettreEnAttente } from "@/core/offline/fileEnvoi";
import type { Tache } from "@/features/chantiers/models/Tache";
import { listTaches } from "@/features/chantiers/services/taches.service";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { ChoixPhotos } from "@/shared/media/ChoixPhotos";
import type { FichierLocal } from "@/shared/media/media.service";
import { MAX_PHOTOS_ENVOI, MOMENTS, type PhotoMoment } from "../models/PhotosRapports";
import "../services/photosRapports.service";

/**
 * « photos »: before / after photos of ONE task (the API needs the task and the moment).
 * « rapport »: free text of the day, task optional, up to 10 photos.
 * Without network: kept on the phone and sent later.
 */
export function EnvoiPhotosRapportView({ chantierId, mode }: { chantierId: number; mode: "photos" | "rapport" }) {
  const router = useRouter();
  const [taches, setTaches] = useState<Tache[]>([]);
  const [tacheId, setTacheId] = useState<number | null>(null);
  const [moment, setMoment] = useState<PhotoMoment>("AVANT");
  const [texte, setTexte] = useState("");
  const [photos, setPhotos] = useState<FichierLocal[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    listTaches(chantierId)
      .then((t) => {
        setTaches(t);
        if (mode === "photos" && t.length === 1) setTacheId(t[0].id);
      })
      .catch((e) => setErreur(getErrorMessage(e, "Impossible de charger les tâches.")));
  }, [chantierId, mode]);

  const pret = mode === "photos" ? tacheId !== null && photos.length > 0 : texte.trim().length >= 3;

  async function envoyer() {
    if (!pret) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const resultat =
        mode === "photos"
          ? await envoyerOuMettreEnAttente("PHOTOS_CHANTIER", `${photos.length} photo(s) — chantier #${chantierId}`, { chantierId, tacheId: tacheId!, moment, commentaire: texte.trim() || undefined }, photos)
          : await envoyerOuMettreEnAttente("RAPPORT_CHANTIER", `Rapport — chantier #${chantierId}`, { chantierId, tacheId: tacheId ?? undefined, contenu: texte.trim() }, photos);
      Alert.alert(resultat === "envoye" ? "Envoyé" : "Gardé sur le téléphone", resultat === "envoye" ? (mode === "photos" ? "Les photos sont enregistrées." : "Le rapport est enregistré.") : "Pas de réseau : l’envoi partira tout seul dès le retour du réseau.");
      router.back();
    } catch (e) {
      setErreur(getErrorMessage(e, "L’envoi a été refusé."));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <View style={styles.carte}>
          <Text style={styles.titre}>{mode === "photos" ? "Tâche concernée" : "Tâche (facultatif)"}</Text>
          {!taches.length ? <Text style={styles.muted}>Aucune tâche sur ce chantier.</Text> : null}
          <View style={styles.puces}>
            {taches.map((t) => {
              const actif = tacheId === t.id;
              return (
                <Pressable key={t.id} accessibilityRole="button" accessibilityState={{ selected: actif }} onPress={() => setTacheId(actif && mode === "rapport" ? null : t.id)} style={[styles.puce, actif && styles.puceActive]}>
                  <Text style={[styles.puceTexte, actif && styles.puceTexteActif]}>{t.libelle}</Text>
                </Pressable>
              );
            })}
          </View>
          {mode === "photos" ? (
            <View style={styles.puces}>
              {MOMENTS.map((m) => (
                <Pressable key={m.value} accessibilityRole="button" accessibilityState={{ selected: moment === m.value }} onPress={() => setMoment(m.value)} style={[styles.puce, styles.moment, moment === m.value && styles.puceActive]}>
                  <Text style={[styles.puceTexte, moment === m.value && styles.puceTexteActif]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.carte}>
          <Text style={styles.titre}>{mode === "photos" ? "Commentaire (facultatif)" : "Rapport du jour"}</Text>
          <TextInput
            value={texte}
            onChangeText={setTexte}
            multiline
            maxLength={mode === "photos" ? 1000 : 5000}
            placeholder={mode === "photos" ? "Ex. Mur côté fenêtre" : "Ex. Livraison du carrelage reçue, pose demain matin."}
            placeholderTextColor={colors.text.muted}
            style={[styles.input, mode === "rapport" && styles.zone]}
            accessibilityLabel={mode === "photos" ? "Commentaire" : "Rapport"}
          />
        </View>

        <View style={styles.carte}>
          <Text style={styles.titre}>Photos{mode === "rapport" ? " (facultatif)" : ""}</Text>
          <ChoixPhotos photos={photos} onChange={setPhotos} max={MAX_PHOTOS_ENVOI} />
        </View>

        {erreur ? <ErrorMessage message={erreur} /> : null}
        <Pressable accessibilityRole="button" disabled={!pret || envoi} onPress={() => void envoyer()} style={[styles.bouton, (!pret || envoi) && styles.dim]}>
          <Text style={styles.boutonTexte}>{envoi ? "Envoi…" : mode === "photos" ? "Envoyer les photos" : "Envoyer le rapport"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  titre: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  muted: { color: colors.text.muted, fontSize: 13 },
  puces: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  puce: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  moment: { minWidth: 96, alignItems: "center" },
  puceActive: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  puceTexte: { color: colors.text.DEFAULT, fontWeight: "600" },
  puceTexteActif: { color: colors.white },
  input: { backgroundColor: colors.background.DEFAULT, borderColor: colors.border.DEFAULT, borderWidth: 1, borderRadius: 10, padding: spacing.md, color: colors.text.DEFAULT },
  zone: { minHeight: 140, textAlignVertical: "top" },
  bouton: { backgroundColor: colors.brand[700], borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center" },
  boutonTexte: { color: colors.white, fontWeight: "700", fontSize: 15 },
  dim: { opacity: 0.5 },
});
