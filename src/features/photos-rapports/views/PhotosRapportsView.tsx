import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useFileEnvoi } from "@/core/offline/useFileEnvoi";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { PhotoApi } from "@/shared/media/FichierApi";
import { fullName } from "@/shared/utils/format";
import { parJour, supprimable, type PhotosReponse, type RapportChantier } from "../models/PhotosRapports";
import { listPhotos, listRapports, supprimerPhoto, supprimerRapport } from "../services/photosRapports.service";

const jourFr = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const heure = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Photos (before / after per task) and reports of a job site. */
export function PhotosRapportsView({ chantierId }: { chantierId: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const file = useFileEnvoi();
  const [onglet, setOnglet] = useState<"photos" | "rapports">("photos");
  const [photos, setPhotos] = useState<PhotosReponse | null>(null);
  const [rapports, setRapports] = useState<RapportChantier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const peutEnvoyer = !!user && permissions.canSendPhotosChantier(user.role);
  const enAttenteIci = file.items.filter((i) => (i.type === "PHOTOS_CHANTIER" || i.type === "RAPPORT_CHANTIER") && i.payload.chantierId === chantierId).length;

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const [p, r] = await Promise.all([listPhotos(chantierId), listRapports(chantierId)]);
      setPhotos(p);
      setRapports(r);
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger les photos et rapports."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chantierId]);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  const retirer = (quoi: "photo" | "rapport", id: number) =>
    Alert.alert(quoi === "photo" ? "Supprimer la photo ?" : "Supprimer le rapport ?", "Possible seulement pendant 15 minutes après l’envoi.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            if (quoi === "photo") await supprimerPhoto(chantierId, id);
            else await supprimerRapport(chantierId, id);
            void charger();
          } catch (e) {
            setErreur(getErrorMessage(e));
          }
        },
      },
    ]);

  if (loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.onglets}>
        {(["photos", "rapports"] as const).map((o) => (
          <Pressable key={o} accessibilityRole="tab" accessibilityState={{ selected: onglet === o }} onPress={() => setOnglet(o)} style={[styles.onglet, onglet === o && styles.ongletActif]}>
            <Text style={[styles.ongletTexte, onglet === o && styles.ongletTexteActif]}>{o === "photos" ? `Photos (${photos?.data.length ?? 0})` : `Rapports (${rapports.length})`}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.contenu} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void charger(); }} />}>
        {enAttenteIci ? (
          <Pressable accessibilityRole="button" onPress={() => router.push("/envois")} style={styles.attente}>
            <Text style={styles.attenteTexte}>⏳ {enAttenteIci} envoi(s) en attente de réseau pour ce chantier — voir</Text>
          </Pressable>
        ) : null}
        {erreur ? <ErrorMessage message={erreur} /> : null}

        {peutEnvoyer ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: onglet === "photos" ? "/chantiers/nouvelles-photos" : "/chantiers/nouveau-rapport", params: { chantierId: String(chantierId) } })}
            style={styles.ajouter}
          >
            <Text style={styles.ajouterTexte}>{onglet === "photos" ? "+ Ajouter des photos" : "+ Écrire un rapport"}</Text>
          </Pressable>
        ) : null}

        {onglet === "photos"
          ? !photos?.data.length
            ? <Text style={styles.vide}>Aucune photo pour ce chantier.</Text>
            : parJour(photos.data).map((g) => (
                <View key={g.jour} style={styles.carte}>
                  <Text style={styles.jour}>{jourFr(g.jour)}</Text>
                  <View style={styles.grille}>
                    {g.photos.map((p) => (
                      <View key={p.id} style={styles.photo}>
                        <PhotoApi fichier={{ id: p.fichierId, nom: `photo-${p.fichierId}.jpg` }} taille={100} />
                        <Text style={styles.legende} numberOfLines={1}>
                          {p.moment === "AVANT" ? "Avant" : "Après"} · {p.tache.libelle}
                        </Text>
                        {supprimable(p.auteur.id, p.createdAt, user?.id) ? (
                          <Pressable accessibilityRole="button" onPress={() => retirer("photo", p.id)} hitSlop={6}>
                            <Text style={styles.supprimer}>Supprimer</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </View>
              ))
          : !rapports.length
            ? <Text style={styles.vide}>Aucun rapport pour ce chantier.</Text>
            : rapports.map((r) => (
                <View key={r.id} style={styles.carte}>
                  <View style={styles.entre}>
                    <Text style={styles.auteur}>{fullName(r.auteur)}</Text>
                    <Text style={styles.muted}>
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")} {heure(r.createdAt)}
                    </Text>
                  </View>
                  {r.tache ? <Text style={styles.muted}>Tâche : {r.tache.libelle}</Text> : null}
                  <Text style={styles.texte}>{r.contenu}</Text>
                  {r.photos.length ? (
                    <View style={styles.grille}>
                      {r.photos.map((ph) => (
                        <PhotoApi key={ph.id} fichier={ph} taille={72} />
                      ))}
                    </View>
                  ) : null}
                  {supprimable(r.auteur.id, r.createdAt, user?.id) ? (
                    <Pressable accessibilityRole="button" onPress={() => retirer("rapport", r.id)} hitSlop={6}>
                      <Text style={styles.supprimer}>Supprimer</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  centre: { flex: 1, alignItems: "center", justifyContent: "center" },
  onglets: { flexDirection: "row", margin: spacing.md, backgroundColor: colors.surface.muted, borderRadius: 10, padding: 3 },
  onglet: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, alignItems: "center" },
  ongletActif: { backgroundColor: colors.surface.DEFAULT },
  ongletTexte: { color: colors.text.muted, fontWeight: "600" },
  ongletTexteActif: { color: colors.brand[700] },
  contenu: { padding: spacing.md, paddingTop: 0, gap: spacing.md, paddingBottom: spacing["3xl"] },
  attente: { backgroundColor: "#FEF3C7", borderRadius: 10, padding: spacing.md },
  attenteTexte: { color: "#92400E", fontWeight: "600" },
  ajouter: { backgroundColor: colors.brand[700], borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center" },
  ajouterTexte: { color: colors.white, fontWeight: "700", fontSize: 15 },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: spacing.sm },
  jour: { fontWeight: "700", color: colors.text.DEFAULT, textTransform: "capitalize" },
  grille: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  photo: { width: 100, gap: 2 },
  legende: { fontSize: 11, color: colors.text.muted },
  supprimer: { color: colors.status.error, fontSize: 12, fontWeight: "600" },
  entre: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  auteur: { fontWeight: "700", color: colors.text.DEFAULT },
  texte: { color: colors.text.DEFAULT, lineHeight: 20 },
  muted: { color: colors.text.muted, fontSize: 12 },
  vide: { color: colors.text.muted, textAlign: "center", paddingVertical: spacing.xl },
});
