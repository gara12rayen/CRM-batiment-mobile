
import { env } from "@/core/config/env";
import { secureStorage } from "@/core/storage/secure-storage";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  if (!env.apiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL n'est pas configurée.");
  }

  // Préparer les en-têtes de la requête.
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  // Ajouter le token de la session si l'utilisateur est connecté.
  const token = await secureStorage.getItem("accessToken");

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(new URL(endpoint, env.apiUrl), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(
      `La requête API a échoué (${response.status}).`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
