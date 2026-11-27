import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  forgotPassword,
  verifyResetCode,
  getVerifyResetCodeErrorMessage 
} from "@/features/auth/services/authService";

export function useVerifyResetCodeViewModel() {
  const params = useLocalSearchParams<{
    email: string;
    expiresAt: string;
  }>();

  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email;

  const initialExpiry = Number(params.expiresAt);

  const [code, setCode] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.ceil((initialExpiry - Date.now()) / 1000)),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds(
        Math.max(0, Math.ceil((initialExpiry - Date.now()) / 1000)),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [initialExpiry]);

  async function handleVerify() {
    if (!email || !/^\d{6}$/.test(code)) {
      setErrorMessage("Veuillez saisir le code à 6 chiffres.");
      return;
    }

    if (remainingSeconds <= 0) {
      setErrorMessage("Le code a expiré. Demandez un nouveau code.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      await verifyResetCode({ email, code });

      router.push({
        pathname: "/(auth)/reset-password",
        params: { email, code },
      });
    } catch (error) {
  setErrorMessage(getVerifyResetCodeErrorMessage(error));
} finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email || isResending) return;

    setErrorMessage("");
    setInfoMessage("");
    setIsResending(true);

    try {
      await forgotPassword({ email });

      const newExpiry = Date.now() + 10 * 60 * 1000;

      setRemainingSeconds(600);
      setCode("");
      setInfoMessage("Si le compte est éligible, un nouveau code a été envoyé.");

      router.replace({
        pathname: "/(auth)/verify-reset-code",
        params: {
          email,
          expiresAt: String(newExpiry),
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de renvoyer le code.",
      );
    } finally {
      setIsResending(false);
    }
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return {
    email,
    code,
    setCode,
    remainingSeconds,
    timerLabel: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    isLoading,
    isResending,
    errorMessage,
    infoMessage,
    handleVerify,
    handleResend,
  };
}