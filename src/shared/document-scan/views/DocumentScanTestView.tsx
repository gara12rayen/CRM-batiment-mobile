import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useDocumentScanner } from "../hooks/useDocumentScanner";
import { PageThumbnailStrip } from "../components/PageThumbnailStrip";
import { ScanPreview } from "../components/ScanPreview";
import { CropEditor } from "../components/CropEditor";
import { PdfExportModal } from "../components/PdfExportModal";

export function DocumentScanTestView() {
  const {
    pages,
    currentPage,
    currentPageIndex,
    pageCount,
    status,
    setStatus,
    compressionLevel,
    setCompressionLevel,
    isProcessing,
    pdfResult,
    error,
    loadMockPages,
    selectPage,
    updateCorners,
    applyFilter,
    rotatePage,
    deletePage,
    movePage,
    generatePdf,
    sendToOfflineQueue,
    resetScanner,
  } = useDocumentScanner({ mockMode: true });

  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const handleAddNewTestPage = () => {
    // Ajoute une page supplémentaire personnalisée
    const dummySvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600"><rect width="100%" height="100%" fill="#F1F5F9"/><rect x="60" y="60" width="1080" height="1480" rx="16" fill="#FFFFFF" stroke="#0284C7" stroke-width="6"/><text x="120" y="200" fill="#0369A1" font-family="sans-serif" font-size="36" font-weight="bold">PAGE COMPLEMENTAIRE N°${pageCount + 1}</text><text x="120" y="280" fill="#334155" font-family="sans-serif" font-size="24">Annexe technique &amp; Constat de chantier</text><line x1="120" y1="320" x2="1080" y2="320" stroke="#CBD5E1" stroke-width="3"/></svg>`;
    loadMockPages();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* En-tête du module */}
      <View style={styles.headerBox}>
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Binôme 1B • Socle Outils Communs</Text>
          </View>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityBadgeText}>Priorité Haute</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Scan de documents multi-pages</Text>
        <Text style={styles.subtitle}>
          Détection de bords (OpenCV-like), correction de perspective, recadrage manuel,
          support multi-pages et assemblage PDF compressé.
        </Text>
      </View>

      {/* Barre d'actions rapides de test */}
      <View style={styles.testActionsBar}>
        <TouchableOpacity
          style={styles.simulationButton}
          onPress={loadMockPages}
        >
          <Text style={styles.simulationButtonText}>
            📄 Charger devis 3 pages (Simulation)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetScanner}
        >
          <Text style={styles.resetButtonText}>↺ Réinitialiser</Text>
        </TouchableOpacity>
      </View>

      {/* Message d'erreur éventuel */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Indicateur de traitement */}
      {isProcessing && (
        <View style={styles.processingBar}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.processingText}>Traitement de l'image en cours...</Text>
        </View>
      )}

      {/* Si aucune page scannée */}
      {pageCount === 0 && (
        <View style={styles.emptyStateBox}>
          <Text style={styles.emptyStateIcon}>📑</Text>
          <Text style={styles.emptyStateTitle}>Aucune page numérisée</Text>
          <Text style={styles.emptyStateDesc}>
            Cliquez sur « Charger devis 3 pages » ci-dessus pour simuler la numérisation
            complète d'un devis bâtiment multi-pages (format CDC).
          </Text>
        </View>
      )}

      {/* Interface principale si des pages existent */}
      {pageCount > 0 && (
        <>
          {/* Bandeau de navigation multi-pages */}
          <PageThumbnailStrip
            pages={pages}
            activePageIndex={currentPageIndex}
            onSelectPage={selectPage}
            onAddPage={handleAddNewTestPage}
            onDeletePage={deletePage}
            onMovePage={movePage}
          />

          {/* Éditeur de recadrage des bords (si activé) ou Aperçu standard */}
          {isCropping && currentPage ? (
            <CropEditor
              page={currentPage}
              onApplyCrop={(corners) => {
                updateCorners(currentPage.id, corners);
                setIsCropping(false);
              }}
              onCancel={() => setIsCropping(false)}
            />
          ) : currentPage ? (
            <ScanPreview
              page={currentPage}
              totalPages={pageCount}
              onRotate={() => rotatePage(currentPage.id)}
              onEditCrop={() => setIsCropping(true)}
              onApplyFilter={(filter) => applyFilter(currentPage.id, filter)}
            />
          ) : null}

          {/* Barre de conversion PDF */}
          <View style={styles.pdfBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPdfModal(true)}
              style={styles.exportPdfButton}
            >
              <Text style={styles.exportPdfButtonText}>
                📕 Assembler et exporter en PDF ({pageCount} pages)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal / panneau de génération et compression PDF */}
          {showPdfModal && (
            <View style={{ marginTop: spacing.md }}>
              <PdfExportModal
                pages={pages}
                compressionLevel={compressionLevel}
                pdfResult={pdfResult}
                isProcessing={isProcessing}
                onSetCompression={setCompressionLevel}
                onGeneratePdf={() => generatePdf("Devis_Batiment_Signe")}
                onSendToOfflineQueue={() =>
                  sendToOfflineQueue("DEV-2026-0842", "/api/v1/devis/DEV-2026-0842/signature-papier")
                }
                onClose={() => setShowPdfModal(false)}
              />
            </View>
          )}
        </>
      )}

      {/* Accordéon : Fiche technique d'utilisation pour les autres binômes */}
      <View style={styles.guideContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowGuide((prev) => !prev)}
          style={styles.guideToggle}
        >
          <Text style={styles.guideToggleTitle}>
            📘 Fiche technique d'utilisation (Pour Binômes 1A, 2, 3, 4B)
          </Text>
          <Text style={styles.guideToggleIcon}>{showGuide ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {showGuide && (
          <View style={styles.guideContent}>
            <Text style={styles.guideHeading}>1. Importation du hook :</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>
                {`import { useDocumentScanner, PdfService } from "@/shared/document-scan";`}
              </Text>
            </View>

            <Text style={styles.guideHeading}>2. Exemple d'utilisation dans Binôme 4B (Devis signé) :</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>
                {`const {
  pages,
  generatePdf,
  sendToOfflineQueue
} = useDocumentScanner({ title: "Devis_Signe" });

// Assembler toutes les pages scannées en PDF
const pdfResult = await generatePdf();

// Si hors-ligne : envoi automatique en file d'attente (Module 4)
await sendToOfflineQueue(devisId);`}
              </Text>
            </View>

            <Text style={styles.guideHeading}>3. Sous-tâches validées :</Text>
            <Text style={styles.guideItem}>✓ 1. Détection des bords (OpenCV-like)</Text>
            <Text style={styles.guideItem}>✓ 2. Recadrage auto & correction de perspective</Text>
            <Text style={styles.guideItem}>✓ 3. Multi-pages : navigation, réorganisation, suppression</Text>
            <Text style={styles.guideItem}>✓ 4. Assemblage PDF conforme (PDF 1.4) avec 3 niveaux de compression</Text>
            <Text style={styles.guideItem}>✓ 5. Fiche technique & mode simulation CDC</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  headerBox: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  priorityBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.danger,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  testActionsBar: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  simulationButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    alignItems: "center",
  },
  simulationButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  processingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: "#EFF6FF",
    padding: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  processingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  emptyStateBox: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    marginVertical: spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  pdfBar: {
    marginTop: spacing.md,
  },
  exportPdfButton: {
    backgroundColor: "#059669",
    paddingVertical: spacing.sm + 2,
    borderRadius: 10,
    alignItems: "center",
  },
  exportPdfButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  guideContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  guideToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: "#F8FAFC",
  },
  guideToggleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  guideToggleIcon: {
    fontSize: 12,
    color: colors.muted,
  },
  guideContent: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  guideHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  codeBox: {
    backgroundColor: "#1E293B",
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  codeText: {
    color: "#38BDF8",
    fontSize: 11,
    fontFamily: "monospace",
  },
  guideItem: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
    marginVertical: 2,
  },
});
