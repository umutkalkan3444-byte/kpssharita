import { REGION_OF } from "./province-regions";
import { normalizePlaceName } from "./place-name";

const PROVINCE_HINTS = Object.keys(REGION_OF).map(normalizePlaceName);
const LOCATION_ALIASES = [
  "kmaras",
  "surfa",
  "yüksekova",
  "yedigöller",
  "karagöl",
  "bulanık",
  "durusu",
  "manavgat",
  "kaz dağı",
  "marmaris",
  "tarsus",
  "alanya",
  "izmit",
  "paşabahçe",
  "seydişehir",
  "filyos",
  "pendik",
  "selçuk",
  "pamukkale",
  "boğazkale",
  "efes",
  "antakya",
  "demre",
  "gazlıgöl",
  "büyükçekmece",
  "küçükçekmece",
  "bergama",
].map(normalizePlaceName);

function isLocationHint(value: string): boolean {
  const normalized = normalizePlaceName(value);
  return [...PROVINCE_HINTS, ...LOCATION_ALIASES].some(
    (location) => location.length >= 3 && normalized.includes(location),
  );
}

export function hideLocationHint(name: string): string {
  return name
    .replace(/\s*\(([^()]*)\)/g, (match, content: string) => (isLocationHint(content) ? "" : match))
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildCardLabels(
  items: readonly { id: string; name: string }[],
): Readonly<Record<string, string>> {
  const baseLabels = items.map((item) => ({ id: item.id, label: hideLocationHint(item.name) }));
  const counts = new Map<string, number>();
  for (const item of baseLabels) {
    counts.set(item.label, (counts.get(item.label) ?? 0) + 1);
  }

  const seen = new Map<string, number>();
  return Object.fromEntries(
    baseLabels.map((item) => {
      if ((counts.get(item.label) ?? 0) < 2) return [item.id, item.label];
      const order = (seen.get(item.label) ?? 0) + 1;
      seen.set(item.label, order);
      return [item.id, `${item.label} · ${String.fromCharCode(64 + order)}`];
    }),
  );
}
