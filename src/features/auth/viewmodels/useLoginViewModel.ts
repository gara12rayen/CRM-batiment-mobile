import { useState } from "react";
import { Alert, Linking } from "react-native";
import { useRouter } from "expo-router";

import { login, getLoginErrorStatus } from "@/features/auth/services/authService";
import {
  isPasswordChangeRequired,
  type LoginCredentials,
} from "@/features/auth/models/auth.types";
import {
  saveSession,
  savePasswordChangeToken,
} from "@/features/auth/services/authStorage";

const WEB_APP_URL = process.env.EXPO_PUBLIC_APP_URL;

export function useLoginViewModel() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(credentials: LoginCredentials) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await login(credentials);

      if (isPasswordChangeRequired(result)) {
        await savePasswordChangeToken(result.passwordChangeToken);
        router.replace("/(auth)/change-password");
        return;
      }

      await saveSession(result);

      if (result.user.role === "ASSISTANTE") {
        if (!WEB_APP_URL) {
          Alert.alert(
            "Configuration manquante",
            "L'adresse de l'application n'est pas configurée.",
          );
          return;
        }

        Alert.alert(
          "Accès sur ordinateur",
          "Votre rôle nécessite d'utiliser la version web de l'application.",
          [
            {
              text: "Ouvrir",
              onPress: () => {
                void Linking.openURL(WEB_APP_URL).catch(() => {
                  Alert.alert("Erreur", "Impossible d'ouvrir l'application.");
                });
              },
            },
            { text: "Annuler", style: "cancel" },
          ],
        );

        return;
      }

      router.replace("/(tabs)");
    } catch (error) {
      const status = getLoginErrorStatus(error);

      switch (status) {
        case 401:
          setErrorMessage("Email ou mot de passe incorrect.");
          break;
        case 403:
          setErrorMessage("Votre compte a été désactivé. Contactez l'administrateur.");
          break;
        case 0:
          setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
          break;
        default:
          setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    errorMessage,
    handleLogin,
  };
}