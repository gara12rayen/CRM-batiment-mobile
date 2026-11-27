import { useState } from "react";
import { router } from "expo-router";
import { forgotPassword } from "@/features/auth/services/authService";

export function useForgotPasswordViewModel() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(email: string) {
    setErrorMessage("");
    setIsLoading(true);

    try {
      await forgotPassword({ email });

      router.push({
        pathname: "/(auth)/verify-reset-code",
        params: {
          email: email.trim().toLowerCase(),
          expiresAt: String(Date.now() + 10 * 60 * 1000),
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer le code. Réessayez.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    handleSubmit,
    isLoading,
    errorMessage,
  };
}