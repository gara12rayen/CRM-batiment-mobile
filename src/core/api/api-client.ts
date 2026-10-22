import { env } from "@/core/config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
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

  const response = await fetch(new URL(endpoint, env.apiUrl), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(`La requête API a échoué (${response.status}).`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
