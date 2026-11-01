import { env } from "@/core/config/env";

if (!env.apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is missing. Please configure your .env file.",
  );
}

export const API_BASE_URL = env.apiUrl.replace(/\/+$/, "");