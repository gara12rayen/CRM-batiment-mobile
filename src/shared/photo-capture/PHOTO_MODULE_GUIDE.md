# FICHE TECHNIQUE : Module Photo et Capture d'Image
**Socle Outils Communs — Binôme 1B (Mohamed)**  
**Dépôt :** `CRM-batiment-mobile` • **Branche :** `feature/socle-outils-communs`  
**Destinataires :** Partie 2 (Prospects/Clients), Partie 3 (Chantiers/Travaux), Partie 4 (Devis/Factures)

---

## 1. Description du module

Le module `src/shared/photo-capture/` fournit un ensemble réutilisable de composants et de services pour la capture de photos de terrain et la sélection multiple depuis la galerie d'images.

### Caractéristiques techniques :
1. **Accès Caméra & Ergonomie Terrain** :
   - Viseur avec grille de cadrage (règle des tiers pour photos de chantier).
   - Bascule immédiate entre objectif arrière (prise de vue chantier/façade) et objectif avant.
   - Gestion des modes flash (`off`, `on`, `auto`).
2. **Import Galerie Multiple** :
   - Sélection simultanée de plusieurs clichés avec prévisualisation par vignettes.
3. **Réduction Automatique du Poids (&le; 500 Ko / photo)** :
   - Algorithme d'optimisation adaptative (redimensionnement intelligent max 1920px Full HD + compression JPEG progressive).
   - Réduction de 70% à 90% du poids sans dégrader la lisibilité technique (fissures, câblages, compteurs, signatures).
4. **Intégration Envoi Différé Hors-Ligne (Module 4)** :
   - Les photos peuvent être directement envoyées dans la file d'attente persistante locale pour un envoi en tâche de fond dès que la connectivité réseau est rétablie.

---

## 2. Guide d'intégration par partie

### A. Partie 3 : Chantiers & Suivi de Travaux (Prioritaire)
Sur le terrain, les chefs de chantier doivent photographier les étapes de travaux (avant/après, anomalies, réceptions).

**Endpoint cible :** `POST /api/v1/chantiers/:chantierId/photos`  
**Champ multipart :** `photos` (tableau d'images)

```tsx
import React from "react";
import { View, Button } from "react-native";
import {
  usePhotoCapture,
  CameraCaptureView,
  PhotoGridPreview,
} from "@/shared/photo-capture";

export function ChantierPhotosScreen({ chantierId }: { chantierId: string }) {
  const {
    photos,
    cameraFacing,
    flashMode,
    gridEnabled,
    isCapturing,
    takePhoto,
    pickMultipleFromGallery,
    toggleCameraFacing,
    toggleFlashMode,
    toggleGrid,
    removePhoto,
    setSelectedPhoto,
    sendPhotosToOfflineQueue,
  } = usePhotoCapture({
    chantierId,
    targetMaxSizeBytes: 500 * 1024, // Règle stricte <= 500 Ko
    allowsMultiple: true,
  });

  const handleSynchroniser = async () => {
    // Envoi par lot vers l'API ou mise en file différée si hors-ligne
    const res = await sendPhotosToOfflineQueue(chantierId);
    if (res.success) {
      alert(`${res.queuedCount} photo(s) programmée(s) pour synchronisation !`);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Viseur caméra avec bascule avant/arrière */}
      <CameraCaptureView
        cameraFacing={cameraFacing}
        flashMode={flashMode}
        gridEnabled={gridEnabled}
        photoCount={photos.length}
        isCapturing={isCapturing}
        onTakePhoto={() => takePhoto()}
        onToggleFacing={toggleCameraFacing}
        onToggleFlash={toggleFlashMode}
        onToggleGrid={toggleGrid}
      />

      {/* Galerie des vignettes avec poids < 500 Ko */}
      <PhotoGridPreview
        photos={photos}
        onSelectPhoto={setSelectedPhoto}
        onRemovePhoto={removePhoto}
        onPickGalleryMultiple={pickMultipleFromGallery}
      />

      {photos.length > 0 && (
        <Button title="Enregistrer les photos" onPress={handleSynchroniser} />
      )}
    </View>
  );
}
```

---

### B. Partie 2 : Prospects & Clients
Pour joindre une photo des lieux lors de la création d'un prospect ou de la fiche client :

```tsx
import { PhotoCaptureService, PhotoCompressionService } from "@/shared/photo-capture";

// Ouvrir directement la sélection galerie pour le profil client
const uris = await PhotoCaptureService.pickMultipleFromGallery(3);
if (uris.length > 0) {
  const compressed = await PhotoCompressionService.compressPhoto(uris[0], {
    maxSizeBytes: 500 * 1024,
  });
  console.log("Photo client prête :", compressed.uri, compressed.compressedSizeBytes);
}
```

---

### C. Partie 4 : Devis & Justificatifs techniques
Pour photographier un devis papier, des anomalies avant devis ou des bons de livraison :

```tsx
import { usePhotoCapture } from "@/shared/photo-capture";

const { photos, takePhoto, sendPhotosToOfflineQueue } = usePhotoCapture({
  mockMode: false,
});
```

---

## 3. Interfaces & Types exportés

```typescript
export interface PhotoMetadata {
  id: string;
  uri: string;
  originalUri: string;
  fileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number; // Toujours <= 500 Ko
  compressionRatioPercent: number; // ex: 82%
  width: number;
  height: number;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  capturedAt: number;
  source: "camera" | "gallery" | "mock";
  isUnderLimit: boolean; // true si <= 500 Ko
}

export interface PhotoCaptureOptions {
  maxPhotos?: number;
  targetMaxSizeBytes?: number; // Défaut : 512 000 (500 Ko)
  allowsMultiple?: boolean;
  enableGrid?: boolean;
  mockMode?: boolean;
  chantierId?: string;
}
```

---

## 4. Écran de Test Interactif

Pour essayer l'outil directement sur smartphone (Expo Go) ou sur le web :
- **Bouton d'en-tête :** `📷 Photo`
- **Route directe :** `/photo-capture-test`
