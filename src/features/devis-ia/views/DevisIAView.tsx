import { useRouter } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { fullName } from "@/shared/utils/format";
import { ApercuProposition } from "../components/ApercuProposition";
import { RappelDemande } from "../components/RappelDemande";
import { RecapBrouillon } from "../components/RecapBrouillon";
import { SaisieOnglets } from "../components/SaisieOnglets";
import { ia } from "../components/iaStyles";
import { typeProjet } from "../models/DevisIA";
import { useDevisIAViewModel } from "../viewmodels/useDevisIAViewModel";

/** Devis IA on a draft: describe → proposal → save → recap. */
export function DevisIAView({ id }: { id: number }) {
  const vm = useDevisIAViewModel(id);
  const router = useRouter();
  const d = vm.devis;

  if (vm.loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  if (!d) {
    return (
      <View style={styles.centre}>
        <ErrorMessage message={vm.erreur ?? "Devis introuvable."} />
        <Pressable accessibilityRole="button" onPress={vm.recharger}>
          <Text style={ia.outlineTexte}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const projet = typeProjet(vm.demande);

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        {/* Client and project (prefilled) */}
        <View style={ia.carte}>
          <Text style={ia.muted}>Devis {d.reference} · brouillon</Text>
          <Text style={styles.client}>{fullName(d.client) || "Client"}</Text>
          {d.client.adresseChantier ? <Text style={ia.muted}>Chantier : {d.client.adresseChantier}</Text> : null}
          {projet ? <Text style={ia.muted}>Type de projet : {projet}</Text> : null}
        </View>

        {vm.erreur ? <ErrorMessage message={vm.erreur} /> : null}

        {vm.etape === "saisie" ? (
          <>
            {vm.demande ? <RappelDemande demande={vm.demande} /> : null}
            <SaisieOnglets vm={vm} />
          </>
        ) : null}

        {vm.etape === "attente" ? (
          <View style={[ia.carte, styles.attente]}>
            <ActivityIndicator size="large" color={colors.brand[700]} />
            <Text style={ia.titre}>L’IA prépare la proposition…</Text>
            <Text style={[ia.muted, styles.texteCentre]}>
              {vm.attenteLongue
                ? "C’est plus long que d’habitude (jusqu’à une minute avec des photos). Restez sur cet écran, rien n’est perdu."
                : "Elle choisit les prestations du catalogue et estime les quantités."}
            </Text>
          </View>
        ) : null}

        {vm.etape === "apercu" ? <ApercuProposition vm={vm} /> : null}

        {vm.etape === "recap" ? <RecapBrouillon vm={vm} onVoirDevis={() => router.replace({ pathname: "/devis/[id]", params: { id: String(d.id) } })} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  client: { fontSize: 17, fontWeight: "700", color: colors.text.DEFAULT },
  attente: { alignItems: "center", paddingVertical: spacing["2xl"] },
  texteCentre: { textAlign: "center" },
});
