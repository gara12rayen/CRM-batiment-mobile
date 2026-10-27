
import { useState } from "react";
import { Alert, Linking } from "react-native";
import { useRouter } from "expo-router";

import { ApiError } from "@/core/api/api-client";
import { login } from "@/features/auth/services/authService";
import type {
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/models/auth.types";

const WEB_APP_URL = process.env.EXPO_PUBLIC_APP_URL;

export function useLoginViewModel() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginResult, setLoginResult] = useState<LoginResponse | null>(null);

  async function handleLogin(
    credentials: LoginCredentials,
  ): Promise<void> {
    setIsLoading(true);
    setErrorMessage(null);
    setLoginResult(null);

    try {
      const result = await login(credentials);
      setLoginResult(result);

    
if (!("user" in result)) {
  setErrorMessage(result.message);
  return;
}

if (result.user.role === "ASSISTANTE") {
  Alert.alert(
    "Version web",
    "Ce rôle utilise la version web",
    [
      {
        text: "Ouvrir la version web",
        onPress: async () => {
          if (!WEB_APP_URL) {
            Alert.alert(
              "Erreur",
              "L'adresse de la version web n'est pas configurée.",
            );
            return;
          }

          try {
            await Linking.openURL(WEB_APP_URL);
          } catch {
            Alert.alert("Erreur", "Impossible d'ouvrir la version web.");
          }
        },
      },
      { text: "Fermer", style: "cancel" },
    ],
  );

  return;
}


      // Other roles continue to the mobile application.
      router.replace("/(tabs)");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            setErrorMessage("Email ou mot de passe incorrect.");
            break;
          case 403:
            setErrorMessage(
              "Votre compte a été désactivé. Contactez l'administrateur.",
            );
            break;
          case 0:
            setErrorMessage(
              "Impossible de contacter le serveur. Vérifiez votre connexion.",
            );
            break;
          default:
            setErrorMessage(
              "Une erreur est survenue. Veuillez réessayer.",
            );
        }
      } else {
        setErrorMessage(
          "Une erreur inattendue est survenue. Veuillez réessayer.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return {
    handleLogin,
    isLoading,
    errorMessage,
    loginResult,
  };
}
