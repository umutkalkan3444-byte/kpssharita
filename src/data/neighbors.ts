// Natural Earth 1:50m Admin-0 country polygons (public domain), reduced to
// Türkiye's eight land neighbours. Keeping the real polygons here prevents
// the Mediterranean and Black Sea from being painted as neighbouring land.
import neighborCountryData from "@/data/neighbor-countries.json";
import { MAP_H, MAP_W, project } from "@/lib/geo";

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
  label: [number, number]; // [latitude, longitude]
  shortLabel?: string;
};

export type NeighborArea = NeighborSource & NeighborAppearance;

const APPEARANCE: Record<string, NeighborAppearance> = {
  Yunanistan: { fill: "#f4ead9", label: [40.95, 25.85] },
  Bulgaristan: { fill: "#eee0cb", label: [41.94, 26.95] },
  Gürcistan: { fill: "#f2e5d1", label: [41.9, 42.35] },
  Ermenistan: { fill: "#ead9c2", label: [40.6, 44.55] },
  "Azerbaycan (Nahçıvan)": {
    fill: "#f1dfc5",
    label: [39.72, 44.55],
    shortLabel: "Nahçıvan",
  },
  İran: { fill: "#ead6ba", label: [38.55, 44.55] },
  Irak: { fill: "#efe0c8", label: [36.62, 43.45] },
  Suriye: { fill: "#f4e6d1", label: [36.42, 38.7] },
};

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

export function areaPath(area: NeighborArea): string {
  const polygons =
    area.geometry.type === "Polygon"
      ? [area.geometry.coordinates]
      : area.geometry.coordinates;

  return polygons
    .flatMap((polygon) => polygon.map((ring) => ringPath(ring)))
    .join(" ");
}

export function areaLabelPoint(area: NeighborArea): {
  x: number;
  y: number;
  text: string;
} {
  const point = project(area.label[0], area.label[1]);
  return {
    x: Math.min(MAP_W - 34, Math.max(34, point.x)),
    y: Math.min(MAP_H - 14, Math.max(14, point.y)),
    text: area.shortLabel ?? area.country,
  };
}
