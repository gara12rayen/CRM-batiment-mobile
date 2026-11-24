import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { LecteurAudio } from "./LecteurAudio";
import type { FichierLocal } from "./media.service";
import { DUREE_MAX_SECONDES, useEnregistreurVocal } from "./useEnregistreurVocal";

export type NoteVocale = { fichier: FichierLocal; dureeSecondes: number };

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Record (pause / resume, time left), listen again, delete. One note at a time. */
export function NoteVocaleEnregistreur({ note, onChange }: { note: NoteVocale | null; onChange: (n: NoteVocale | null) => void }) {
  const rec = useEnregistreurVocal();

  const terminer = async () => {
    const duree = rec.secondes;
    const fichier = await rec.arreter();
    if (fichier) onChange({ fichier, dureeSecondes: Math.max(1, duree) });
  };

  // Stops by itself at the limit
  useEffect(() => {
    if (rec.enCours && rec.secondes >= DUREE_MAX_SECONDES) void terminer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.secondes]);

  if (note && !rec.enCours) {
    return (
      <View style={styles.bloc}>
        <LecteurAudio uri={note.fichier.uri} libelle={`Note vocale (${mmss(note.dureeSecondes)})`} />
        <Pressable accessibilityRole="button" onPress={() => onChange(null)} hitSlop={6}>
          <Text style={styles.supprimer}>Supprimer et recommencer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.bloc}>
      {!rec.enCours ? (
        <Pressable accessibilityRole="button" onPress={() => void rec.demarrer()} style={[styles.bouton, styles.rouge]}>
          <Text style={styles.boutonTexte}>● Enregistrer une note vocale</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.temps}>
            {rec.enPause ? "En pause" : "Enregistrement"} {mmss(rec.secondes)} · reste {mmss(rec.restantes)}
          </Text>
          <View style={styles.rangee}>
            <Pressable accessibilityRole="button" onPress={rec.enPause ? rec.reprendre : rec.pause} style={[styles.bouton, styles.outline, styles.flex]}>
              <Text style={styles.outlineTexte}>{rec.enPause ? "▶ Reprendre" : "❚❚ Pause"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void terminer()} style={[styles.bouton, styles.rouge, styles.flex]}>
              <Text style={styles.boutonTexte}>■ Terminer</Text>
            </Pressable>
          </View>
        </>
      )}
      {rec.erreur ? <Text style={styles.erreur}>{rec.erreur}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: spacing.sm },
  rangee: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  bouton: { minHeight: 48, borderRadius: 10, alignItems: "center", justifyContent: "center", padding: spacing.sm },
  rouge: { backgroundColor: colors.status.error },
  boutonTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.text.DEFAULT, fontWeight: "600" },
  temps: { color: colors.text.DEFAULT, fontWeight: "600", textAlign: "center" },
  supprimer: { color: colors.status.error, fontWeight: "600" },
  erreur: { color: colors.status.error, fontSize: 13 },
});
