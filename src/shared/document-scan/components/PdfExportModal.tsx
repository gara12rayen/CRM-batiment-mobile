import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type {
  CompressionLevel,
  ScanPdfResult,
  ScannedPage,
} from "../models/document-scan.types";
import { COMPRESSION_PROFILES } from "../services/pdfService";

interface PdfExportModalProps {
  pages: ScannedPage[];
  compressionLevel: CompressionLevel;
  pdfResult: ScanPdfResult | null;
  isProcessing: boolean;
  onSetCompression: (level: CompressionLevel) => void;
  onGeneratePdf: () => void;
  onSendToOfflineQueue: () => Promise<any>;
  onClose: () => void;
}

export function PdfExportModal({
  pages,
  compressionLevel,
  pdfResult,
  isProcessing,
  onSetCompression,
  onGeneratePdf,
  onSendToOfflineQueue,
  onClose,
}: PdfExportModalProps) {
  const [queueStatus, setQueueStatus] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const handleShare = async () => {
    if (!pdfResult) return;
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.open(pdfResult.fileUri, "_blank");
        }
      } else {
        await Share.share({
          title: pdfResult.fileName,
          message: `Fichier PDF numérisé (${pdfResult.pageCount} pages) : ${pdfResult.fileName}`,
          url: pdfResult.fileUri,
        });
      }
    } catch {
      // Ignorer erreur de partage
    }
  };

  const handleQueueOffline = async () => {
    setQueueStatus("Envoi dans la file d'attente...");
    const res = await onSendToOfflineQueue();
    if (res && res.scheduled) {
      setQueueStatus("✓ Ajouté à la file d'attente persistante (Module 4) !");
    } else {
      setQueueStatus("✓ Pris en compte pour l'envoi différé");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assemblage PDF multi-pages</Text>
        <Text style={styles.subtitle}>
          {pages.length} page(s) prête(s) à être assemblée(s)
        </Text>
      </View>

      {/* Sélecteur de niveau de compression */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Niveau de compression :</Text>
        <View style={styles.compressionOptions}>
          {(["high", "medium", "low"] as const).map((level) => {
            const profile = COMPRESSION_PROFILES[level];
            const isSelected = compressionLevel === level;
            return (
              <TouchableOpacity
                key={level}
                activeOpacity={0.8}
                onPress={() => onSetCompression(level)}
                style={[
                  styles.compressionCard,
                  isSelected && styles.compressionCardSelected,
                ]}
              >
                <Text
                  style={[
                    styles.compressionLabel,
                    isSelected && styles.compressionLabelSelected,
                  ]}
                >
                  {level === "high"
                    ? "Forte"
                    : level === "medium"
                    ? "Moyenne"
                    : "Faible"}
                </Text>
                <Text style={styles.compressionEst}>
                  ~{profile.estimatedSizePerPageKb * pages.length} Ko
                </Text>
                <Text style={styles.compressionDesc}>{profile.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bouton de génération si pas encore généré */}
      {!pdfResult && (
        <TouchableOpacity
          disabled={isProcessing}
          activeOpacity={0.8}
          onPress={onGeneratePdf}
          style={styles.generateButton}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.generateButtonText}>
              Générer le PDF multi-pages ({pages.length} pages)
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Résultat de la génération */}
      {pdfResult && (
        <View style={styles.resultBox}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>📕</Text>
            <View style={styles.resultMeta}>
              <Text style={styles.resultName}>{pdfResult.fileName}</Text>
              <Text style={styles.resultStats}>
                {pdfResult.pageCount} pages • {formatFileSize(pdfResult.fileSize)} •{" "}
                {COMPRESSION_PROFILES[pdfResult.compressionLevel].label}
              </Text>
            </View>
          </View>

          {queueStatus && (
            <View style={styles.queueStatusBadge}>
              <Text style={styles.queueStatusText}>{queueStatus}</Text>
            </View>
          )}

          <View style={styles.resultActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                {Platform.OS === "web" ? "Ouvrir / Télécharger" : "Partager"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleQueueOffline}
              style={styles.offlineButton}
            >
              <Text style={styles.offlineButtonText}>
                📤 Envoi différé (Queue)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  compressionOptions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  compressionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.xs,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  compressionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF",
  },
  compressionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  compressionLabelSelected: {
    color: colors.primary,
  },
  compressionEst: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
    marginVertical: 2,
  },
  compressionDesc: {
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
  },
  generateButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  resultBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultIcon: {
    fontSize: 24,
  },
  resultMeta: {
    flex: 1,
  },
  resultName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  resultStats: {
    fontSize: 11,
    color: "#15803D",
    marginTop: 2,
  },
  queueStatusBadge: {
    backgroundColor: "#DCFCE7",
    padding: spacing.xs,
    borderRadius: 6,
    marginVertical: spacing.xs,
  },
  queueStatusText: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "600",
    textAlign: "center",
  },
  resultActions: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
  },
  offlineButton: {
    flex: 1.2,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  offlineButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: 4,
  },
  closeButtonText: {
    fontSize: 12,
    color: colors.muted,
  },
});
