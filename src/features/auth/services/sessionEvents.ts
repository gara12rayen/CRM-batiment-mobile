type SessionExpiredListener = () => void;
type SessionChangedListener = () => void;

const listeners = new Set<SessionExpiredListener>();
const sessionChangedListeners = new Set<SessionChangedListener>();

export function subscribeToSessionExpiration(listener: SessionExpiredListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifySessionExpired() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToSessionChange(listener: SessionChangedListener) {
  sessionChangedListeners.add(listener);
  return () => {
    sessionChangedListeners.delete(listener);
  };
}

export function notifySessionChanged() {
  for (const listener of sessionChangedListeners) {
    listener();
  }
}
