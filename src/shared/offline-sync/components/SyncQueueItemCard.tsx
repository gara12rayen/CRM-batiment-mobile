import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { QueueItem, UploadFileType, UploadStatus } from "../models/offline-sync.types";
import { formatBytes } from "../services/fileValidator";

interface SyncQueueItemCardProps {
  item: QueueItem;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_ICONS: Record<UploadFileType, string> = {
  photo: "📷",
  scan: "📄",
  rapport: "📝",
  signature: "✍️",
  audio: "🎙️",
};

const TYPE_LABELS: Record<UploadFileType, string> = {
  photo: "Photo",
  scan: "Scan PDF",
  rapport: "Rapport",
  signature: "Signature",
  audio: "Audio",
};

export function SyncQueueItemCard({
  item,
  onRetry,
  onDelete,
}: SyncQueueItemCardProps) {
  const isUploading = item.status === "uploading";
  const isError = item.status === "error";
  const isPending = item.status === "pending";
  const isSuccess = item.status === "success";

  return (
    <View style={[styles.card, isError && styles.cardError, isSuccess && styles.cardSuccess]}>
      {/* Ligne principale : Icône + Nom du fichier + Statut */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.typeIcon}>{TYPE_ICONS[item.type] || "📁"}</Text>
        </View>

        <View style={styles.fileInfo}>
          <Text numberOfLines={1} style={styles.fileName}>
            {item.fileName}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaBadge}>{TYPE_LABELS[item.type]}</Text>
            <Text style={styles.metaText}>{formatBytes(item.fileSize)}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>
              {new Date(item.createdAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Badge de statut */}
        <StatusBadge status={item.status} attempts={item.attempts} maxAttempts={item.maxAttempts} />
      </View>

      {/* Endpoint cible */}
      <Text style={styles.endpointText}>
        Destination : <Text style={styles.endpointPath}>{item.endpoint}</Text>
      </Text>

      {/* Message d'erreur et tentatives */}
      {item.lastError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{item.lastError}</Text>
        </View>
      )}

      {/* Barre d'actions */}
      <View style={styles.actionsRow}>
        <Text style={styles.checksumText}>
          Checksum : {item.checksum.substring(0, 8)}...
        </Text>

        <View style={styles.buttonGroup}>
          {(isError || isPending) && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Réessayer cet envoi"
              onPress={() => onRetry(item.id)}
              disabled={isUploading}
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && styles.pressed,
                isUploading && styles.disabled,
              ]}
            >
              <Text style={styles.retryBtnText}>🔄 Réessayer</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Supprimer de la file"
            onPress={() => onDelete(item.id)}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
          >
            <Text style={styles.deleteBtnText}>Supprimer</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function StatusBadge({
  status,
  attempts,
  maxAttempts,
}: {
  status: UploadStatus;
  attempts: number;
  maxAttempts: number;
}) {
  switch (status) {
    case "uploading":
      return (
        <View style={[styles.statusBadge, styles.badgeUploading]}>
          <ActivityIndicator size="small" color="#1D4ED8" style={styles.badgeSpinner} />
          <Text style={styles.badgeTextUploading}>En cours...</Text>
        </View>
      );
    case "success":
      return (
        <View style={[styles.statusBadge, styles.badgeSuccess]}>
          <Text style={styles.badgeTextSuccess}>✓ Envoyé</Text>
        </View>
      );
    case "error":
      return (
        <View style={[styles.statusBadge, styles.badgeError]}>
          <Text style={styles.badgeTextError}>
            Échec ({attempts}/{maxAttempts})
          </Text>
        </View>
      );
    case "pending":
    default:
      return (
        <View style={[styles.statusBadge, styles.badgePending]}>
          <Text style={styles.badgeTextPending}>En attente</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: spacing.xs,
  },
  cardError: {
    borderColor: "#FECACA",
    backgroundColor: "#FFFBFB",
  },
  cardSuccess: {
    borderColor: "#BBF7D0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  typeIcon: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  metaBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.muted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeSpinner: {
    transform: [{ scale: 0.7 }],
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
  },
  badgeTextPending: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309",
  },
  badgeUploading: {
    backgroundColor: "#DBEAFE",
  },
  badgeTextUploading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  badgeSuccess: {
    backgroundColor: "#DCFCE7",
  },
  badgeTextSuccess: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
  },
  badgeError: {
    backgroundColor: "#FEE2E2",
  },
  badgeTextError: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
  },
  endpointText: {
    fontSize: 12,
    color: colors.muted,
  },
  endpointPath: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: colors.text,
    fontSize: 11,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
    padding: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    fontSize: 11,
    color: "#B91C1C",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  checksumText: {
    fontSize: 10,
    color: colors.muted,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  retryBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  deleteBtnText: {
    fontSize: 12,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
