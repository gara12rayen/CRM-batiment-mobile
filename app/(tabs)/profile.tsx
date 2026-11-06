
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/features/auth/context/AuthContext";
import { PlaceholderView } from "@/shared/components/PlaceholderView";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrateur",
  TECHNICO: "Technico-commercial",
  ASSISTANTE: "Assistante administrative",
  CHEF_CHANTIER: "Chef de chantier",
  SOUS_TRAITANT: "Sous-traitant",
  FOURNISSEUR: "Fournisseur",
};

export default function ProfileRoute() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <PlaceholderView
        title="Session expirée"
        description="Veuillez vous reconnecter."
      />
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.prenom?.charAt(0) || "").toUpperCase()}
            {(user.nom?.charAt(0) || "").toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>
          {user.prenom} {user.nom}
        </Text>

        <Text style={styles.role}>
          {roleLabels[user.role] ?? user.role}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informations du compte</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Rôle</Text>
          <Text style={styles.value}>
            {roleLabels[user.role] ?? user.role}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Identifiant</Text>
          <Text style={styles.value}>{user.id}</Text>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.brand[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 25,
    fontWeight: "700",
    color: colors.brand[900],
  },
  name: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.text.DEFAULT,
  },
  role: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.DEFAULT,
    marginBottom: spacing.md,
  },
  infoRow: {
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.text.muted,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.DEFAULT,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.DEFAULT,
  },
  logoutButton: {
    backgroundColor: colors.brand[700],
    padding: spacing.md,
    borderRadius: 10,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  logoutText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
