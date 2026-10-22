const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const env = {
  apiUrl: apiUrl || undefined,
};
