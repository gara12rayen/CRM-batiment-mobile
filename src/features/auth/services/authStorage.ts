import * as SecureStore from "expo-secure-store";
import type { SessionResponse } from "@/features/auth/models/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "sessionUser";
const PASSWORD_CHANGE_TOKEN_KEY = "passwordChangeToken";

export async function saveSession(session: SessionResponse) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));
  await SecureStore.deleteItemAsync(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getSessionUser() {
  const user = await SecureStore.getItemAsync(USER_KEY);

  return user ? JSON.parse(user) : null;
}

export async function savePasswordChangeToken(token: string) {
  await SecureStore.setItemAsync(PASSWORD_CHANGE_TOKEN_KEY, token);
}

export async function getPasswordChangeToken() {
  return SecureStore.getItemAsync(PASSWORD_CHANGE_TOKEN_KEY);
}

export async function clearPasswordChangeToken() {
  await SecureStore.deleteItemAsync(PASSWORD_CHANGE_TOKEN_KEY);
}