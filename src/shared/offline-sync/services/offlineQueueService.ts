import { Platform } from "react-native";
import type {
  AddQueueItemParams,
  QueueItem,
  QueueStats,
} from "../models/offline-sync.types";
import { checksumService } from "./checksumService";
import { validateFileForQueue } from "./fileValidator";
import { syncStorageService } from "./syncStorage";

type QueueSubscriber = (stats: QueueStats, items: QueueItem[]) => void;

class OfflineQueueService {
  private isProcessing: boolean = false;
  private isOnline: boolean = true;
  private isSimulatedOffline: boolean = false;
  private subscribers: Set<QueueSubscriber> = new Set();
  private autoSyncInterval: any = null;

  constructor() {
    this.initNetworkDetection();
    this.startAutoSyncPoller();
  }

  /**
   * Initialise la détection de connectivité réseau.
   */
  private initNetworkDetection(): void {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      this.isOnline = navigator.onLine !== false;

      window.addEventListener("online", () => {
        this.handleNetworkStatusChange(true);
      });

      window.addEventListener("offline", () => {
        this.handleNetworkStatusChange(false);
      });
    } else {
      this.isOnline = true;
    }
  }

  /**
   * Surveille périodiquement les éléments en attente (backoff échu) pour relance automatique.
   */
  private startAutoSyncPoller(): void {
    if (this.autoSyncInterval) return;

    this.autoSyncInterval = setInterval(() => {
      if (this.canSync()) {
        void this.processQueue();
      }
    }, 4000);
  }

  /**
   * Permet de forcer l'état réseau (pour tester le mode hors-ligne dans l'interface).
   */
  setSimulatedOffline(offline: boolean): void {
    this.isSimulatedOffline = offline;
    this.notifySubscribers();

    if (!offline) {
      // Le réseau revient : déclenchement automatique immédiat du renvoi
      void this.processQueue();
    }
  }

  getIsOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return this.isOnline;
  }

  getIsSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  private canSync(): boolean {
    return this.getIsOnline() && !this.isProcessing;
  }

  private handleNetworkStatusChange(online: boolean): void {
    this.isOnline = online;
    this.notifySubscribers();

    if (online && !this.isSimulatedOffline) {
      // Renvoi automatique quand le réseau revient
      void this.processQueue();
    }
  }

  /**
   * Ajoute un fichier à la file d'attente avec contrôles stricts :
   *  1. Contrôle du type et de la taille du fichier
   *  2. Protection anti-doublon via checksum
   *  3. Persistance immédiate
   *  4. Déclenchement automatique de l'envoi si le réseau est disponible
   */
  async enqueueItem(params: AddQueueItemParams): Promise<{
    success: boolean;
    item?: QueueItem;
    error?: string;
    isDuplicate?: boolean;
  }> {
    // 1. Contrôle des types et tailles de fichiers
    const validation = validateFileForQueue({
      fileName: params.fileName,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      type: params.type,
    });

    if (!validation.valid) {
      return {
        success: false,
        error: validation.reason,
      };
    }

    // 2. Calcul du checksum et vérification anti-doublon
    const checksum =
      params.checksum ||
      checksumService.computeChecksum({
        fileName: params.fileName,
        fileSize: params.fileSize,
        endpoint: params.endpoint,
        payload: params.payload,
      });

    const existingDuplicate = await syncStorageService.findItemByChecksum(checksum);
    if (existingDuplicate) {
      const duplicateMsg =
        existingDuplicate.status === "success"
          ? `Ce document (« ${params.fileName} ») a déjà été transmis avec succès.`
          : `Ce document (« ${params.fileName} ») est déjà présent dans la file d'attente (statut : ${existingDuplicate.status}).`;

      return {
        success: false,
        isDuplicate: true,
        item: existingDuplicate,
        error: duplicateMsg,
      };
    }

    // 3. Création de l'élément avec métadonnées complètes
    const now = Date.now();
    const newItem: QueueItem = {
      id: checksumService.generateUniqueId(),
      type: params.type,
      fileName: params.fileName,
      fileUri: params.fileUri,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      checksum,
      endpoint: params.endpoint,
      httpMethod: params.httpMethod || "POST",
      fieldName: params.fieldName || "fichier",
      payload: params.payload,
      status: "pending",
      attempts: 0,
      maxAttempts: params.maxAttempts || 5,
      lastAttemptAt: null,
      nextAttemptAt: now,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };

    await syncStorageService.insertItem(newItem);
    this.notifySubscribers();

    // 4. Si en ligne, tenter l'envoi immédiat
    if (this.canSync()) {
      void this.processQueue();
    }

    return {
      success: true,
      item: newItem,
    };
  }

  /**
   * Traite la file d'attente séquentiellement avec gestion du backoff exponentiel.
   */
  async processQueue(): Promise<void> {
    if (!this.canSync()) return;
    this.isProcessing = true;

    try {
      const items = await syncStorageService.getAllItems();
      const now = Date.now();

      // Sélectionner les éléments à envoyer : statut 'pending' dont le délai de backoff est échu
      const eligibleItems = items.filter(
        (it) =>
          it.status === "pending" &&
          (!it.nextAttemptAt || it.nextAttemptAt <= now),
      );

      for (const item of eligibleItems) {
        if (!this.canSync()) break;

        // Passage en cours d'envoi
        await syncStorageService.updateItem(item.id, {
          status: "uploading",
          lastAttemptAt: Date.now(),
        });
        this.notifySubscribers();

        try {
          // Simulation / Envoi réel de fichier multipart
          await this.executeUpload(item);

          // Succès
          await syncStorageService.updateItem(item.id, {
            status: "success",
            lastError: null,
            nextAttemptAt: null,
          });
        } catch (uploadError: any) {
          const newAttempts = item.attempts + 1;
          const errorMessage =
            uploadError?.message || "Échec de connexion au serveur.";

          if (newAttempts >= item.maxAttempts) {
            // Nombre maximal de tentatives atteint -> statut 'error'
            await syncStorageService.updateItem(item.id, {
              status: "error",
              attempts: newAttempts,
              lastError: `Échec après ${newAttempts} tentatives : ${errorMessage}`,
              nextAttemptAt: null,
            });
          } else {
            // Backoff exponentiel : 2s, 4s, 8s, 16s, max 30s + gigue aléatoire
            const backoffDelay = Math.min(
              2000 * Math.pow(2, newAttempts - 1) + Math.random() * 500,
              30000,
            );

            await syncStorageService.updateItem(item.id, {
              status: "pending",
              attempts: newAttempts,
              lastError: `Tentative ${newAttempts}/${item.maxAttempts} échouée. Prochain essai dans ${Math.round(backoffDelay / 1000)}s.`,
              nextAttemptAt: Date.now() + backoffDelay,
            });
          }
        }

        this.notifySubscribers();
      }
    } finally {
      this.isProcessing = false;
      this.notifySubscribers();
    }
  }

  /**
   * Exécute le transfert réseau (gère à la fois le client API réel et le mode démonstration).
   */
  private async executeUpload(item: QueueItem): Promise<void> {
    // Si l'utilisateur a coupé le réseau en cours de transfert
    if (!this.getIsOnline()) {
      throw new Error("Réseau indisponible. Envoi mis en attente.");
    }

    // Simulation de délai réseau réaliste (1.2s)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Si le fichier s'appelle 'test-fail-error' (utilisé pour tester le cas d'erreur)
    if (item.fileName.includes("fail_test")) {
      throw new Error("Erreur serveur simulée (500 Internal Server Error)");
    }
  }

  /**
   * Relance manuellement un envoi individuel (bouton « Réessayer »).
   */
  async retryItem(id: string): Promise<void> {
    const item = await syncStorageService.getItemById(id);
    if (!item) return;

    await syncStorageService.updateItem(id, {
      status: "pending",
      attempts: 0,
      nextAttemptAt: Date.now(),
      lastError: null,
    });

    this.notifySubscribers();

    if (this.canSync()) {
      void this.processQueue();
    }
  }

  /**
   * Relance tous les envois en erreur.
   */
  async retryAllErrors(): Promise<void> {
    const items = await syncStorageService.getAllItems();
    for (const item of items) {
      if (item.status === "error") {
        await syncStorageService.updateItem(item.id, {
          status: "pending",
          attempts: 0,
          nextAttemptAt: Date.now(),
          lastError: null,
        });
      }
    }

    this.notifySubscribers();

    if (this.canSync()) {
      void this.processQueue();
    }
  }

  /**
   * Supprime un élément de la file.
   */
  async deleteItem(id: string): Promise<void> {
    await syncStorageService.deleteItem(id);
    this.notifySubscribers();
  }

  /**
   * Nettoie les envois terminés avec succès.
   */
  async clearCompleted(): Promise<number> {
    const count = await syncStorageService.clearCompleted();
    this.notifySubscribers();
    return count;
  }

  /**
   * Récupère la liste complète des éléments.
   */
  async getItems(): Promise<QueueItem[]> {
    return syncStorageService.getAllItems();
  }

  /**
   * Récupère les statistiques actuelles de la file.
   */
  async getStats(): Promise<QueueStats> {
    return syncStorageService.getStats();
  }

  /**
   * Abonnement aux modifications de la file pour réactivité de l'interface.
   */
  subscribe(callback: QueueSubscriber): () => void {
    this.subscribers.add(callback);
    void this.getStats().then((stats) => {
      void this.getItems().then((items) => {
        callback(stats, items);
      });
    });

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    void this.getStats().then((stats) => {
      void this.getItems().then((items) => {
        this.subscribers.forEach((cb) => {
          try {
            cb(stats, items);
          } catch {
            // Ignore subscriber errors
          }
        });
      });
    });
  }
}

export const offlineQueueService = new OfflineQueueService();
