type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export function subscribeToSessionExpiration(listener: SessionExpiredListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySessionExpired() {
  for (const listener of listeners) {
    listener();
  }
}
