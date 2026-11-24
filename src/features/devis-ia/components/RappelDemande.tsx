import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@/core/theme/spacing";
import { AudioApi, PhotoApi } from "@/shared/media/FichierApi";
import { typeProjet, type DemandeRappel } from "../models/DevisIA";
import { ia } from "./iaStyles";

/** Reminder of the request the quote comes from: need, kind of project, photos, voice notes. */
export function RappelDemande({ demande }: { demande: DemandeRappel }) {
  const photos = demande.fichiers?.filter((f) => f.type === "PHOTO") ?? [];
  const audios = demande.fichiers?.filter((f) => f.type === "AUDIO") ?? [];
  const projet = typeProjet(demande);

  return (
    <View style={ia.carte}>
      <Text style={ia.titre}>Rappel de la demande {demande.reference}</Text>
      {projet ? <Text style={ia.muted}>Type de projet : {projet}</Text> : null}
      <Text style={ia.texte} numberOfLines={6}>
        {demande.description}
      </Text>
      {photos.length ? (
        <View style={styles.photos}>
          {photos.map((p) => (
            <PhotoApi key={p.id} fichier={p.fichier} />
          ))}
        </View>
      ) : null}
      {audios.map((a) => (
        <AudioApi key={a.id} fichier={a.fichier} dureeSecondes={a.dureeSecondes} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  photos: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
