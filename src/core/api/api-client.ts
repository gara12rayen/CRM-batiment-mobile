<<<<<<< Updated upstream

=======
import axios from "axios";
>>>>>>> Stashed changes
import { env } from "@/core/config/env";
import { secureStorage } from "@/core/storage/secure-storage";

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

<<<<<<< Updated upstream
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
=======
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return Promise.reject(
          new ApiError(
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
>>>>>>> Stashed changes

    return Promise.reject(error);
  },
);