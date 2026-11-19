import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { formatEuros, formatUnite } from "@/shared/utils/format";
import { lireNombre, type LigneEditee, type PositionMarche } from "../models/DevisIA";
import type { DevisIAViewModel } from "../viewmodels/useDevisIAViewModel";
import { ia } from "./iaStyles";

const POSITION: Record<PositionMarche, { label: string; couleur: string }> = {
  BAS: { label: "sous le marché", couleur: colors.status.warning },
  DANS: { label: "dans le marché", couleur: colors.status.success },
  HAUT: { label: "au-dessus du marché", couleur: colors.status.warning },
};

function Ligne({ l, vm }: { l: LigneEditee; vm: DevisIAViewModel }) {
  const q = lireNombre(l.quantiteTexte);
  const p = lireNombre(l.prixTexte);
  const position = l.positionMarche ? POSITION[l.positionMarche] : null;

  return (
    <View style={styles.ligne}>
      <View style={ia.ligneEntre}>
        <View style={ia.flex1}>
          <Text style={styles.nom}>{l.nom}</Text>
          <Text style={ia.aide}>{l.categorie}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Retirer ${l.nom}`} hitSlop={8} onPress={() => vm.retirerLigne(l.cle)}>
          <Text style={styles.retirer}>Retirer</Text>
        </Pressable>
      </View>
      {l.justification ? <Text style={ia.muted}>{l.justification}</Text> : null}

      <View style={styles.champs}>
        <View style={ia.flex1}>
          <Text style={ia.aide}>Quantité ({formatUnite(l.unite)})</Text>
          <TextInput value={l.quantiteTexte} onChangeText={(t) => vm.modifier(l.cle, "quantiteTexte", t)} keyboardType="decimal-pad" style={[ia.input, q === null && styles.invalide]} accessibilityLabel={`Quantité ${l.nom}`} />
        </View>
        {vm.avecPrix ? (
          <>
            <View style={ia.flex1}>
              <Text style={ia.aide}>Prix unitaire HT</Text>
              <TextInput value={l.prixTexte} onChangeText={(t) => vm.modifier(l.cle, "prixTexte", t)} keyboardType="decimal-pad" style={[ia.input, p === null && styles.invalide]} accessibilityLabel={`Prix unitaire ${l.nom}`} />
            </View>
            <View style={styles.total}>
              <Text style={ia.aide}>Total HT</Text>
              <Text style={styles.totalValeur}>{q !== null && p !== null ? formatEuros(q * p) : "—"}</Text>
            </View>
          </>
        ) : null}
      </View>

      {vm.avecPrix && l.marche ? (
        <Text style={ia.aide}>
          Marché : {formatEuros(l.marche.basse)} – {formatEuros(l.marche.haute)}
          {l.marche.mediane !== null ? ` (médiane ${formatEuros(l.marche.mediane)})` : ""}
          {position ? <Text style={{ color: position.couleur, fontWeight: "600" }}> · prix proposé {position.label}</Text> : null}
        </Text>
      ) : null}
    </View>
  );
}

/** The proposal to correct: quantities (+ prices for the bureau), remove lines, then save. */
export function ApercuProposition({ vm }: { vm: DevisIAViewModel }) {
  const p = vm.proposition;
  if (!p) return null;

  return (
    <>
      {!p.modeIA ? (
        <View style={ia.alerte}>
          <Text style={ia.alerteTexte}>Mode sans IA : lignes trouvées par mots-clés. Vérifiez-les une par une.</Text>
        </View>
      ) : null}
      {p.avertissement ? (
        <View style={ia.alerte}>
          <Text style={ia.alerteTexte}>{p.avertissement}</Text>
        </View>
      ) : null}

      {p.analysePhoto ? (
        <View style={ia.carte}>
          <Text style={ia.titre}>Ce que l’IA a vu</Text>
          <Text style={ia.texte}>
            {p.analysePhoto.piece}
            {p.analysePhoto.surfaceEstimeeM2 !== null ? ` · environ ${String(p.analysePhoto.surfaceEstimeeM2).replace(".", ",")} m²` : ""}
          </Text>
          {p.analysePhoto.etat ? <Text style={ia.muted}>État : {p.analysePhoto.etat}</Text> : null}
          {p.analysePhoto.elementsVisibles.length ? <Text style={ia.muted}>Éléments : {p.analysePhoto.elementsVisibles.join(", ")}</Text> : null}
        </View>
      ) : null}

      <View style={ia.carte}>
        <Text style={ia.titre}>Lignes proposées ({vm.lignes.length})</Text>
        {!vm.lignes.length ? <Text style={ia.muted}>Aucune ligne retenue. Recommencez avec une autre description.</Text> : null}
        {vm.lignes.map((l) => (
          <Ligne key={l.cle} l={l} vm={vm} />
        ))}
        {vm.avecPrix && vm.totalApercu !== null ? (
          <View style={ia.ligneEntre}>
            <Text style={styles.totalLabel}>Total HT proposé</Text>
            <Text style={styles.totalGeneral}>{formatEuros(vm.totalApercu)}</Text>
          </View>
        ) : null}
        {!vm.avecPrix ? <Text style={ia.aide}>Les prix sont ajoutés et vérifiés par le bureau.</Text> : null}
      </View>

      {p.hypotheses.length ? (
        <View style={ia.carte}>
          <Text style={ia.titre}>Hypothèses à vérifier</Text>
          {p.hypotheses.map((h, i) => (
            <Text key={i} style={ia.texte}>
              - {h}
            </Text>
          ))}
        </View>
      ) : null}

      {p.nonCouverts.length ? (
        <View style={ia.carte}>
          <Text style={ia.titre}>Non trouvé dans le catalogue</Text>
          <Text style={ia.muted}>À ajouter à la main sur le devis :</Text>
          {p.nonCouverts.map((n, i) => (
            <Text key={i} style={ia.texte}>
              - {n}
            </Text>
          ))}
        </View>
      ) : null}

      <Pressable accessibilityRole="button" disabled={!vm.lignesValides || vm.enregistrement} onPress={() => void vm.enregistrer()} style={[ia.bouton, ia.primaire, (!vm.lignesValides || vm.enregistrement) && ia.dim]}>
        <Text style={ia.primaireTexte}>{vm.enregistrement ? "Enregistrement…" : "Enregistrer en brouillon"}</Text>
      </Pressable>
      {!vm.lignesValides && vm.lignes.length ? <Text style={ia.aide}>Corrigez les quantités{vm.avecPrix ? " et les prix" : ""} en rouge.</Text> : null}
      <Pressable accessibilityRole="button" disabled={vm.enregistrement} onPress={vm.recommencer} style={[ia.bouton, ia.outline]}>
        <Text style={ia.outlineTexte}>Modifier la description</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  ligne: { gap: spacing.sm, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border.DEFAULT },
  nom: { fontWeight: "600", color: colors.text.DEFAULT },
  retirer: { color: colors.status.error, fontWeight: "600" },
  champs: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-end" },
  invalide: { borderColor: colors.status.error },
  total: { minWidth: 84, alignItems: "flex-end", paddingBottom: spacing.md },
  totalValeur: { fontWeight: "700", color: colors.text.DEFAULT },
  totalLabel: { fontWeight: "700", color: colors.text.DEFAULT },
  totalGeneral: { fontWeight: "700", fontSize: 18, color: colors.brand[900] },
});
