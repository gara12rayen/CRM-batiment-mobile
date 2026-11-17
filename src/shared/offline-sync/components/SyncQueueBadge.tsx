import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { useOfflineQueue } from "../hooks/useOfflineQueue";

interface SyncQueueBadgeProps {
  onPress?: () => void;
  showZero?: boolean;
}

/**
 * Indicateur compact « X envois en attente » conforme au CDC Page 3.
 * Utilisable dans l'en-tête de l'application ou sur un onglet.
 */
export function SyncQueueBadge({ onPress, showZero = false }: SyncQueueBadgeProps) {
  const { stats, isOnline } = useOfflineQueue();
  const waitingCount = stats.pending + stats.uploading + stats.error;

  if (waitingCount === 0 && !showZero) {
    return null;
  }

  const isUploading = stats.uploading > 0;
  const hasErrors = stats.error > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${waitingCount} envois en attente`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.badgeContainer,
        hasErrors
          ? styles.badgeError
          : isUploading
            ? styles.badgeUploading
            : styles.badgePending,
        pressed && styles.pressed,
      ]}
    >
      {isUploading ? (
        <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
      ) : (
        <Text style={styles.icon}>{hasErrors ? "⚠️" : !isOnline ? "⚡" : "📤"}</Text>
      )}

      <Text style={styles.badgeText}>
        {waitingCount}{" "}
        {waitingCount > 1 ? "envois en attente" : "envoi en attente"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 6,
  },
  badgePending: {
    backgroundColor: "#F59E0B",
  },
  badgeUploading: {
    backgroundColor: colors.primary,
  },
  badgeError: {
    backgroundColor: "#DC2626",
  },
  pressed: {
    opacity: 0.8,
  },
  spinner: {
    transform: [{ scale: 0.75 }],
  },
  icon: {
    fontSize: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
