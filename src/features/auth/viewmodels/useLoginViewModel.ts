
import { useState } from "react";
import { useRouter } from "expo-router";

import {
  login,
  getLoginErrorStatus,
} from "@/features/auth/services/authService";

import {
  isPasswordChangeRequired,
  type LoginCredentials,
} from "@/features/auth/models/auth.types";

import {
  saveSession,
  savePasswordChangeToken,
} from "@/features/auth/services/authStorage";

import { useAuth } from "@/features/auth/context/AuthContext";

export function useLoginViewModel() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(credentials: LoginCredentials) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await login(credentials);

      // Vérifier si le changement de mot de passe est obligatoire.
      if (isPasswordChangeRequired(result)) {
        await savePasswordChangeToken(result.passwordChangeToken);
        router.replace("/(auth)/change-password");
        return;
      }

      // Enregistrer la session et le token JWT.
      await saveSession(result);

      // Récupérer le profil utilisateur et son rôle depuis le backend.
      await refreshUser();

      // Tous les rôles accèdent à l'application mobile.
      // Les permissions détermineront les fonctionnalités accessibles.
      router.replace("/(tabs)");
    } catch (error) {
      const status = getLoginErrorStatus(error);

      switch (status) {
        case 401:
          setErrorMessage("Email ou mot de passe incorrect.");
          break;

        case 403:
          setErrorMessage(
            "Votre compte a été désactivé. Contactez l'administrateur.",
          );
          break;

        case 0:
        case null:
          setErrorMessage(
            "Impossible de contacter le serveur. Vérifiez votre connexion.",
          );
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
