import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { choisirPhotos, prendrePhoto, type FichierLocal } from "./media.service";

type Props = {
  photos: FichierLocal[];
  onChange: (photos: FichierLocal[]) => void;
  max: number;
  /** Text above the buttons (optional) */
  aide?: string;
};

/** Real camera / gallery of the phone (expo-image-picker), thumbnails with « × » to remove. */
export function ChoixPhotos({ photos, onChange, max, aide }: Props) {
  const [erreur, setErreur] = useState<string | null>(null);
  const plein = photos.length >= max;

  async function ajouter(source: "camera" | "galerie") {
    setErreur(null);
    try {
      const nouvelles = source === "camera" ? [await prendrePhoto()].filter((p): p is FichierLocal => !!p) : await choisirPhotos(max - photos.length);
      if (nouvelles.length) onChange([...photos, ...nouvelles].slice(0, max));
    } catch (e) {
      setErreur(getErrorMessage(e));
    }
  }

  return (
    <View style={styles.bloc}>
      {aide ? <Text style={styles.aide}>{aide}</Text> : null}
      {photos.length ? (
        <View style={styles.grille}>
          {photos.map((p, i) => (
            <View key={`${p.uri}-${i}`}>
              <Image source={{ uri: p.uri }} style={styles.vignette} accessibilityLabel={`Photo ${i + 1}`} />
              <Pressable accessibilityRole="button" accessibilityLabel={`Retirer la photo ${i + 1}`} onPress={() => onChange(photos.filter((_, j) => j !== i))} style={styles.retirer} hitSlop={6}>
                <Text style={styles.retirerTexte}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.rangee}>
        <Pressable accessibilityRole="button" disabled={plein} onPress={() => void ajouter("camera")} style={[styles.bouton, plein && styles.dim]}>
          <Text style={styles.boutonTexte}>📷 Prendre une photo</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={plein} onPress={() => void ajouter("galerie")} style={[styles.bouton, plein && styles.dim]}>
          <Text style={styles.boutonTexte}>🖼 Galerie</Text>
        </Pressable>
      </View>
      <Text style={styles.aide}>
        {photos.length}/{max} photo(s)
      </Text>
      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: spacing.sm },
  aide: { color: colors.text.muted, fontSize: 12 },
  grille: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  vignette: { width: 84, height: 84, borderRadius: 8, backgroundColor: colors.surface.muted },
  retirer: { position: "absolute", top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.status.error, alignItems: "center", justifyContent: "center" },
  retirerTexte: { color: colors.white, fontWeight: "700" },
  rangee: { flexDirection: "row", gap: spacing.sm },
  bouton: { flex: 1, minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT, alignItems: "center", justifyContent: "center", padding: spacing.sm },
  boutonTexte: { color: colors.brand[700], fontWeight: "600" },
  dim: { opacity: 0.5 },
  erreur: { color: colors.status.error, fontSize: 13 },
});
