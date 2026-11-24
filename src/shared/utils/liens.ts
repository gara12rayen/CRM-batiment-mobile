import { Linking, Platform } from "react-native";

/**
 * Open the phone apps (call, map). Real on iPhone, Android and the web: no extra package.
 * (The socle module of the team has the same buttons with a permission screen; these two
 * functions are enough for the job site sheet.)
 */
export function appeler(telephone: string) {
  void Linking.openURL(`tel:${telephone.replace(/[^\d+]/g, "")}`);
}

/** Directions to an address: Plans on iPhone, Google Maps elsewhere. */
export function itineraire(adresse: string) {
  const q = encodeURIComponent(adresse);
  const url = Platform.OS === "ios" ? `maps:?daddr=${q}` : Platform.OS === "android" ? `geo:0,0?q=${q}` : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  Linking.openURL(url).catch(() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`));
}
