import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { LecteurAudio } from "./LecteurAudio";
import { telechargerFichier } from "./media.service";

/** A file stored by the API (GET /fichiers/:id/contenu needs the token). */
export type FichierDistant = { id: number; nom: string };

function useTelechargement(fichier: FichierDistant, actif: boolean) {
  const [uri, setUri] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!actif || uri) return;
    let vivant = true;
    telechargerFichier(fichier.id, fichier.nom)
      .then((u) => vivant && setUri(u))
      .catch((e) => vivant && setErreur(getErrorMessage(e)));
    return () => {
      vivant = false;
    };
  }, [actif, uri, fichier.id, fichier.nom]);

  return { uri, erreur };
}

/** Thumbnail of a photo of the API; a tap opens it full screen. */
export function PhotoApi({ fichier, taille = 96 }: { fichier: FichierDistant; taille?: number }) {
  const { uri, erreur } = useTelechargement(fichier, true);
  const [plein, setPlein] = useState(false);

  if (erreur) {
    return (
      <View style={[styles.vignette, styles.centre, { width: taille, height: taille }]}>
        <Text style={styles.erreur}>Photo indisponible</Text>
      </View>
    );
  }
  if (!uri) {
    return (
      <View style={[styles.vignette, styles.centre, { width: taille, height: taille }]}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <>
      <Pressable accessibilityRole="imagebutton" accessibilityLabel="Agrandir la photo" onPress={() => setPlein(true)}>
        <Image source={{ uri }} style={[styles.vignette, { width: taille, height: taille }]} />
      </Pressable>
      <Modal visible={plein} transparent animationType="fade" onRequestClose={() => setPlein(false)}>
        <Pressable style={styles.fond} onPress={() => setPlein(false)} accessibilityLabel="Fermer la photo">
          <Image source={{ uri }} style={styles.pleine} resizeMode="contain" />
          <Text style={styles.fermer}>Touchez pour fermer</Text>
        </Pressable>
      </Modal>
    </>
  );
}

/** Voice note of the API: downloaded on the first tap, then played. */
export function AudioApi({ fichier, dureeSecondes }: { fichier: FichierDistant; dureeSecondes?: number | null }) {
  const [demande, setDemande] = useState(false);
  const { uri, erreur } = useTelechargement(fichier, demande);
  const libelle = `Note vocale${dureeSecondes ? ` (${dureeSecondes} s)` : ""}`;

  if (erreur) return <Text style={styles.erreur}>{erreur}</Text>;
  if (!demande) {
    return (
      <Pressable accessibilityRole="button" onPress={() => setDemande(true)} style={({ pressed }) => [styles.audio, pressed && styles.pressed]}>
        <Text style={styles.lien}>▶ {libelle} — télécharger et écouter</Text>
      </Pressable>
    );
  }
  return uri ? <LecteurAudio uri={uri} libelle={libelle} /> : <ActivityIndicator />;
}

const styles = StyleSheet.create({
  vignette: { borderRadius: 8, backgroundColor: colors.surface.muted },
  centre: { alignItems: "center", justifyContent: "center" },
  erreur: { color: colors.text.muted, fontSize: 11, textAlign: "center" },
  fond: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center", padding: spacing.md },
  pleine: { width: "100%", height: "85%" },
  fermer: { color: colors.white, marginTop: spacing.md },
  audio: { paddingVertical: spacing.sm },
  pressed: { opacity: 0.7 },
  lien: { color: colors.brand[700], fontWeight: "600" },
});
