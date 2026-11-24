import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { versDateFr } from "../viewmodels/useChantierFicheViewModel";

type Props = {
  visible: boolean;
  dateDebut: string | null;
  dateFin: string | null;
  notes: string | null;
  enCours: boolean;
  onFermer: () => void;
  /** Returns an error message, or null when saved */
  onEnregistrer: (champs: { debut: string; fin: string; notes: string }) => Promise<string | null>;
};

/** Chef / bureau: change the dates and the notes of the job site. */
export function ModifierChantierModal({ visible, dateDebut, dateFin, notes, enCours, onFermer, onEnregistrer }: Props) {
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setDebut(versDateFr(dateDebut));
    setFin(versDateFr(dateFin));
    setTexte(notes ?? "");
    setErreur(null);
  }, [visible, dateDebut, dateFin, notes]);

  const valider = async () => {
    const e = await onEnregistrer({ debut, fin, notes: texte });
    if (e) setErreur(e);
    else onFermer();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFermer}>
      <KeyboardAvoidingView style={styles.fond} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.feuille}>
          <Text style={styles.titre}>Dates et notes</Text>
          <View style={styles.rangee}>
            <View style={styles.flex}>
              <Text style={styles.label}>Début</Text>
              <TextInput value={debut} onChangeText={setDebut} placeholder="JJ/MM/AAAA" placeholderTextColor={colors.text.muted} keyboardType="numbers-and-punctuation" style={styles.input} accessibilityLabel="Date de début" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Fin</Text>
              <TextInput value={fin} onChangeText={setFin} placeholder="JJ/MM/AAAA" placeholderTextColor={colors.text.muted} keyboardType="numbers-and-punctuation" style={styles.input} accessibilityLabel="Date de fin" />
            </View>
          </View>
          <Text style={styles.label}>Notes du chantier</Text>
          <TextInput value={texte} onChangeText={setTexte} multiline maxLength={5000} style={[styles.input, styles.notes]} accessibilityLabel="Notes du chantier" />
          {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
          <View style={styles.rangee}>
            <Pressable accessibilityRole="button" onPress={onFermer} style={[styles.bouton, styles.outline]}>
              <Text style={styles.outlineTexte}>Annuler</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={enCours} onPress={() => void valider()} style={[styles.bouton, styles.primaire, enCours && styles.dim]}>
              <Text style={styles.primaireTexte}>{enCours ? "Enregistrement…" : "Enregistrer"}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.45)" },
  feuille: { backgroundColor: colors.background.DEFAULT, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing["2xl"] },
  titre: { fontSize: 18, fontWeight: "700", color: colors.text.DEFAULT },
  rangee: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1, gap: 4 },
  label: { color: colors.text.muted, fontSize: 13 },
  input: { backgroundColor: colors.surface.DEFAULT, borderColor: colors.border.DEFAULT, borderWidth: 1, borderRadius: 10, padding: spacing.md, color: colors.text.DEFAULT },
  notes: { minHeight: 110, textAlignVertical: "top" },
  erreur: { color: colors.status.error, fontWeight: "600" },
  bouton: { flex: 1, borderRadius: 10, padding: spacing.md, alignItems: "center", minHeight: 48, justifyContent: "center" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.text.DEFAULT, fontWeight: "600" },
  dim: { opacity: 0.5 },
});
