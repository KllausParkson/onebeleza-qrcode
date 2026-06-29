/** Tempo máximo de inatividade antes de exigir novo login (24 horas) */
export const INACTIVITY_TIMEOUT_MS = 24 * 60 * 60 * 1000;

export const LAST_ACTIVITY_KEY = "onebeleza_last_activity";

export function touchActivity(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function clearActivity(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function isInactivityExpired(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!raw) return false;
  const last = Number(raw);
  if (Number.isNaN(last)) return false;
  return Date.now() - last > INACTIVITY_TIMEOUT_MS;
}
