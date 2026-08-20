import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Point this at your running server. In Expo Go on a physical device, "localhost" refers
// to the phone itself, so during development use your machine's LAN IP instead.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({ baseURL: `${API_BASE_URL}/api` });

const TOKEN_KEY = "feestdagenlijstje.token";

export async function setStoredToken(token: string | null) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.error) return err.response.data.error;
  return "Er ging iets mis. Probeer het opnieuw.";
}
