const STORAGE_KEY = "harita-ustasi:rekabet:v1";
const CHANGE_EVENT = "harita-ustasi:rekabet-degisti";

export function getCompetitiveMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "acik";
  } catch {
    return false;
  }
}

export function setCompetitiveMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "acik" : "kapali");
  } catch {
    // Depolama kapalı olsa bile mevcut sayfadaki mod değişikliği çalışır.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: enabled }));
}

export function subscribeCompetitiveMode(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
