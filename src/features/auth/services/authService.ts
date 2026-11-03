
import axios from "axios";
import { apiClient, ApiError } from "@/core/api/api-client";
import type {
  LoginCredentials,
  LoginResponse,
   ChangePasswordCredentials,
  ChangePasswordResponse,
   ForgotPasswordCredentials,
  ForgotPasswordResponse,
  VerifyResetCodeCredentials,
  VerifyResetCodeResponse,
  ResetPasswordCredentials,
} from "@/features/auth/models/auth.types";

/**
 * Authenticates a user with the backend API.
 *
 * Sends the user's email and password to the login endpoint.
 * The email is trimmed and converted to lowercase before sending.
 */
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    },
  );

  return response.data;
}

/**
 * Extracts the HTTP status code from an Axios error.
 */
export function getLoginErrorStatus(error: unknown): number | null {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }

  return null;
}



export async function changePassword(
  credentials: ChangePasswordCredentials,
  passwordChangeToken: string,
): Promise<ChangePasswordResponse> {
  const response = await apiClient.post<ChangePasswordResponse>(
    "/auth/change-password",
    credentials,
    {
      headers: {
        Authorization: `Bearer ${passwordChangeToken}`,
      },
    },
  );

  return response.data;
}

export async function forgotPassword(
  credentials: ForgotPasswordCredentials,
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    {
      email: credentials.email.trim().toLowerCase(),
    },
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
    if (error.status === 429) {
      return "Trop de tentatives. Veuillez patienter avant de réessayer.";
    }

    if (error.status === 400) {
      return "Le code de vérification est incorrect ou a expiré.";
    }
  }

  return "Impossible de vérifier le code. Veuillez réessayer.";
}