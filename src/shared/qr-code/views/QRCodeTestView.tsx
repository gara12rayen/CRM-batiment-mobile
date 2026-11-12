import React, { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { QRCodeScanner } from "../components/QRCodeScanner";
import type { DevisQRData } from "../models/qr-code.types";

/**
 * Écran de test interactif pour le module QR Code — Socle Binôme 1B.
 * Simule un écran appelant (ex: Binôme 4B) qui intègre <QRCodeScanner />.
 */
export function QRCodeTestView() {
  const [usePermissionGate, setUsePermissionGate] = useState(false);
  const [lastScannedDevis, setLastScannedDevis] = useState<DevisQRData | null>(
    null,
  );
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  const handleResetDemo = () => {
    setLastScannedDevis(null);
    setFallbackTriggered(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.badge}>Socle Binôme 1B — Tâche 3</Text>
          <Text style={styles.title}>Lecture QR Code Devis</Text>
          <Text style={styles.subtitle}>
            Plateforme : {Platform.OS.toUpperCase()}
          </Text>
        </View>

        {/* Contrôle PermissionGate */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.flex1}>
              <Text style={styles.cardTitle}>Tester avec PermissionGate</Text>
              <Text style={styles.cardDesc}>
                Vérifie la permission caméra avant d'afficher le lecteur QR
              </Text>
            </View>
            <Switch
              value={usePermissionGate}
              onValueChange={setUsePermissionGate}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Retour vers l'écran appelant */}
        {lastScannedDevis && (
          <View style={styles.callerSuccessCard}>
            <Text style={styles.callerSuccessTitle}>
              ✓ Reçu par l'écran appelant (onDevisScanned)
            </Text>
            <Text style={styles.callerDetail}>
              Référence : {lastScannedDevis.reference} | Version : v
              {lastScannedDevis.version}
              {lastScannedDevis.securityCode
                ? ` | Code : ${lastScannedDevis.securityCode}`
                : ""}
            </Text>
            <Pressable onPress={handleResetDemo} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Réinitialiser</Text>
            </Pressable>
          </View>
        )}

        {fallbackTriggered && (
          <View style={styles.callerFallbackCard}>
            <Text style={styles.callerFallbackTitle}>
              🔍 Écran appelant prévenu (onFallback)
            </Text>
            <Text style={styles.callerFallbackDesc}>
              L'utilisateur a cliqué sur « QR code illisible ? ». L'écran
              appelant peut maintenant afficher la recherche manuelle de devis.
            </Text>
            <Pressable onPress={handleResetDemo} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Revenir au scanner</Text>
            </Pressable>
          </View>
        )}

        {/* Composant réutilisable QRCodeScanner */}
        {!fallbackTriggered && (
          <View style={styles.card}>
            <QRCodeScanner
              skipPermissionGate={!usePermissionGate}
              mockMode={true}
              onDevisScanned={(data) => {
                setLastScannedDevis(data);
                setFallbackTriggered(false);
              }}
              onFallback={() => {
                setFallbackTriggered(true);
                setLastScannedDevis(null);
              }}
            />
          </View>
        )}

        {/* Guide d'intégration pour les autres binômes */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            Intégration pour les autres binômes (Socle)
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>
              {`import { QRCodeScanner } from "@/shared/qr-code";

<QRCodeScanner
  onDevisScanned={(devis) => {
    // devis.reference -> "DEV-2026-0042"
    // devis.version   -> 1
  }}
  onFallback={() => {
    // Ouvrir la recherche manuelle
  }}
/>`}
            </Text>
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
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex1: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  callerSuccessCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#6EE7B7",
    gap: 6,
  },
  callerSuccessTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
  callerDetail: {
    fontSize: 13,
    color: "#047857",
    fontWeight: "600",
  },
  callerFallbackCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#FCD34D",
    gap: 6,
  },
  callerFallbackTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
  },
  callerFallbackDesc: {
    fontSize: 13,
    color: "#B45309",
    lineHeight: 18,
  },
  clearBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginTop: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  codeBox: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: spacing.md,
  },
  codeText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 17,
  },
});
