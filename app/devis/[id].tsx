import { Link, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { DEVIS_REGLES } from "@/features/devis/models/Devis";
import { DevisDetailView } from "@/features/devis/views/DevisDetailView";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DevisDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canReadQuotes(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous ne pouvez pas consulter ce devis."
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Devis" }} />
      <DevisDetailView
        id={Number(id)}
        footer={(devis) => {
          // Signature on site: bureau, quote sent / handed over / accepted
          const signer = permissions.canSignOnSite(user.role) && DEVIS_REGLES.signableSurPlace.includes(devis.statut);
          // Devis IA: a draft (the chef only on the drafts he started)
          const ia = permissions.canUseDevisIAForQuote(user.role, devis.statut, { createurId: devis.createur?.id, userId: user.id });
          if (!signer && !ia) return null;
          return (
            <View style={styles.pied}>
              {signer ? (
                <Link href={{ pathname: "/devis/signature/[id]", params: { id: String(devis.id) } }} style={[styles.bouton, styles.primaire]}>
                  <Text style={styles.primaireTexte}>Signer sur place</Text>
                </Link>
              ) : null}
              {ia ? (
                <Link href={{ pathname: "/devis/ia", params: { id: String(devis.id) } }} style={[styles.bouton, styles.outline]}>
                  <Text style={styles.outlineTexte}>Ouvrir le Devis IA</Text>
                </Link>
              ) : null}
            </View>
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pied: { gap: spacing.sm },
  bouton: { borderRadius: 10, padding: spacing.md, textAlign: "center", overflow: "hidden" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700", textAlign: "center" },
  outline: { borderWidth: 1, borderColor: colors.brand[700] },
  outlineTexte: { color: colors.brand[700], fontWeight: "600", textAlign: "center" },
});
