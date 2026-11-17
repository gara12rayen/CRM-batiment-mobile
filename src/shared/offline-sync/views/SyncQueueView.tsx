import React, { useState } from "react";
import {
  Alert,
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
import { SyncQueueBadge } from "../components/SyncQueueBadge";
import { SyncQueueItemCard } from "../components/SyncQueueItemCard";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import type { UploadStatus } from "../models/offline-sync.types";

type FilterTab = "all" | UploadStatus;

export function SyncQueueView() {
  const {
    items,
    stats,
    isOnline,
    isSimulatedOffline,
    enqueue,
    retry,
    retryAll,
    remove,
    clearDone,
    toggleSimulatedOffline,
    forceSync,
  } = useOfflineQueue();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filtrage des éléments selon l'onglet sélectionné
  const filteredItems = items.filter((it) => {
    if (activeTab === "all") return true;
    return it.status === activeTab;
  });

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Générateurs de tests pour valider les 5 sous-tâches
  const handleAddValidScan = async () => {
    const randomId = Math.floor(Math.random() * 900) + 100;
    const res = await enqueue({
      type: "scan",
      fileName: `devis_signe_DEV-2026-0${randomId}.pdf`,
      fileUri: `file:///data/scans/devis_${randomId}.pdf`,
      fileSize: 2.4 * 1024 * 1024, // 2.4 Mo
      mimeType: "application/pdf",
      endpoint: `/api/v1/devis/${randomId}/signature-papier`,
      fieldName: "fichier",
      payload: { devisId: randomId, source: "scan_mobile" },
    });

    if (res.success) {
      showFeedback(`✓ Scan devis ajouté à la file d'attente.`);
    } else {
      showFeedback(`❌ Refus : ${res.error}`);
    }
  };

  const handleAddValidPhoto = async () => {
    const randomId = Math.floor(Math.random() * 900) + 100;
    const res = await enqueue({
      type: "photo",
      fileName: `chantier_avancement_${randomId}.jpg`,
      fileUri: `file:///data/photos/photo_${randomId}.jpg`,
      fileSize: 3.2 * 1024 * 1024, // 3.2 Mo
      mimeType: "image/jpeg",
      endpoint: `/api/v1/chantiers/10/photos`,
      fieldName: "photos",
      payload: { chantierId: 10, note: "Pose carrelage" },
    });

    if (res.success) {
      showFeedback(`✓ Photo de chantier ajoutée.`);
    } else {
      showFeedback(`❌ Refus : ${res.error}`);
    }
  };

  // Test Sous-tâche 5 : Fichier trop grand
  const handleTestTooLarge = async () => {
    const res = await enqueue({
      type: "photo",
      fileName: "photo_tres_lourde.jpg",
      fileUri: "file:///data/photos/huge.jpg",
      fileSize: 35 * 1024 * 1024, // 35 Mo (limite photo = 10 Mo)
      mimeType: "image/jpeg",
      endpoint: "/api/v1/chantiers/10/photos",
    });

    if (!res.success) {
      Alert.alert("Contrôle de taille (Refus)", res.error);
    }
  };

  // Test Sous-tâche 5 : Type non autorisé
  const handleTestInvalidType = async () => {
    const res = await enqueue({
      type: "scan",
      fileName: "document_interdit.exe",
      fileUri: "file:///data/docs/doc.exe",
      fileSize: 500 * 1024,
      mimeType: "application/x-msdownload",
      endpoint: "/api/v1/fichiers",
    });

    if (!res.success) {
      Alert.alert("Contrôle de format (Refus)", res.error);
    }
  };

  // Test Sous-tâche 3 : Protection anti-doublon
  const handleTestDuplicate = async () => {
    // Premier ajout
    await enqueue({
      type: "scan",
      fileName: "devis_identique_test.pdf",
      fileUri: "file:///data/scans/test.pdf",
      fileSize: 1.5 * 1024 * 1024,
      mimeType: "application/pdf",
      endpoint: "/api/v1/devis/99/signature-papier",
      payload: { devisId: 99 },
    });

    // Deuxième ajout identique
    const duplicateRes = await enqueue({
      type: "scan",
      fileName: "devis_identique_test.pdf",
      fileUri: "file:///data/scans/test.pdf",
      fileSize: 1.5 * 1024 * 1024,
      mimeType: "application/pdf",
      endpoint: "/api/v1/devis/99/signature-papier",
      payload: { devisId: 99 },
    });

    if (duplicateRes.isDuplicate) {
      Alert.alert("Protection anti-doublon activée", duplicateRes.error);
    }
  };

  // Test Sous-tâche 2 : Simulation d'échec serveur avec retry
  const handleTestFailRetry = async () => {
    const res = await enqueue({
      type: "rapport",
      fileName: "fail_test_rapport.pdf",
      fileUri: "file:///data/rapports/fail.pdf",
      fileSize: 1.2 * 1024 * 1024,
      mimeType: "application/pdf",
      endpoint: "/api/v1/rapports",
    });

    if (res.success) {
      showFeedback("Élément configuré pour simuler des échecs et déclencher le backoff exponentiel.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.badge}>Socle Binôme 1B — #4618</Text>
          <Text style={styles.title}>Envoi Différé Hors-Ligne</Text>
          <Text style={styles.subtitle}>
            Plateforme : {Platform.OS.toUpperCase()}
          </Text>
        </View>

        {/* Panneau de connectivité Réseau + Simulation */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.flex1}>
              <View style={styles.networkStatusRow}>
                <View
                  style={[
                    styles.networkDot,
                    isOnline ? styles.dotOnline : styles.dotOffline,
                  ]}
                />
                <Text style={styles.networkStatusText}>
                  {isOnline ? "Réseau connecté (En ligne)" : "Hors-ligne (Sans réseau)"}
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                {isOnline
                  ? "Les fichiers sont transmis automatiquement au serveur."
                  : "Les envois sont conservés localement et partiront dès le retour du réseau."}
              </Text>
            </View>

            <View style={styles.switchCol}>
              <Text style={styles.switchLabel}>Simuler hors-ligne</Text>
              <Switch
                value={isSimulatedOffline}
                onValueChange={toggleSimulatedOffline}
                trackColor={{ false: colors.border, true: "#EF4444" }}
              />
            </View>
          </View>
        </View>

        {/* Indicateur global CDC Page 3 : « X envois en attente » */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>État de la file</Text>
            <SyncQueueBadge showZero />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.uploading}</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: "#DC2626" }]}>
                {stats.error}
              </Text>
              <Text style={styles.statLabel}>En erreur</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: "#15803D" }]}>
                {stats.success}
              </Text>
              <Text style={styles.statLabel}>Transmis</Text>
            </View>
          </View>

          {/* Boutons d'action globale */}
          <View style={styles.globalActionsRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => void forceSync()}
              disabled={!isOnline}
              style={({ pressed }) => [
                styles.primaryActionBtn,
                pressed && styles.pressed,
                !isOnline && styles.disabled,
              ]}
            >
              <Text style={styles.primaryActionBtnText}>⚡ Synchroniser maintenant</Text>
            </Pressable>

            {stats.error > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => void retryAll()}
                style={({ pressed }) => [styles.retryAllBtn, pressed && styles.pressed]}
              >
                <Text style={styles.retryAllBtnText}>🔄 Relancer les erreurs ({stats.error})</Text>
              </Pressable>
            )}

            {stats.success > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => void clearDone()}
                style={({ pressed }) => [styles.clearDoneBtn, pressed && styles.pressed]}
              >
                <Text style={styles.clearDoneBtnText}>Nettoyer terminés</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Message de feedback temporaire */}
        {feedbackMessage && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {/* Panneau de test des spécifications CDC */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Boutons de test rapide</Text>
          <Text style={styles.cardDesc}>
            Cliquez pour simuler les différents scénarios prévus au CDC :
          </Text>

          <View style={styles.testButtonsGrid}>
            <Pressable
              onPress={handleAddValidScan}
              style={[styles.testBtn, styles.testBtnValid]}
            >
              <Text style={styles.testBtnText}>+ Scan PDF (2.4 Mo)</Text>
            </Pressable>

            <Pressable
              onPress={handleAddValidPhoto}
              style={[styles.testBtn, styles.testBtnValid]}
            >
              <Text style={styles.testBtnText}>+ Photo Chantier (3.2 Mo)</Text>
            </Pressable>

            <Pressable
              onPress={handleTestTooLarge}
              style={[styles.testBtn, styles.testBtnReject]}
            >
              <Text style={styles.testBtnText}>Test refus : Trop grand (35 Mo)</Text>
            </Pressable>

            <Pressable
              onPress={handleTestInvalidType}
              style={[styles.testBtn, styles.testBtnReject]}
            >
              <Text style={styles.testBtnText}>Test refus : Format interdit (.exe)</Text>
            </Pressable>

            <Pressable
              onPress={handleTestDuplicate}
              style={[styles.testBtn, styles.testBtnWarning]}
            >
              <Text style={styles.testBtnText}>Test anti-doublon (Checksum)</Text>
            </Pressable>

            <Pressable
              onPress={handleTestFailRetry}
              style={[styles.testBtn, styles.testBtnWarning]}
            >
              <Text style={styles.testBtnText}>Test échec & backoff exponentiel</Text>
            </Pressable>
          </View>
        </View>

        {/* Onglets de filtrage */}
        <View style={styles.filterTabsRow}>
          <FilterTabButton
            label={`Tous (${stats.total})`}
            active={activeTab === "all"}
            onPress={() => setActiveTab("all")}
          />
          <FilterTabButton
            label={`En attente (${stats.pending})`}
            active={activeTab === "pending"}
            onPress={() => setActiveTab("pending")}
          />
          <FilterTabButton
            label={`Erreurs (${stats.error})`}
            active={activeTab === "error"}
            onPress={() => setActiveTab("error")}
          />
          <FilterTabButton
            label={`Transmis (${stats.success})`}
            active={activeTab === "success"}
            onPress={() => setActiveTab("success")}
          />
        </View>

        {/* Liste des envois */}
        <View style={styles.listContainer}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Aucun envoi dans cette catégorie</Text>
              <Text style={styles.emptyDesc}>
                Utilisez les boutons ci-dessus pour ajouter des photos ou scans en attente.
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <SyncQueueItemCard
                key={item.id}
                item={item}
                onRetry={retry}
                onDelete={remove}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterTabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex1: {
    flex: 1,
  },
  networkStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  networkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotOnline: {
    backgroundColor: "#16A34A",
  },
  dotOffline: {
    backgroundColor: "#DC2626",
  },
  networkStatusText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  switchCol: {
    alignItems: "center",
    gap: 2,
  },
  switchLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: spacing.md,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  globalActionsRow: {
    gap: spacing.xs,
  },
  primaryActionBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  retryAllBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  retryAllBtnText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  clearDoneBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  clearDoneBtnText: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 13,
  },
  testButtonsGrid: {
    gap: spacing.xs,
  },
  testBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  testBtnValid: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  testBtnReject: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  testBtnWarning: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  feedbackBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    padding: spacing.sm,
  },
  feedbackText: {
    color: "#1E40AF",
    fontSize: 13,
    fontWeight: "600",
  },
  filterTabsRow: {
    flexDirection: "row",
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContainer: {
    gap: spacing.sm,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: spacing.xs,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
