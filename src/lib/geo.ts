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
