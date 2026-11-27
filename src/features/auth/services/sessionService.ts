import { ApiError } from "@/core/api/api-client";
import type { SessionUser } from "@/features/auth/models/auth.types";
import { getCurrentUser } from "@/features/auth/services/authService";
import {
  clearSession,
  getAccessToken,
  getSessionUser,
  saveSession,
} from "@/features/auth/services/authStorage";

type SessionCheckResult =
  | { authenticated: true; user: SessionUser }
  | { authenticated: false };

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return true;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return typeof decoded.exp !== "number" || decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export async function restoreSession(): Promise<SessionCheckResult> {
  const token = await getAccessToken();
  const cachedUser = await getSessionUser();

  if (!token || !cachedUser || isTokenExpired(token)) {
    await clearSession();
    return { authenticated: false };
  }

  try {
    const user = await getCurrentUser();
    await saveSession({ accessToken: token, user });
    return { authenticated: true, user };
  } catch (error) {
    if (error instanceof ApiError) {
      await clearSession();
      return { authenticated: false };
    }

    await clearSession();
    return { authenticated: false };
  }
}
