
import * as SecureStore from "expo-secure-store";
import type {
  SessionResponse,
  SessionUser,
} from "@/features/auth/models/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "sessionUser";
const PASSWORD_CHANGE_TOKEN_KEY = "passwordChangeToken";

export async function saveSession(session: SessionResponse) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));
  await SecureStore.deleteItemAsync(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await SecureStore.getItemAsync(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user) as SessionUser;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  await SecureStore.deleteItemAsync(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function savePasswordChangeToken(token: string) {
  await SecureStore.setItemAsync(PASSWORD_CHANGE_TOKEN_KEY, token);
}

export async function getPasswordChangeToken(): Promise<string | null> {
  return SecureStore.getItemAsync(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function clearPasswordChangeToken() {
  await SecureStore.deleteItemAsync(PASSWORD_CHANGE_TOKEN_KEY);
}
