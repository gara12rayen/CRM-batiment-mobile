import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ApiError } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { Button } from "@/shared/components/Button";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Input } from "@/shared/components/Input";
import { Loading } from "@/shared/components/Loading";
import { SignaturePad } from "@/features/auth/components/SignaturePad";
import {
  deleteSignature,
  getProfile,
  getSignature,
  saveSignature,
  updateProfile,
} from "@/features/auth/services/authService";
import { clearSession, updateStoredUser } from "@/features/auth/services/authStorage";
import type { Profile } from "@/features/auth/models/auth.types";
import { useAccess } from "@/features/access/AccessProvider";

export function ProfileView() {
  const router = useRouter();
  const { has } = useAccess();
  const canEditSignature = has("signature");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [newSignature, setNewSignature] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const loadedProfile = await getProfile();
      setProfile(loadedProfile);
      setNom(loadedProfile.nom);
      setPrenom(loadedProfile.prenom);
      setEmail(loadedProfile.email);
      setTelephone(loadedProfile.telephone ?? "");
      if (has("signature")) {
        try {
          const loadedSignature = await getSignature();
          setSignature(loadedSignature.signatureBase64);
        } catch (error) {
          if (!(error instanceof ApiError) || ![403, 404].includes(error.status)) {
            throw error;
          }
        }
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProfile() {
    const trimmedNom = nom.trim();
    const trimmedPrenom = prenom.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedTelephone = telephone.trim();
    if (!trimmedNom || !trimmedPrenom) {
      setErrorMessage("Le nom et le prénom sont obligatoires.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Veuillez saisir une adresse e-mail valide.");
      return;
    }
    if (trimmedEmail !== profile?.email && !currentPassword) {
      setErrorMessage("Le mot de passe actuel est requis pour changer l’e-mail.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const originalEmail = profile?.email.trim().toLowerCase();
      const profileChanges = {
        ...(trimmedNom !== profile?.nom ? { nom: trimmedNom } : {}),
        ...(trimmedPrenom !== profile?.prenom ? { prenom: trimmedPrenom } : {}),
        ...(trimmedTelephone !== (profile?.telephone ?? "").trim()
          ? { telephone: trimmedTelephone || undefined }
          : {}),
        ...(trimmedEmail !== originalEmail
          ? { email: trimmedEmail, currentPassword }
          : {}),
      };

      if (Object.keys(profileChanges).length === 0) {
        setIsEditing(false);
        return;
      }

      const updated = await updateProfile(profileChanges);
      setProfile(updated);
      await updateStoredUser(updated);
      setCurrentPassword("");
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSignature() {
    if (!newSignature) {
      setErrorMessage("Veuillez dessiner une signature avant de l’enregistrer.");
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const saved = await saveSignature(newSignature);
      setSignature(saved.signatureBase64);
      setNewSignature(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
        void completeLogout();
      }
      return;
    }

    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: () => void completeLogout(),
      },
    ]);
  }

  async function completeLogout() {
    try {
      await clearSession();
    } finally {
      router.replace("/(auth)/login");
    }
  }

  async function handleDeleteSignature() {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await deleteSignature();
      setSignature(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mon profil</Text>
        {errorMessage && <ErrorMessage message={errorMessage} />}

        <View style={styles.card}>
          <Text style={styles.label}>Nom</Text>
          {isEditing ? <Input value={nom} onChangeText={setNom} /> : <Text style={styles.value}>{profile?.nom}</Text>}
          <Text style={styles.label}>Prénom</Text>
          {isEditing ? <Input value={prenom} onChangeText={setPrenom} /> : <Text style={styles.value}>{profile?.prenom}</Text>}
          <Text style={styles.label}>Téléphone</Text>
          {isEditing ? <Input keyboardType="phone-pad" value={telephone} onChangeText={setTelephone} /> : <Text style={styles.value}>{profile?.telephone || "Non renseigné"}</Text>}
          <Text style={styles.label}>E-mail</Text>
          {isEditing ? <Input autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} /> : <Text style={styles.value}>{profile?.email}</Text>}
          {isEditing && email.trim().toLowerCase() !== profile?.email && (
            <>
              <Text style={styles.label}>Mot de passe actuel</Text>
              <Input secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
            </>
          )}
          <View style={styles.actions}>
            {isEditing ? (
              <>
                <Button disabled={isSaving} label="Enregistrer" onPress={() => void handleSaveProfile()} />
                <Button
                  label="Annuler"
                  onPress={() => {
                    if (profile) {
                      setNom(profile.nom);
                      setPrenom(profile.prenom);
                      setEmail(profile.email);
                      setTelephone(profile.telephone ?? "");
                    }
                    setCurrentPassword("");
                    setIsEditing(false);
                  }}
                />
              </>
            ) : (
              <Button
                label="Modifier mes informations"
                onPress={() => {
                  setErrorMessage(null);
                  setIsEditing(true);
                }}
              />
            )}
          </View>
        </View>

        {canEditSignature ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Signature du conseiller</Text>
          {signature && <Image accessibilityLabel="Signature enregistrée" source={{ uri: signature }} style={styles.signature} />}
          <SignaturePad onChange={setNewSignature} />
          <Button disabled={isSaving} label="Enregistrer la signature" onPress={() => void handleSaveSignature()} />
          {signature && <Button disabled={isSaving} label="Supprimer la signature" onPress={() => void handleDeleteSignature()} />}
        </View>
        ) : null}

        <View style={styles.logout}>
          <Button label="Se déconnecter" onPress={handleLogout} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Votre session a expiré. Veuillez vous reconnecter.";
    }
    if (error.status === 400 || error.status === 422) {
      return error.message || "Les informations saisies sont invalides.";
    }
    return error.message;
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  content: { gap: spacing.lg, padding: spacing.lg },
  title: { color: colors.text.DEFAULT, fontSize: 24, fontWeight: "700" },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 12, gap: spacing.sm, padding: spacing.lg },
  label: { color: colors.text.muted, fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
  value: { color: colors.text.DEFAULT, fontSize: 16 },
  sectionTitle: { color: colors.text.DEFAULT, fontSize: 18, fontWeight: "700" },
  signature: { height: 120, resizeMode: "contain", width: "100%" },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  logout: { marginTop: spacing.sm, paddingBottom: spacing["2xl"] },
});
