
import axios from "axios";
import { apiClient } from "@/core/api/api-client";
import type {
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/models/auth.types";

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

export function getLoginErrorStatus(error: unknown): number | null {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }

  return null;
}
