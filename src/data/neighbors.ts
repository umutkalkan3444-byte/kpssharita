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
    country: "Nahçıvan",
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
