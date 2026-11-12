import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { DevisQRData } from "../models/qr-code.types";

interface QRSuccessDisplayProps {
  data: DevisQRData;
  onConfirm: () => void;
  onRescan: () => void;
}

export function QRSuccessDisplay({ data, onConfirm, onRescan }: QRSuccessDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>✅</Text>
      </View>

      <Text style={styles.title}>Devis identifié</Text>

      <View style={styles.dataCard}>
        <DataRow label="Référence" value={data.reference} mono />
        <DataRow label="Version" value={`v${data.version}`} />
        <DataRow label="Année" value={String(data.year)} />
        <DataRow label="N° séquentiel" value={String(data.sequentialNumber)} />
        {data.id ? <DataRow label="ID Devis" value={data.id} mono /> : null}
        {data.securityCode ? (
          <DataRow label="Code sécurité" value={data.securityCode} mono />
        ) : null}
      </View>

      <View style={styles.rawBox}>
        <Text style={styles.rawLabel}>QR code brut :</Text>
        <Text selectable style={styles.rawValue}>
          {data.rawValue}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onConfirm}
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.confirmButtonText}>Confirmer ce devis</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onRescan}
          style={({ pressed }) => [
            styles.rescanButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.rescanButtonText}>Scanner un autre</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DataRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text
        style={[
          styles.dataValue,
          mono && {
            fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#15803D",
    textAlign: "center",
  },
  dataCard: {
    width: "100%",
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dataLabel: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "500",
  },
  dataValue: {
    fontSize: 14,
    color: "#14532D",
    fontWeight: "700",
  },
  rawBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: spacing.sm,
  },
  rawLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 2,
  },
  rawValue: {
    fontSize: 12,
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  actionsRow: {
    width: "100%",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  confirmButton: {
    backgroundColor: "#15803D",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  rescanButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  rescanButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.8,
  },
});

