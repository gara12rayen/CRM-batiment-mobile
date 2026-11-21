# FICHE TECHNIQUE : Module Scan de Documents Multi-Pages
**Socle Outils Communs — Binôme 1B (Mohamed)**  
**Dépôt :** `CRM-batiment-mobile` • **Branche :** `feature/socle-outils-communs`  
**Destinataires :** Binôme 1A (Rayen), Binôme 2 (Clients/Prospects), Binôme 3 (Chantiers), Binôme 4B (Hayati - Devis signé)

---

## 1. Vue d'ensemble du module

Le module `src/shared/document-scan/` fournit un outil complet et autonome de numérisation de documents papier multi-pages pour les professionnels du bâtiment en intervention (devis signés, bons de commande, constats de chantier, factures).

### Fonctionnalités intégrées :
- **Détection automatique des bords** (algorithme géométrique et de contraste type OpenCV Canny/Contour).
- **Recadrage manuel fin** avec poignées interactives pour les 4 sommets (TopLeft, TopRight, BottomRight, BottomLeft).
- **Correction de perspective et redressement orthogonal** au format A4 standard.
- **Filtres de lisibilité bâtiment** :
  - `bw_enhanced` : Noir & Blanc à seuil adaptatif (idéal pour devis imprimés et écritures manuscrites).
  - `magic_color` : Blanchiment du fond papier tout en conservant les couleurs des tampons et encres de signature.
  - `grayscale` : Niveaux de gris haute définition.
  - `original` : Photo brute non altérée.
- **Support multi-pages complet** :
  - Défilement et navigation par bande de miniatures.
  - Réorganisation facile de l'ordre des pages (gauche / droite).
  - Suppression et ajout de pages supplémentaires.
  - Rotation indépendante par page (0°, 90°, 180°, 270°).
- **Générateur et assembleur PDF natif (PDF 1.4 ISO 32000-1)** :
  - Assemblage en un unique fichier PDF multi-pages sans dépendance binaire lourde.
  - **3 profils de compression** :
    - *Forte* : ~120 Ko / page (optimisé zones blanches 3G/4G).
    - *Moyenne (Recommandé)* : ~350 Ko / page.
    - *Faible* : ~900 Ko / page (archivage haute définition).
- **Passerelle native avec l'Envoi Différé Hors-Ligne (Module 4)** :
  - Permet d'envoyer le PDF généré directement dans la file d'attente persistante SQLite/FileSystem pour un upload automatique dès que la connexion Internet revient.

---

## 2. Installation et Importation

Le module est déjà disponible dans le dossier partagé `src/shared/document-scan/`.

```typescript
import {
  useDocumentScanner,
  PdfService,
  ScanService,
  EdgeDetectionService,
  PerspectiveCorrectionService,
  PageThumbnailStrip,
  ScanPreview,
  CropEditor,
  PdfExportModal,
  DocumentScanTestView,
} from "@/shared/document-scan";
```

---

## 3. Exemple d'intégration : Cas Binôme 4B (Scan de devis signé)

Dans l'écran `app/devis/scan.tsx` ou `src/features/devis/views/ScanDevisView.tsx` :

```tsx
import React, { useState } from "react";
import { View, Button, Alert } from "react-native";
import {
  useDocumentScanner,
  PageThumbnailStrip,
  ScanPreview,
  CropEditor,
  PdfExportModal,
} from "@/shared/document-scan";

export function ScanDevisSigneScreen({ devisId }: { devisId: string }) {
  const {
    pages,
    currentPage,
    currentPageIndex,
    pageCount,
    compressionLevel,
    setCompressionLevel,
    isProcessing,
    pdfResult,
    loadMockPages,
    selectPage,
    updateCorners,
    applyFilter,
    rotatePage,
    deletePage,
    movePage,
    generatePdf,
    sendToOfflineQueue,
  } = useDocumentScanner({
    title: `Devis_Signe_${devisId}`,
    defaultFilter: "bw_enhanced",
    mockMode: true, // Idéal pour tests sur simulateur / sans caméra physique
  });

  const [isCropping, setIsCropping] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleFinaliser = async () => {
    // 1. Assemblage PDF multi-pages
    const pdf = await generatePdf();

    if (pdf) {
      // 2. Mise en file d'attente hors-ligne vers l'endpoint officiel du devis
      await sendToOfflineQueue(devisId, `/api/v1/devis/${devisId}/signature-papier`);
      Alert.alert(
        "Succès",
        `Le devis signé (${pdf.pageCount} pages) a été assemblé et programmé pour envoi !`
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 1. Miniature de toutes les pages */}
      <PageThumbnailStrip
        pages={pages}
        activePageIndex={currentPageIndex}
        onSelectPage={selectPage}
        onAddPage={loadMockPages}
        onDeletePage={deletePage}
        onMovePage={movePage}
      />

      {/* 2. Éditeur ou Aperçu */}
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
          onApplyFilter={(f) => applyFilter(currentPage.id, f)}
        />
      ) : null}

      {/* 3. Bouton d'export */}
      <Button title="Valider & Exporter PDF" onPress={handleFinaliser} />
    </View>
  );
}
```

---

## 4. Endpoints d'API associés (CDC & Rayen)

| Action | Méthode & Endpoint | Champ fichier | Payload associé |
| :--- | :--- | :--- | :--- |
| **Devis signé papier** | `POST /api/v1/devis/:id/signature-papier` | `fichier` | `application/pdf` |
| **Photos / Constats chantier** | `POST /api/v1/chantiers/:chantierId/photos` | `photos` | `image/jpeg` ou `application/pdf` |
| **Fichiers généraux** | `POST /api/v1/fichiers` | `file` | Multi-format |

---

## 5. Mode Démonstration / Version d'Essai (CDC)

Conformément aux exigences du cahier des charges, le module intègre un générateur de documents de simulation :
```typescript
import { ScanService } from "@/shared/document-scan";

// Retourne 3 pages réalistes de devis bâtiment :
// - Page 1 : En-tête entreprise, lot gros œuvre et maçonnerie
// - Page 2 : Lot menuiserie, électricité et total TTC
// - Page 3 : Conditions, mention manuscrite, tampon et signature
const mockPages = ScanService.getMockDevisPages();
```

---

## 6. Écran de Test Dédié

Accessible directement depuis la barre d'en-tête de l'application via le bouton **`📄 Scan`** ou la route :  
`/document-scan-test`
