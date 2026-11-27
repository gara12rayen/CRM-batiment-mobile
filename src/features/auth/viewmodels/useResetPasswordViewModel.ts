import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { resetPassword,   getResetPasswordErrorMessage, } from "@/features/auth/services/authService";

export function useResetPasswordViewModel() {
  const params = useLocalSearchParams<{
    email: string;
    code: string;
  }>();

  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email;

  const code = Array.isArray(params.code)
    ? params.code[0]
    : params.code;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(newPassword: string) {
    if (!email || !code) {
      setErrorMessage("La demande de réinitialisation est invalide.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await resetPassword({
        email,
        code,
        newPassword,
      });

      setSuccessMessage(
        response.message || "Votre mot de passe a été modifié.",
      );

      router.replace("/(auth)/login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le mot de passe.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    isLoading,
    errorMessage,
    successMessage,
    handleSubmit,
  };
}