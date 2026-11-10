import type { SessionResponse } from "@/features/auth/models/auth.types";
import { secureStorage } from "@/core/storage/secure-storage";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "sessionUser";
const PASSWORD_CHANGE_TOKEN_KEY = "passwordChangeToken";

export async function saveSession(session: SessionResponse) {
  await Promise.all([
    secureStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken),
    secureStorage.setItem(USER_KEY, JSON.stringify(session.user)),
    secureStorage.deleteItem(PASSWORD_CHANGE_TOKEN_KEY),
  ]);
}

export async function getAccessToken() {
  return secureStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getSessionUser() {
  const user = await secureStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    await clearSession();
    return null;
  }
}

export async function updateStoredUser(user: SessionResponse["user"]) {
  await secureStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function savePasswordChangeToken(token: string) {
  await secureStorage.setItem(PASSWORD_CHANGE_TOKEN_KEY, token);
}

export async function getPasswordChangeToken() {
  return secureStorage.getItem(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function clearPasswordChangeToken() {
  await secureStorage.deleteItem(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function clearSession() {
  await Promise.all([
    secureStorage.deleteItem(ACCESS_TOKEN_KEY),
    secureStorage.deleteItem(USER_KEY),
    clearPasswordChangeToken(),
  ]);
}