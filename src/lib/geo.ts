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

// Türkiye Coğrafi Bölgeleri için elle ayarlanmış çerçeveler (harita
// koordinatlarında, 1000x420). Her bölge oyununda kamera bu çerçeveye
// odaklanır ve zoom-out kilitlenir.
export const REGION_BOUNDS: Record<string, Bounds> = {
  Marmara: { x: 60, y: 5, w: 250, h: 110 },
  Ege: { x: 70, y: 90, w: 220, h: 170 },
  Akdeniz: { x: 230, y: 210, w: 320, h: 130 },
  "İç Anadolu": { x: 260, y: 90, w: 340, h: 200 },
  Karadeniz: { x: 220, y: 5, w: 620, h: 175 },
  "Doğu Anadolu": { x: 540, y: 100, w: 370, h: 195 },
  "Güneydoğu Anadolu": { x: 480, y: 220, w: 320, h: 130 },
};

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

export function focusBoundsForSlug(slug: string): Bounds | null {
  const region = REGION_ILLERI_SLUGS[slug];
  if (!region) return null;
  return REGION_BOUNDS[region] ?? null;
}
