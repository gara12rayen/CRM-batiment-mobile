import React, { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { BoutonAppeler } from "../components/BoutonAppeler";
import { BoutonItineraire } from "../components/BoutonItineraire";
import { LocationDeniedNotice } from "../components/LocationDeniedNotice";
import { useUserLocation } from "../hooks/useUserLocation";
import { locationService } from "../services/locationService";

export function LocationContactTestView() {
  const {
    location,
    isLoading,
    error,
    isPermissionDenied,
    getLocation,
    openSettings,
  } = useUserLocation();

  const [isMockMode, setIsMockMode] = useState(locationService.getIsMockMode());
  const [showSimulatedDenial, setShowSimulatedDenial] = useState(false);

  // Valeurs de test éditables
  const [testPhone, setTestPhone] = useState("06 12 34 56 78");
  const [testContact, setTestContact] = useState("M. Jean Dupont (Client)");
  const [testAddress, setTestAddress] = useState(
    "10 Rue de la Paix, 75002 Paris",
  );

  const toggleMock = (value: boolean) => {
    setIsMockMode(value);
    locationService.setMockMode(value);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.badge}>Socle Binôme 1B — Tâche 2</Text>
          <Text style={styles.title}>Localisation & Contact</Text>
          <Text style={styles.subtitle}>
            Plateforme : {Platform.OS.toUpperCase()}
          </Text>
        </View>

        {/* Panneau Mode Simulation (Version d'essai CDC) */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.flex1}>
              <Text style={styles.cardTitle}>Mode Simulation (Test)</Text>
              <Text style={styles.cardDesc}>
                Permet aux autres binômes de tester sans capteur GPS physique.
              </Text>
            </View>
            <Switch
              value={isMockMode}
              onValueChange={toggleMock}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* SECTION 1 : Récupération de la position GPS */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>1. Récupération de la Position GPS</Text>
          <Text style={styles.cardDesc}>
            Capture les coordonnées GPS pour certifier les devis, chantiers et rapports.
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={() => void getLocation()}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              isLoading && styles.disabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Capture GPS en cours..." : "📍 Capturer ma position GPS"}
            </Text>
          </Pressable>

          {location && (
            <View style={styles.locationResult}>
              <View style={styles.badgeRow}>
                <Text style={styles.successBadge}>✓ Position acquise</Text>
                {location.isSimulated && (
                  <Text style={styles.simulatedBadge}>Simulée</Text>
                )}
              </View>

              <Text style={styles.coordText}>
                Latitude : <Text style={styles.bold}>{location.latitude.toFixed(6)}</Text>
              </Text>
              <Text style={styles.coordText}>
                Longitude : <Text style={styles.bold}>{location.longitude.toFixed(6)}</Text>
              </Text>
              {location.accuracy && (
                <Text style={styles.coordText}>
                  Précision : <Text style={styles.bold}>± {Math.round(location.accuracy)} m</Text>
                </Text>
              )}
              <Text style={styles.coordText}>
                Horodatage :{" "}
                <Text style={styles.bold}>
                  {new Date(location.timestamp).toLocaleTimeString("fr-FR")}
                </Text>
              </Text>
              {location.formattedAddress && (
                <Text style={styles.coordText}>
                  Adresse : <Text style={styles.bold}>{location.formattedAddress}</Text>
                </Text>
              )}
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Erreur de capture :</Text>
              <Text style={styles.errorText}>{error.userMessage}</Text>
            </View>
          )}

          {(isPermissionDenied || showSimulatedDenial) && (
            <LocationDeniedNotice
              customMessage="La localisation a été refusée. Activez-la pour enregistrer la position de vos devis et chantiers."
              onRetry={() => {
                setShowSimulatedDenial(false);
                void getLocation();
              }}
            />
          )}

          <Pressable
            onPress={() => setShowSimulatedDenial((v) => !v)}
            style={styles.toggleDenialBtn}
          >
            <Text style={styles.toggleDenialText}>
              {showSimulatedDenial
                ? "Masquer l'écran d'explication de refus"
                : "Afficher l'écran d'explication en cas de refus"}
            </Text>
          </Pressable>
        </View>

        {/* SECTION 2 : Bouton réutilisable 'Appeler' */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>2. Bouton réutilisable 'Appeler'</Text>
          <Text style={styles.cardDesc}>
            Ouvre le composeur téléphonique avec confirmation de sécurité.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Numéro à tester :</Text>
            <TextInput
              value={testPhone}
              onChangeText={setTestPhone}
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="06 12 34 56 78"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom du contact :</Text>
            <TextInput
              value={testContact}
              onChangeText={setTestContact}
              style={styles.input}
              placeholder="Nom du client"
            />
          </View>

          <Text style={styles.subSectionTitle}>Variantes du composant :</Text>

          {/* Bouton Primary */}
          <View style={styles.btnRow}>
            <BoutonAppeler
              phoneNumber={testPhone}
              contactName={testContact}
              variant="primary"
              size="md"
            />
          </View>

          {/* Bouton Outline + IconOnly */}
          <View style={styles.btnRowDual}>
            <View style={styles.flex1}>
              <BoutonAppeler
                phoneNumber={testPhone}
                label="Appeler client"
                variant="outline"
                size="sm"
              />
            </View>
            <BoutonAppeler
              phoneNumber={testPhone}
              variant="iconOnly"
              size="md"
            />
          </View>
        </View>

        {/* SECTION 3 : Bouton réutilisable 'Itinéraire' */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>3. Bouton réutilisable 'Itinéraire'</Text>
          <Text style={styles.cardDesc}>
            Ouvre Google Maps (Android/Web) ou Apple Maps (iOS).
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse de destination :</Text>
            <TextInput
              value={testAddress}
              onChangeText={setTestAddress}
              style={styles.input}
              placeholder="Adresse du chantier"
            />
          </View>

          <Text style={styles.subSectionTitle}>Variantes du composant :</Text>

          {/* Bouton Itinéraire par adresse */}
          <View style={styles.btnRow}>
            <BoutonItineraire
              address={testAddress}
              destinationLabel="Chantier Démo"
              label="Itinéraire vers le chantier"
              variant="primary"
              size="md"
            />
          </View>

          {/* Bouton Itinéraire par coordonnées directes */}
          <View style={styles.btnRowDual}>
            <View style={styles.flex1}>
              <BoutonItineraire
                coordinates={{ latitude: 48.8566, longitude: 2.3522 }}
                destinationLabel="Chantier Paris Centre"
                label="Via GPS direct"
                variant="outline"
                size="sm"
              />
            </View>
            <BoutonItineraire
              address={testAddress}
              variant="iconOnly"
              size="md"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.xs,
  },
  badge: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginTop: spacing.xs,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex1: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
  locationResult: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    padding: spacing.md,
    gap: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  successBadge: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 13,
  },
  simulatedBadge: {
    backgroundColor: "#E0E7FF",
    color: "#3730A3",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coordText: {
    fontSize: 13,
    color: "#166534",
  },
  bold: {
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    padding: spacing.md,
  },
  errorTitle: {
    color: "#991B1B",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
  },
  toggleDenialBtn: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  toggleDenialText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  btnRow: {
    marginTop: 2,
  },
  btnRowDual: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
});
