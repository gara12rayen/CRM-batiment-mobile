import axios from "axios";
import { env } from "@/core/config/env";
import { secureStorage } from "@/core/storage/secure-storage";
import { clearSession } from "@/features/auth/services/authStorage";
import { notifySessionExpired } from "@/features/auth/services/sessionEvents";

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

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          void clearSession();
          notifySessionExpired();
        }

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

    return Promise.reject(error);
  },
);
