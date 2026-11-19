/**
 * Idempotency-Key header (backend lot 1 of 16/11): when the same action is sent twice with the
 * same key (double tap, network cut then back), the server does it only once and answers the
 * same thing. One new key per user action.
 */
export function nouvelleCleIdempotence(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  // Fallback (old devices): random UUID v4, enough to tell two actions apart
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const enteteIdempotence = (cle: string = nouvelleCleIdempotence()) => ({ "Idempotency-Key": cle });
