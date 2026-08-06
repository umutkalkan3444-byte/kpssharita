// Türkiye'nin kara sınırı komşuları — sınır kapıları oyununda hangi ülkenin
// sınırının nerede başlayıp nerede bittiğini göstermek için yaklaşık hatlar.
// Koordinatlar (lat, lon).
import { project } from "@/lib/geo";

export type NeighborBorder = {
  country: string;
  color: string;
  coords: [number, number][];
};

export const NEIGHBOR_BORDERS: NeighborBorder[] = [
  {
    country: "Bulgaristan",
    color: "#16a34a",
    coords: [
      [41.74, 26.34],
      [41.92, 26.6],
      [41.98, 27.0],
      [42.0, 27.45],
      [42.03, 27.9],
    ],
  },
  {
    country: "Yunanistan",
    color: "#2563eb",
    coords: [
      [40.86, 26.06],
      [41.0, 26.33],
      [41.3, 26.35],
      [41.55, 26.5],
      [41.74, 26.34],
    ],
  },
  {
    country: "Gürcistan",
    color: "#9333ea",
    coords: [
      [41.52, 41.55],
      [41.45, 42.0],
      [41.55, 42.85],
      [41.2, 43.2],
      [41.1, 43.45],
    ],
  },
  {
    country: "Ermenistan",
    color: "#c026d3",
    coords: [
      [41.1, 43.45],
      [40.7, 43.6],
      [40.3, 43.7],
      [40.05, 43.8],
      [39.9, 44.05],
    ],
  },
  {
    country: "Azerbaycan (Nahçıvan)",
    color: "#0d9488",
    coords: [
      [39.9, 44.05],
      [39.75, 44.45],
      [39.63, 44.8],
    ],
  },
  {
    country: "İran",
    color: "#ea580c",
    coords: [
      [39.63, 44.8],
      [39.3, 44.4],
      [38.9, 44.3],
      [38.4, 44.4],
      [37.9, 44.6],
      [37.4, 44.75],
      [37.2, 44.78],
    ],
  },
  {
    country: "Irak",
    color: "#a16207",
    coords: [
      [37.2, 44.78],
      [37.25, 44.0],
      [37.32, 43.2],
      [37.35, 42.35],
    ],
  },
  {
    country: "Suriye",
    color: "#dc2626",
    coords: [
      [37.35, 42.35],
      [37.1, 41.5],
      [36.9, 40.6],
      [36.82, 39.6],
      [36.7, 38.7],
      [36.68, 37.8],
      [36.75, 37.1],
      [36.86, 36.7],
      [36.5, 36.6],
      [36.15, 36.4],
      [35.92, 35.95],
    ],
  },
];

export function borderPath(border: NeighborBorder): string {
  return border.coords
    .map(([lat, lon], i) => {
      const p = project(lat, lon);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(" ");
}

export function borderLabelPoint(border: NeighborBorder): { x: number; y: number } {
  const mid = border.coords[Math.floor(border.coords.length / 2)];
  return project(mid[0], mid[1]);
}

/**
 * Komşu ülkelerin yaklaşık kara alanları — haritanın estetiğini bozmadan
 * Türkiye'nin dışında farklı renkte bir kuşak olarak çizilir.
 * Koordinatlar (lat, lon); harita viewBox'ı dışarıyı zaten kırpar.
 */
export type NeighborArea = {
  country: string;
  coords: [number, number][];
  label: [number, number];
};

export const NEIGHBOR_AREAS: NeighborArea[] = [
  {
    country: "Bulgaristan",
    label: [41.95, 26.9],
    coords: [
      [41.74, 26.34],
      [41.92, 26.6],
      [41.98, 27.0],
      [42.0, 27.45],
      [42.03, 27.9],
      [42.9, 28.4],
      [42.9, 25.4],
      [41.9, 25.3],
    ],
  },
  {
    country: "Yunanistan",
    label: [41.15, 25.75],
    coords: [
      [40.86, 26.06],
      [41.0, 26.33],
      [41.3, 26.35],
      [41.55, 26.5],
      [41.74, 26.34],
      [41.9, 25.3],
      [40.2, 24.6],
      [40.3, 25.9],
    ],
  },
  {
    country: "Gürcistan",
    label: [41.9, 42.4],
    coords: [
      [41.52, 41.55],
      [41.45, 42.0],
      [41.55, 42.85],
      [41.2, 43.2],
      [41.1, 43.45],
      [42.9, 44.2],
      [42.9, 41.2],
    ],
  },
  {
    country: "Ermenistan",
    label: [40.6, 44.9],
    coords: [
      [41.1, 43.45],
      [40.7, 43.6],
      [40.3, 43.7],
      [40.05, 43.8],
      [39.9, 44.05],
      [40.4, 45.9],
      [41.6, 45.6],
      [42.0, 44.0],
    ],
  },
  {
    country: "Nahçıvan",
    label: [39.6, 45.1],
    coords: [
      [39.9, 44.05],
      [39.75, 44.45],
      [39.63, 44.8],
      [39.2, 45.4],
      [39.9, 45.6],
      [40.3, 45.0],
    ],
  },
  {
    country: "İran",
    label: [38.5, 45.6],
    coords: [
      [39.63, 44.8],
      [39.3, 44.4],
      [38.9, 44.3],
      [38.4, 44.4],
      [37.9, 44.6],
      [37.4, 44.75],
      [37.2, 44.78],
      [36.9, 46.6],
      [39.4, 46.6],
    ],
  },
  {
    country: "Irak",
    label: [36.7, 43.6],
    coords: [
      [37.35, 42.35],
      [37.32, 43.2],
      [37.25, 44.0],
      [37.2, 44.78],
      [35.9, 45.4],
      [34.8, 43.6],
      [34.8, 42.4],
    ],
  },
  {
    country: "Suriye",
    label: [36.1, 38.6],
    coords: [
      [37.35, 42.35],
      [37.1, 41.5],
      [36.9, 40.6],
      [36.82, 39.6],
      [36.7, 38.7],
      [36.68, 37.8],
      [36.75, 37.1],
      [36.86, 36.7],
      [36.5, 36.6],
      [36.15, 36.4],
      [35.92, 35.95],
      [34.6, 35.9],
      [34.6, 42.4],
    ],
  },
];

export function areaPath(area: NeighborArea): string {
  return (
    area.coords
      .map(([lat, lon], i) => {
        const p = project(lat, lon);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}

export function areaLabelPoint(area: NeighborArea): { x: number; y: number } {
  return project(area.label[0], area.label[1]);
}
