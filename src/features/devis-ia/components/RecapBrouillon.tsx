import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { DevisLigne } from "@/features/devis/models/Devis";
import { formatEuros, formatUnite } from "@/shared/utils/format";
import { margeLigne, SEUIL_MARGE_ALERTE, versTexte } from "../models/DevisIA";
import type { DevisIAViewModel } from "../viewmodels/useDevisIAViewModel";
import { ia } from "./iaStyles";

const pct = (n: number) => `${n.toFixed(1).replace(".", ",")} %`;

function LigneRecap({ l, vm }: { l: DevisLigne; vm: DevisIAViewModel }) {
  const [quantite, setQuantite] = useState(versTexte(l.quantite));
  const marge = margeLigne(l.totalHT, l.coutTotal);
  const basse = marge !== null && marge < SEUIL_MARGE_ALERTE;
  const nouvelle = vm.nouvelles.includes(l.id);
  const occupe = vm.ligneEnCours === l.id;
  const change = quantite.replace(",", ".") !== String(l.quantite);

  const supprimer = () =>
    Alert.alert("Retirer la ligne ?", l.description ?? "Prestation", [
      { text: "Annuler", style: "cancel" },
      { text: "Retirer", style: "destructive", onPress: () => void vm.supprimer(l.id) },
    ]);

  return (
    <View style={[styles.ligne, nouvelle && styles.nouvelle]}>
      <View style={ia.ligneEntre}>
        <Text style={[styles.nom, ia.flex1]}>{l.description ?? "Prestation"}</Text>
        {vm.avecPrix ? <Text style={styles.montant}>{formatEuros(l.totalHT)}</Text> : null}
      </View>
      {vm.avecPrix ? (
        <>
          <Text style={ia.muted}>
            {String(l.quantite).replace(".", ",")} {formatUnite(l.unite)} × {formatEuros(l.prixUnitaireVente)}
            {marge !== null ? <Text style={basse ? ia.danger : styles.margeOk}> · marge {pct(marge)}</Text> : null}
          </Text>
          <View style={styles.actions}>
            <TextInput value={quantite} onChangeText={setQuantite} keyboardType="decimal-pad" editable={!occupe} style={[ia.input, styles.quantite]} accessibilityLabel={`Quantité ${l.description ?? ""}`} />
            <Pressable accessibilityRole="button" disabled={!change || occupe} onPress={() => void vm.changerQuantite(l.id, quantite)} style={[styles.petit, ia.outline, (!change || occupe) && ia.dim]}>
              <Text style={ia.outlineTexte}>Ajuster</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={occupe} onPress={supprimer} style={[styles.petit, ia.outline, occupe && ia.dim]}>
              <Text style={styles.retirer}>Retirer</Text>
            </Pressable>
            {occupe ? <ActivityIndicator /> : null}
          </View>
        </>
      ) : (
        <Text style={ia.muted}>
          {String(l.quantite).replace(".", ",")} {formatUnite(l.unite)}
        </Text>
      )}
    </View>
  );
}

/** After « Enregistrer en brouillon » : the quote as saved, with the margins (bureau). */
export function RecapBrouillon({ vm, onVoirDevis }: { vm: DevisIAViewModel; onVoirDevis: () => void }) {
  const d = vm.devis;
  if (!d) return null;
  const marge = d.margePourcent !== undefined && d.margePourcent !== null ? Number(d.margePourcent) : null;
  const basse = marge !== null && marge < SEUIL_MARGE_ALERTE;

  return (
    <>
      <View style={[ia.carte, styles.succes]}>
        <Text style={ia.titre}>Brouillon enregistré</Text>
        <Text style={ia.texte}>
          {vm.nouvelles.length} ligne(s) ajoutée(s) au devis {d.reference}.
          {!vm.avecPrix ? " Le bureau est prévenu : il vérifie les prix avant l’envoi." : ""}
        </Text>
      </View>

      {vm.avecPrix ? (
        <View style={[ia.carte, basse && styles.alerteRouge]}>
          <View style={ia.ligneEntre}>
            <Text style={ia.titre}>Marge du devis</Text>
            <Text style={[styles.margeGlobale, basse && { color: colors.status.error }]}>{marge !== null ? pct(marge) : "—"}</Text>
          </View>
          {basse ? <Text style={ia.danger}>Marge sous {SEUIL_MARGE_ALERTE} % : ajustez les quantités ou les prix avant l’envoi.</Text> : null}
          <View style={ia.ligneEntre}>
            <Text style={ia.muted}>Total HT</Text>
            <Text>{formatEuros(d.totalHT)}</Text>
          </View>
          <View style={ia.ligneEntre}>
            <Text style={ia.muted}>Total TTC</Text>
            <Text style={styles.montant}>{formatEuros(d.totalTTC)}</Text>
          </View>
        </View>
      ) : null}

      <View style={ia.carte}>
        <Text style={ia.titre}>Lignes du devis ({d.lignes.length})</Text>
        {d.lignes.map((l) => (
          <LigneRecap key={`${l.id}-${l.quantite}`} l={l} vm={vm} />
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={onVoirDevis} style={[ia.bouton, ia.primaire]}>
        <Text style={ia.primaireTexte}>Voir le devis</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={vm.recommencer} style={[ia.bouton, ia.outline]}>
        <Text style={ia.outlineTexte}>Ajouter d’autres lignes avec l’IA</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  ligne: { gap: spacing.xs, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border.DEFAULT },
  nouvelle: { backgroundColor: colors.brand[100], marginHorizontal: -spacing.sm, paddingHorizontal: spacing.sm, borderRadius: 8 },
  nom: { fontWeight: "600", color: colors.text.DEFAULT },
  montant: { fontWeight: "700", color: colors.text.DEFAULT },
  margeOk: { color: colors.status.success, fontWeight: "600" },
  actions: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  quantite: { width: 90, paddingVertical: spacing.sm },
  petit: { borderRadius: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  retirer: { color: colors.status.error, fontWeight: "600" },
  succes: { borderColor: colors.status.success },
  alerteRouge: { borderColor: colors.status.error, backgroundColor: "#FEF2F2" },
  margeGlobale: { fontSize: 20, fontWeight: "700", color: colors.status.success },
});
