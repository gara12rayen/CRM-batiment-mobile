import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { LecteurAudio } from "@/shared/media/LecteurAudio";
import { telechargerFichier } from "@/shared/media/media.service";
import { typeProjet, type DemandeRappel, type PieceJointeDemande } from "../models/DevisIA";
import { ia } from "./iaStyles";

/** Downloads one attachment with the token, then shows the photo or the audio player. */
function PieceJointe({ piece }: { piece: PieceJointeDemande }) {
  const [uri, setUri] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [demandee, setDemandee] = useState(piece.type === "PHOTO"); // photos load at once, audio on tap

  useEffect(() => {
    if (!demandee || uri) return;
    let actif = true;
    telechargerFichier(piece.fichier.id, piece.fichier.nom)
      .then((u) => actif && setUri(u))
      .catch((e) => actif && setErreur(getErrorMessage(e)));
    return () => {
      actif = false;
    };
  }, [demandee, uri, piece.fichier.id, piece.fichier.nom]);

  const libelleAudio = `Note vocale${piece.dureeSecondes ? ` (${piece.dureeSecondes} s)` : ""}`;

  if (erreur) return <Text style={ia.aide}>{erreur}</Text>;

  if (piece.type === "PHOTO") {
    return uri ? <Image source={{ uri }} style={styles.photo} accessibilityLabel="Photo de la demande" /> : <View style={[styles.photo, styles.centre]}><ActivityIndicator /></View>;
  }

  if (!demandee) {
    return (
      <Pressable accessibilityRole="button" onPress={() => setDemandee(true)} style={({ pressed }) => [styles.audio, pressed && ia.pressed]}>
        <Text style={ia.outlineTexte}>▶ {libelleAudio} — télécharger et écouter</Text>
      </Pressable>
    );
  }
  return uri ? <LecteurAudio uri={uri} libelle={libelleAudio} /> : <ActivityIndicator />;
}

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
            <PieceJointe key={p.id} piece={p} />
          ))}
        </View>
      ) : null}
      {audios.map((a) => (
        <PieceJointe key={a.id} piece={a} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  photos: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  photo: { width: 96, height: 96, borderRadius: 8, backgroundColor: colors.surface.muted },
  centre: { alignItems: "center", justifyContent: "center" },
  audio: { paddingVertical: spacing.sm },
});
