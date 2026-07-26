// Projection helpers for Turkey map. Bounding box is from the
// simplified province geojson bundled at src/data/turkey-provinces.json.
export const MAP_W = 1000;
export const MAP_H = 420;
const MIN_LON = 25.665;
const MAX_LON = 44.834;
const MIN_LAT = 35.815;
const MAX_LAT = 42.105;

export function project(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * MAP_W;
  const y = MAP_H - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * MAP_H;
  return { x, y };
}

export type Bounds = { x: number; y: number; w: number; h: number };

// Slug → bölge adı eşlemesi (auto-focus için).
export const REGION_ILLERI_SLUGS: Record<string, string> = {
  "marmara-illeri": "Marmara",
  "ege-illeri": "Ege",
  "akdeniz-illeri": "Akdeniz",
  "ic-anadolu-illeri": "İç Anadolu",
  "karadeniz-illeri": "Karadeniz",
  "dogu-anadolu-illeri": "Doğu Anadolu",
  "guneydogu-anadolu-illeri": "Güneydoğu Anadolu",
};

export function focusBoundsForSlug(
  slug: string,
  items: readonly { lat: number; lon: number }[],
): Bounds | null {
  const region = REGION_ILLERI_SLUGS[slug];
  if (!region || items.length === 0) return null;

  const points = items.map((item) => project(item.lat, item.lon));
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const paddingX = 48;
  const paddingY = 34;
  const x = Math.max(0, minX - paddingX);
  const y = Math.max(0, minY - paddingY);
  const right = Math.min(MAP_W, maxX + paddingX);
  const bottom = Math.min(MAP_H, maxY + paddingY);

  return {
    x,
    y,
    w: Math.max(1, right - x),
    h: Math.max(1, bottom - y),
  };
}
