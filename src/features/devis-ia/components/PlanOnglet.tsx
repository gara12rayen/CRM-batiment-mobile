import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { choisirPdf } from "@/shared/media/media.service";
import { analyserPlan, descriptionDepuisPlan, SEUIL_CONFIANCE, type AnalysePlan } from "../services/planOcr.service";
import { ia } from "./iaStyles";

const fr = (n: number) => String(n).replace(".", ",");

type Props = {
  /** Sends the selected rooms to the AI */
  onEnvoyer: (description: string) => void;
  /** Copies the selected rooms into the « Texte » tab */
  onCopier: (description: string) => void;
};

/** Plan tab: PDF → rooms with dimensions → choose the rooms → AI or text. */
export function PlanOnglet({ onEnvoyer, onCopier }: Props) {
  const [analyse, setAnalyse] = useState<AnalysePlan | null>(null);
  const [choisies, setChoisies] = useState<Set<string>>(new Set());
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function choisir() {
    setErreur(null);
    try {
      const pdf = await choisirPdf();
      if (!pdf) return;
      setEnCours(true);
      const a = await analyserPlan(pdf);
      setAnalyse(a);
      // Rooms read with enough confidence are ticked; the others wait for a check
      setChoisies(new Set(a.pieces.filter((p) => p.confiance >= SEUIL_CONFIANCE).map((p) => p.id)));
    } catch (e) {
      setErreur(getErrorMessage(e, "Le plan n’a pas pu être lu."));
    } finally {
      setEnCours(false);
    }
  }

  const basculer = (id: string) =>
    setChoisies((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const selection = analyse?.pieces.filter((p) => choisies.has(p.id)) ?? [];
  const description = descriptionDepuisPlan(selection);

  return (
    <>
      <Text style={ia.muted}>Choisissez le plan en PDF : les pièces et leurs cotes sont relevées, vous cochez celles à chiffrer.</Text>
      <Pressable accessibilityRole="button" disabled={enCours} onPress={() => void choisir()} style={[ia.bouton, ia.outline, enCours && ia.dim]}>
        <Text style={ia.outlineTexte}>{analyse ? "Choisir un autre plan" : "Choisir un plan (PDF)"}</Text>
      </Pressable>
      {enCours ? (
        <View style={styles.centre}>
          <ActivityIndicator color={colors.brand[700]} />
          <Text style={ia.muted}>Lecture du plan…</Text>
        </View>
      ) : null}
      {erreur ? <Text style={ia.danger}>{erreur}</Text> : null}

      {analyse && !enCours ? (
        <>
          <Text style={ia.titre}>{analyse.fichier}</Text>
          {analyse.simulation ? (
            <View style={ia.alerte}>
              <Text style={ia.alerteTexte}>Lecture simulée : la vraie lecture des plans arrive plus tard. Vérifiez les cotes avant d’envoyer.</Text>
            </View>
          ) : null}
          {analyse.pieces.map((p) => {
            const coche = choisies.has(p.id);
            const douteux = p.confiance < SEUIL_CONFIANCE;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: coche }}
                accessibilityLabel={`${p.nom}, ${fr(p.surfaceM2)} mètres carrés${douteux ? ", à vérifier" : ""}`}
                onPress={() => basculer(p.id)}
                style={[styles.piece, douteux && styles.douteux]}
              >
                <View style={[styles.case, coche && styles.caseCochee]}>{coche ? <Text style={styles.coche}>✓</Text> : null}</View>
                <View style={ia.flex1}>
                  <Text style={styles.nom}>{p.nom}</Text>
                  <Text style={ia.muted}>
                    {fr(p.longueurM)} × {fr(p.largeurM)} m · {fr(p.surfaceM2)} m²
                  </Text>
                </View>
                <Text style={[styles.confiance, douteux && styles.confianceBasse]}>
                  {Math.round(p.confiance * 100)} %{douteux ? "\nà vérifier" : ""}
                </Text>
              </Pressable>
            );
          })}
          <Text style={ia.aide}>{selection.length} pièce(s) cochée(s)</Text>
          <Pressable accessibilityRole="button" disabled={!selection.length} onPress={() => onEnvoyer(description)} style={[ia.bouton, ia.primaire, !selection.length && ia.dim]}>
            <Text style={ia.primaireTexte}>Envoyer à l’IA</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={!selection.length} onPress={() => onCopier(description)} style={[ia.bouton, ia.outline, !selection.length && ia.dim]}>
            <Text style={ia.outlineTexte}>Copier dans le texte pour compléter</Text>
          </Pressable>
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md },
  piece: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.border.DEFAULT },
  douteux: { borderColor: colors.status.warning, backgroundColor: "#FFFBEB" },
  case: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border.DEFAULT, alignItems: "center", justifyContent: "center" },
  caseCochee: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  coche: { color: colors.white, fontWeight: "700" },
  nom: { fontWeight: "600", color: colors.text.DEFAULT },
  confiance: { color: colors.status.success, fontWeight: "600", fontSize: 12, textAlign: "right" },
  confianceBasse: { color: colors.status.warning },
});
