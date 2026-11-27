import axios from "axios";
import { apiClient, ApiError } from "@/core/api/api-client";
import type {
  ChangePasswordCredentials,
  ChangePasswordResponse,
  ForgotPasswordCredentials,
  ForgotPasswordResponse,
  LoginCredentials,
  LoginResponse,
  Profile,
  ResetPasswordCredentials,
  SessionUser,
  Signature,
  UpdateProfileInput,
  VerifyResetCodeCredentials,
  VerifyResetCodeResponse,
} from "@/features/auth/models/auth.types";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  });
  return response.data;
}

export function getLoginErrorStatus(error: unknown): number | null {
  if (error instanceof ApiError) return error.status;
  if (axios.isAxiosError(error)) return error.response?.status ?? null;
  return null;
}

export async function changePassword(
  credentials: ChangePasswordCredentials,
  passwordChangeToken: string,
): Promise<ChangePasswordResponse> {
  const response = await apiClient.post<ChangePasswordResponse>(
    "/auth/change-password",
    credentials,
    { headers: { Authorization: ["Bearer", passwordChangeToken].join(" ") } },
  );
  return response.data;
}

export async function getCurrentUser(): Promise<SessionUser> {
  const response = await apiClient.get<SessionUser>("/auth/me");
  const profile = response.data;
  return {
    ...profile,
    companyId: profile.companyId ?? profile.company?.id ?? null,
  };
}

export async function getProfile(): Promise<Profile> {
  const response = await apiClient.get<Profile>("/auth/me");
  return response.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const response = await apiClient.patch<Profile>("/auth/me", input);
  return response.data;
}

export async function getSignature(): Promise<Signature> {
  const response = await apiClient.get<Signature>("/auth/me/signature");
  return response.data;
}

export async function saveSignature(signatureBase64: string): Promise<Signature> {
  const response = await apiClient.put<Signature>("/auth/me/signature", {
    signatureBase64,
  });
  return response.data;
}

export async function deleteSignature(): Promise<void> {
  await apiClient.delete("/auth/me/signature");
}

export async function forgotPassword(
  credentials: ForgotPasswordCredentials,
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    { email: credentials.email.trim().toLowerCase() },
  );
  return response.data;
}

export async function verifyResetCode(
  credentials: VerifyResetCodeCredentials,
): Promise<VerifyResetCodeResponse> {
  const response = await apiClient.post<VerifyResetCodeResponse>(
    "/auth/verify-reset-code",
    {
      email: credentials.email.trim().toLowerCase(),
      code: credentials.code.trim(),
    },
  );
  return response.data;
}

export async function resetPassword(
  credentials: ResetPasswordCredentials,
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/auth/reset-password",
    {
      email: credentials.email.trim().toLowerCase(),
      code: credentials.code.trim(),
      newPassword: credentials.newPassword,
    },
  );
  return response.data;
}

export function getVerifyResetCodeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Trop de tentatives. Veuillez patienter avant de réessayer.";
    if (error.status === 400) return "Le code de vérification est incorrect ou a expiré.";
  }
  return "Impossible de vérifier le code. Veuillez réessayer.";
}

export function getResetPasswordErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) {
    return "Les informations de réinitialisation sont incorrectes ou expirées.";
  }
  return "Impossible de réinitialiser le mot de passe. Veuillez réessayer.";
}
