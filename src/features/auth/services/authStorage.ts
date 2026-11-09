
import { secureStorage } from "@/core/storage/secure-storage";
import type {
  SessionResponse,
  SessionUser,
} from "@/features/auth/models/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "sessionUser";
const PASSWORD_CHANGE_TOKEN_KEY = "passwordChangeToken";

export async function saveSession(session: SessionResponse) {
  await secureStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  await secureStorage.setItem(USER_KEY, JSON.stringify(session.user));
  await secureStorage.deleteItem(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  return secureStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await secureStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user) as SessionUser;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await secureStorage.deleteItem(ACCESS_TOKEN_KEY);
  await secureStorage.deleteItem(USER_KEY);
  await secureStorage.deleteItem(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function savePasswordChangeToken(token: string) {
  await secureStorage.setItem(PASSWORD_CHANGE_TOKEN_KEY, token);
}

export async function getPasswordChangeToken(): Promise<string | null> {
  return secureStorage.getItem(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function clearPasswordChangeToken() {
  await secureStorage.deleteItem(PASSWORD_CHANGE_TOKEN_KEY);
}
