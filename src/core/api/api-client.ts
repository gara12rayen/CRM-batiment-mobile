
import axios from "axios";
import { env } from "@/core/config/env";
import { getAccessToken } from "@/features/auth/services/authStorage";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Ajouter automatiquement le token JWT aux requêtes protégées.
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/** The API answers errors as { message } with a French message ready to show. */
function messageApi(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const { message } = data as { message?: unknown };
  if (Array.isArray(message)) return message.filter((m) => typeof m === "string").join("\n");
  return typeof message === "string" ? message : undefined;
}

// Centraliser la gestion des erreurs API.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return Promise.reject(
          new ApiError(
            messageApi(error.response.data) ??
              `La requête API a échoué (${error.response.status}).`,
            error.response.status,
          ),
        );
      }

      if (error.request) {
        return Promise.reject(
          new ApiError(
            "Impossible de contacter le serveur. Vérifiez votre connexion.",
            0,
          ),
        );
      }
    }

    return Promise.reject(error);
  },
);

/** Message to show to the user for any error. */
export function getErrorMessage(error: unknown, fallback = "Une erreur est survenue. Veuillez réessayer."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

// Fonction générique pour récupérer directement les données de l'API.
export async function apiRequest<T>(url: string): Promise<T> {
  const response = await apiClient.get<T>(url);
  return response.data;
}
