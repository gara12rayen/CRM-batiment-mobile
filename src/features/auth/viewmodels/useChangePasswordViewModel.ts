import { useState } from "react";
import { useRouter } from "expo-router";

import { changePassword } from "@/features/auth/services/authService";
import {
  getPasswordChangeToken,
  saveSession,
  clearPasswordChangeToken,
} from "@/features/auth/services/authStorage";
import type { ChangePasswordCredentials } from "@/features/auth/models/auth.types";
import { ApiError } from "@/core/api/api-client";

export function useChangePasswordViewModel() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleChangePassword(
    credentials: ChangePasswordCredentials,
  ) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const passwordChangeToken = await getPasswordChangeToken();

      if (!passwordChangeToken) {
        setErrorMessage("Votre session a expiré. Veuillez vous reconnecter.");
        router.replace("/(auth)/login");
        return;
      }

      const session = await changePassword(
        credentials,
        passwordChangeToken,
      );

      await saveSession(session);
      await clearPasswordChangeToken();

      router.replace("/(tabs)");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setErrorMessage(
            "Votre session a expiré. Veuillez vous reconnecter.",
          );
          router.replace("/(auth)/login");
          return;
        }

        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    errorMessage,
    handleChangePassword,
  };
}