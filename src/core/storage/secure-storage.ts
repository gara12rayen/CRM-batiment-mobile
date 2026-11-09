import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Session storage.
 * - Phone (Android / iOS): expo-secure-store (encrypted).
 * - Web (npm run web, for testing only): expo-secure-store does not exist in a browser,
 *   so the browser's localStorage is used instead.
 */
const isWeb = Platform.OS === "web";

function webStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const secureStorage = {
  getItem: async (key: string): Promise<string | null> =>
    isWeb ? (webStorage()?.getItem(key) ?? null) : SecureStore.getItemAsync(key),

  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      webStorage()?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  deleteItem: async (key: string): Promise<void> => {
    if (isWeb) {
      webStorage()?.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
