import { useState } from "react";
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
import { typography } from "@/core/theme/typography";
import { PermissionDeniedView } from "../components/PermissionDeniedView";
import { PermissionRationaleModal } from "../components/PermissionRationaleModal";
import { useDevicePermission } from "../hooks/useDevicePermission";
import type { PermissionStatus, PermissionType } from "../models/permission.types";
import { PERMISSION_DESCRIPTIONS } from "../services/permission-descriptions";
import { permissionsService } from "../services/permissionsService";

const PERMISSION_TYPES: PermissionType[] = [
  "camera",
  "microphone",
  "location",
  "notifications",
];

export function PermissionsTestView() {
  const [isMockMode, setIsMockMode] = useState<boolean>(
    permissionsService.getIsMockMode(),
  );
  const [activeTestType, setActiveTestType] = useState<PermissionType | null>(
    null,
  );
  const [showDeniedPreview, setShowDeniedPreview] = useState<PermissionType | null>(
    null,
  );

  const toggleMockMode = (value: boolean) => {
    setIsMockMode(value);
    permissionsService.setMockMode(value);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.badge}>Socle Binôme 1B</Text>
          <Text style={styles.title}>Gestion des Autorisations</Text>
          <Text style={styles.subtitle}>
            Plateforme détectée : {Platform.OS.toUpperCase()}
          </Text>
        </View>

        {/* Panneau de contrôle Mode Simulation / Test */}
        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View>
              <Text style={styles.controlTitle}>Mode Simulation (Test)</Text>
              <Text style={styles.controlDesc}>
                Permet de tester tous les états (Accord, Refus, Blocage)
              </Text>
            </View>
            <Switch
              value={isMockMode}
              onValueChange={toggleMockMode}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Liste des 4 autorisations */}
        <Text style={styles.sectionTitle}>{"Autorisations de l'appareil"}</Text>

        {PERMISSION_TYPES.map((type) => (
          <PermissionCard
            key={type}
            type={type}
            isMockMode={isMockMode}
            onOpenRationale={() => setActiveTestType(type)}
            onPreviewDenied={() => setShowDeniedPreview(type)}
          />
        ))}

        {/* Aperçu interactif de l'écran Refus */}
        {showDeniedPreview && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>
              Aperçu : Écran « Autorisation refusée » ({showDeniedPreview})
            </Text>
            <PermissionDeniedView
              type={showDeniedPreview}
              onCancel={() => setShowDeniedPreview(null)}
              onRetry={() => setShowDeniedPreview(null)}
            />
          </View>
        )}

        {/* Modal d'explication progressive */}
        {activeTestType && (
          <PermissionRationaleModal
            visible={activeTestType !== null}
            type={activeTestType}
            contextReason={`Exemple de contexte d'usage Bâtiment pour ${activeTestType}.`}
            onConfirm={async () => {
              await permissionsService.requestPermission(activeTestType);
              setActiveTestType(null);
            }}
            onCancel={() => setActiveTestType(null)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PermissionCard({
  type,
  isMockMode,
  onOpenRationale,
  onPreviewDenied,
}: {
  type: PermissionType;
  isMockMode: boolean;
  onOpenRationale: () => void;
  onPreviewDenied: () => void;
}) {
  const { status, checkStatus, openSettings } = useDevicePermission(type);
  const config = PERMISSION_DESCRIPTIONS[type];

  const setSimulatedStatus = async (newStatus: PermissionStatus) => {
    permissionsService.setMockStatus(type, newStatus);
    await checkStatus();
  };

  const getStatusBadgeStyle = () => {
    switch (status) {
      case "granted":
        return styles.badgeGranted;
      case "denied":
        return styles.badgeDenied;
      case "blocked":
        return styles.badgeBlocked;
      default:
        return styles.badgeUndetermined;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "granted":
        return "Accordé";
      case "denied":
        return "Refusé";
      case "blocked":
        return "Bloqué (Réglages requis)";
      default:
        return "Non demandé";
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{config.title}</Text>
          <Text style={styles.cardShortTitle}>{config.shortTitle}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle()]}>
          <Text style={styles.statusBadgeText}>{getStatusLabel()}</Text>
        </View>
      </View>

      <Text style={styles.cardRationale}>{config.rationale}</Text>

      {/* Boutons d'action standards */}
      <View style={styles.cardActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenRationale}
          style={styles.actionBtnPrimary}
        >
          <Text style={styles.actionBtnPrimaryText}>
            Tester la demande progressive
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onPreviewDenied}
          style={styles.actionBtnSecondary}
        >
          <Text style={styles.actionBtnSecondaryText}>
            Voir écran « Refus »
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={openSettings}
          style={styles.actionBtnOutline}
        >
          <Text style={styles.actionBtnOutlineText}>Ouvrir les réglages</Text>
        </Pressable>
      </View>

      {/* Commandes rapides en mode simulation */}
      {isMockMode && (
        <View style={styles.mockButtonsRow}>
          <Text style={styles.mockLabel}>Simuler :</Text>
          <Pressable
            onPress={() => setSimulatedStatus("granted")}
            style={styles.mockBtn}
          >
            <Text style={styles.mockBtnText}>Accorder</Text>
          </Pressable>
          <Pressable
            onPress={() => setSimulatedStatus("denied")}
            style={styles.mockBtn}
          >
            <Text style={styles.mockBtnText}>Refuser</Text>
          </Pressable>
          <Pressable
            onPress={() => setSimulatedStatus("blocked")}
            style={styles.mockBtn}
          >
            <Text style={styles.mockBtnText}>Bloquer</Text>
          </Pressable>
          <Pressable
            onPress={() => setSimulatedStatus("undetermined")}
            style={styles.mockBtn}
          >
            <Text style={styles.mockBtnText}>Reset</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  controlCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  controlHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.text,
  },
  controlDesc: {
    ...typography.caption,
    color: colors.muted,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.text,
  },
  cardShortTitle: {
    ...typography.caption,
    color: colors.muted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeGranted: {
    backgroundColor: "#DCFCE7",
  },
  badgeDenied: {
    backgroundColor: "#FEF9C3",
  },
  badgeBlocked: {
    backgroundColor: "#FEE2E2",
  },
  badgeUndetermined: {
    backgroundColor: "#F3F4F6",
  },
  cardRationale: {
    ...typography.caption,
    color: colors.muted,
    marginVertical: spacing.sm,
    lineHeight: 18,
  },
  cardActions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  actionBtnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtnSecondary: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  actionBtnSecondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  actionBtnOutlineText: {
    color: colors.muted,
    fontSize: 13,
  },
  mockButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  mockLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
  },
  mockBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mockBtnText: {
    fontSize: 12,
    color: colors.text,
  },
  previewBox: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.sm,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewTitle: {
    ...typography.subtitle,
    fontSize: 15,
    marginBottom: spacing.sm,
    textAlign: "center",
    color: colors.text,
  },
});
