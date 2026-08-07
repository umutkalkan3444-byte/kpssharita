// Natural Earth 1:50m Admin-0 country polygons (public domain), reduced to
// Türkiye's eight land neighbours. Keeping the real polygons here prevents
// the Mediterranean and Black Sea from being painted as neighbouring land.
import neighborCountryData from "@/data/neighbor-countries.json";
import { project } from "@/lib/geo";

type Position = [number, number]; // [longitude, latitude]

type PolygonGeometry = {
  type: "Polygon";
  coordinates: Position[][];
};

type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: Position[][][];
};

type NeighborGeometry = PolygonGeometry | MultiPolygonGeometry;

type NeighborSource = {
  country: string;
  geometry: NeighborGeometry;
};

type NeighborAppearance = {
  fill: string;
  overlapWidth: number;
  shortLabel?: string;
  /** Otomatik etiket noktası uygun değilse elle verilen harita konumu. */
  labelOverride?: [number, number]; // [latitude, longitude]
};

export type NeighborArea = NeighborSource & NeighborAppearance;

// Türkiye ile aynı görsel dilde, ama karadan ayırt edilebilsin diye sıcak
// toprak tonlarında. Her ülkenin tonu komşusundan farklı.
const APPEARANCE: Record<string, NeighborAppearance> = {
  Yunanistan: { fill: "#f6ecd8", overlapWidth: 2.5 },
  Bulgaristan: { fill: "#eadfc4", overlapWidth: 3 },
  Gürcistan: { fill: "#f3e3c8", overlapWidth: 3.5 },
  Ermenistan: { fill: "#e7d4b4", overlapWidth: 4 },
  "Azerbaycan (Nahçıvan)": {
    fill: "#f2decd",
    overlapWidth: 4,
  },
  İran: { fill: "#ecd8b6", overlapWidth: 4.5 },
  Irak: { fill: "#f0e2c2", overlapWidth: 4 },
  Suriye: { fill: "#f7ead2", overlapWidth: 3.5 },
};

/** Ülkeler arası sınır çizgisi rengi — dolgulardan belirgin şekilde koyu. */
export const NEIGHBOR_BORDER_STROKE = "rgba(146,113,66,0.85)";
export const NEIGHBOR_BORDER_WIDTH = 0.9;

export const NEIGHBOR_AREAS: NeighborArea[] = (
  neighborCountryData as NeighborSource[]
).map((area) => ({ ...area, ...APPEARANCE[area.country] }));

function ringPath(ring: Position[]): string {
  return (
    ring
      .map(([lon, lat], index) => {
        const point = project(lat, lon);
        return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}

function polygonsOf(area: NeighborArea): Position[][][] {
  return area.geometry.type === "Polygon"
    ? [area.geometry.coordinates]
    : area.geometry.coordinates;
}

export function areaPath(area: NeighborArea): string {
  return polygonsOf(area)
    .flatMap((polygon) => polygon.map((ring) => ringPath(ring)))
    .join(" ");
}

type Pt = { x: number; y: number };

function projectRing(ring: Position[]): Pt[] {
  return ring.map(([lon, lat]) => project(lat, lon));
}

function pointInRing(p: Pt, ring: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

function distanceToRing(p: Pt, ring: Pt[]): number {
  let min = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1e-9;
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    min = Math.min(min, Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)));
  }
  return min;
}

/**
 * Etiketi ülkenin kendi kara parçasının içine yerleştirir: haritada görünen
 * bölümü ızgara ile tarar ve kenarlardan en uzak noktayı seçer. Böylece yazı
 * ülkenin sağında/solunda denizde asılı kalmaz.
 */
function bestLabelPoint(area: NeighborArea, view: Pt & { w: number; h: number }): Pt | null {
  const rings = polygonsOf(area)
    .map((polygon) => projectRing(polygon[0]))
    .filter((ring) => ring.length > 2);
  if (rings.length === 0) return null;

  let best: Pt | null = null;
  let bestScore = -Infinity;

  for (const ring of rings) {
    const minX = Math.max(view.x, Math.min(...ring.map((p) => p.x)));
    const maxX = Math.min(view.x + view.w, Math.max(...ring.map((p) => p.x)));
    const minY = Math.max(view.y, Math.min(...ring.map((p) => p.y)));
    const maxY = Math.min(view.y + view.h, Math.max(...ring.map((p) => p.y)));
    if (maxX <= minX || maxY <= minY) continue;

    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const p = {
          x: minX + ((maxX - minX) * i) / steps,
          y: minY + ((maxY - minY) * j) / steps,
        };
        if (!pointInRing(p, ring)) continue;
        const edgeGap = Math.min(
          p.x - view.x,
          view.x + view.w - p.x,
          p.y - view.y,
          view.y + view.h - p.y,
        );
        const score = Math.min(distanceToRing(p, ring), edgeGap);
        if (score > bestScore) {
          bestScore = score;
          best = p;
        }
      }
    }
  }

  return bestScore > 4 ? best : null;
}

export function areaLabelPoint(
  area: NeighborArea,
  view: { x: number; y: number; w: number; h: number },
): { x: number; y: number; text: string } | null {
  const text = area.shortLabel ?? area.country;
  if (area.labelOverride) {
    const point = project(area.labelOverride[0], area.labelOverride[1]);
    return { x: point.x, y: point.y, text };
  }
  const point = bestLabelPoint(area, view);
  return point ? { x: point.x, y: point.y, text } : null;
}
