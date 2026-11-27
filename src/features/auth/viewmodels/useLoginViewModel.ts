import { useState } from "react";
import { useRouter, type Href } from "expo-router";

import { resolveAccess, resolveDefaultTabHref } from "@/features/access/accessEngine";
import { login, getCurrentUser, getLoginErrorStatus } from "@/features/auth/services/authService";
import {
  isPasswordChangeRequired,
  type LoginCredentials,
  type SessionUser,
} from "@/features/auth/models/auth.types";
import {
  saveSession,
  savePasswordChangeToken,
  updateStoredUser,
  clearSession,
} from "@/features/auth/services/authStorage";

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

      let user: SessionUser = result.user;
      try {
        user = await getCurrentUser();
        await updateStoredUser(user);
      } catch {
        user = result.user;
      }

      const profile = resolveAccess(user);
      if (!profile.canUseApp) {
        await clearSession();
        router.replace(
          `/access-denied?code=${profile.denyCode ?? "ROLE_WEB_ONLY"}` as Href,
        );
        return;
      }

      router.replace(resolveDefaultTabHref(profile) as Href);
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