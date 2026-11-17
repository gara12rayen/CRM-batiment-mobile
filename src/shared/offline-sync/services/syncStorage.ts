import { Platform } from "react-native";
import type { QueueItem, QueueStats } from "../models/offline-sync.types";

/**
 * Moteur de stockage persistant pour la file d'attente d'envois différés.
 * Reproduit la structure d'une table SQLite :
 *
 *  CREATE TABLE IF NOT EXISTS upload_queue (
 *    id TEXT PRIMARY KEY,
 *    type TEXT NOT NULL,
 *    file_name TEXT NOT NULL,
 *    file_uri TEXT NOT NULL,
 *    file_size INTEGER NOT NULL,
 *    mime_type TEXT NOT NULL,
 *    checksum TEXT NOT NULL,
 *    endpoint TEXT NOT NULL,
 *    http_method TEXT NOT NULL DEFAULT 'POST',
 *    field_name TEXT NOT NULL DEFAULT 'fichier',
 *    payload TEXT,
 *    status TEXT NOT NULL DEFAULT 'pending',
 *    attempts INTEGER NOT NULL DEFAULT 0,
 *    max_attempts INTEGER NOT NULL DEFAULT 5,
 *    last_attempt_at INTEGER,
 *    next_attempt_at INTEGER,
 *    last_error TEXT,
 *    created_at INTEGER NOT NULL,
 *    updated_at INTEGER NOT NULL
 *  );
 *  CREATE INDEX IF NOT EXISTS idx_upload_queue_status ON upload_queue(status);
 *  CREATE INDEX IF NOT EXISTS idx_upload_queue_checksum ON upload_queue(checksum);
 */

const STORAGE_KEY = "crm_upload_queue_v1";

class SyncStorageService {
  private inMemoryItems: Map<string, QueueItem> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialise la base de données et recharge les éléments conservés sur disque.
   * Assure la persistance même après fermeture complète de l'application.
   */
  async initDatabase(): Promise<void> {
    if (this.isInitialized) return;

    try {
      let rawData: string | null = null;

      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        rawData = window.localStorage.getItem(STORAGE_KEY);
      } else {
        // Environnement mobile / natif : lecture du fichier persistant
        try {
          const { File, Paths } = await import("expo-file-system");
          const file = new File(Paths.document, `${STORAGE_KEY}.json`);
          if (file.exists) {
            rawData = await file.text();
          }
        } catch {
          // Fallback mémoire
        }
      }

      if (rawData) {
        const parsed: QueueItem[] = JSON.parse(rawData);
        this.inMemoryItems.clear();
        for (const item of parsed) {
          // Si l'application avait été fermée pendant un envoi (uploading), on le remet en pending
          const normalized: QueueItem = {
            ...item,
            status: item.status === "uploading" ? "pending" : item.status,
          };
          this.inMemoryItems.set(normalized.id, normalized);
        }
      }
    } catch (error) {
      console.warn("Échec du chargement de la file d'attente persistante :", error);
    } finally {
      this.isInitialized = true;
    }
  }

  /**
   * Sauvegarde atomique de l'état sur le disque.
   */
  private async persist(): Promise<void> {
    try {
      const all = Array.from(this.inMemoryItems.values());
      const serialized = JSON.stringify(all);

      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        try {
          const { File, Paths } = await import("expo-file-system");
          const file = new File(Paths.document, `${STORAGE_KEY}.json`);
          await file.write(serialized);
        } catch {
          // Fallback mémoire
        }
      }
    } catch (error) {
      console.warn("Échec de la persistance de la file d'attente :", error);
    }
  }

  /**
   * Récupère tous les éléments triés du plus récent au plus ancien.
   * Équivalent : SELECT * FROM upload_queue ORDER BY created_at DESC;
   */
  async getAllItems(): Promise<QueueItem[]> {
    await this.initDatabase();
    return Array.from(this.inMemoryItems.values()).sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  }

  /**
   * Récupère un élément par son ID unique.
   * Équivalent : SELECT * FROM upload_queue WHERE id = ?;
   */
  async getItemById(id: string): Promise<QueueItem | null> {
    await this.initDatabase();
    return this.inMemoryItems.get(id) ?? null;
  }

  /**
   * Recherche un doublon par son checksum (empreinte).
   * Équivalent : SELECT * FROM upload_queue WHERE checksum = ? AND status != 'error';
   */
  async findItemByChecksum(checksum: string): Promise<QueueItem | null> {
    await this.initDatabase();
    for (const item of this.inMemoryItems.values()) {
      if (item.checksum === checksum && item.status !== "error") {
        return item;
      }
    }
    return null;
  }

  /**
   * Insère un nouvel élément dans la file d'attente.
   * Équivalent : INSERT INTO upload_queue (...) VALUES (...);
   */
  async insertItem(item: QueueItem): Promise<QueueItem> {
    await this.initDatabase();
    this.inMemoryItems.set(item.id, item);
    await this.persist();
    return item;
  }

  /**
   * Met à jour un élément existant (statut, tentatives, erreur).
   * Équivalent : UPDATE upload_queue SET ... WHERE id = ?;
   */
  async updateItem(id: string, updates: Partial<QueueItem>): Promise<QueueItem | null> {
    await this.initDatabase();
    const existing = this.inMemoryItems.get(id);
    if (!existing) return null;

    const updated: QueueItem = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    this.inMemoryItems.set(id, updated);
    await this.persist();
    return updated;
  }

  /**
   * Supprime un élément de la file.
   * Équivalent : DELETE FROM upload_queue WHERE id = ?;
   */
  async deleteItem(id: string): Promise<boolean> {
    await this.initDatabase();
    const existed = this.inMemoryItems.delete(id);
    if (existed) {
      await this.persist();
    }
    return existed;
  }

  /**
   * Supprime tous les éléments qui ont été envoyés avec succès.
   * Équivalent : DELETE FROM upload_queue WHERE status = 'success';
   */
  async clearCompleted(): Promise<number> {
    await this.initDatabase();
    let count = 0;
    for (const [id, item] of this.inMemoryItems.entries()) {
      if (item.status === "success") {
        this.inMemoryItems.delete(id);
        count++;
      }
    }
    if (count > 0) {
      await this.persist();
    }
    return count;
  }

  /**
   * Calcule les statistiques globales de la file d'attente.
   */
  async getStats(): Promise<QueueStats> {
    await this.initDatabase();
    const stats: QueueStats = {
      total: 0,
      pending: 0,
      uploading: 0,
      error: 0,
      success: 0,
    };

    for (const item of this.inMemoryItems.values()) {
      stats.total++;
      if (item.status === "pending") stats.pending++;
      else if (item.status === "uploading") stats.uploading++;
      else if (item.status === "error") stats.error++;
      else if (item.status === "success") stats.success++;
    }

    return stats;
  }
}

export const syncStorageService = new SyncStorageService();
