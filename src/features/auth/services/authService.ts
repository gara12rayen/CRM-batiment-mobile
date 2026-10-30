
import axios from "axios";
import { apiClient } from "@/core/api/api-client";
import type {
  LoginCredentials,
  LoginResponse,
   ChangePasswordCredentials,
  ChangePasswordResponse,
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
