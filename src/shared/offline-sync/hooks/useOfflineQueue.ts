import { useEffect, useState } from "react";
import type {
  AddQueueItemParams,
  QueueItem,
  QueueStats,
} from "../models/offline-sync.types";
import { offlineQueueService } from "../services/offlineQueueService";

const INITIAL_STATS: QueueStats = {
  total: 0,
  pending: 0,
  uploading: 0,
  error: 0,
  success: 0,
};

export function useOfflineQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>(INITIAL_STATS);
  const [isOnline, setIsOnline] = useState<boolean>(
    offlineQueueService.getIsOnline(),
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(
    offlineQueueService.getIsSimulatedOffline(),
  );

  useEffect(() => {
    const unsubscribe = offlineQueueService.subscribe((newStats, newItems) => {
      setStats(newStats);
      setItems(newItems);
      setIsOnline(offlineQueueService.getIsOnline());
      setIsSimulatedOffline(offlineQueueService.getIsSimulatedOffline());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const enqueue = async (params: AddQueueItemParams) => {
    return offlineQueueService.enqueueItem(params);
  };

  const retry = async (id: string) => {
    await offlineQueueService.retryItem(id);
  };

  const retryAll = async () => {
    await offlineQueueService.retryAllErrors();
  };

  const remove = async (id: string) => {
    await offlineQueueService.deleteItem(id);
  };

  const clearDone = async () => {
    return offlineQueueService.clearCompleted();
  };

  const toggleSimulatedOffline = (offline: boolean) => {
    offlineQueueService.setSimulatedOffline(offline);
    setIsSimulatedOffline(offline);
    setIsOnline(offlineQueueService.getIsOnline());
  };

  const forceSync = async () => {
    await offlineQueueService.processQueue();
  };

  return {
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
  };
}
