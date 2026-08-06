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
  label: [number, number]; // [latitude, longitude]
  overlapWidth: number;
  shortLabel?: string;
};

export type NeighborArea = NeighborSource & NeighborAppearance;

const APPEARANCE: Record<string, NeighborAppearance> = {
  Yunanistan: { fill: "#f4ead9", label: [40.65, 25.25], overlapWidth: 2.5 },
  Bulgaristan: { fill: "#eee0cb", label: [42.35, 27], overlapWidth: 3 },
  Gürcistan: { fill: "#f2e5d1", label: [42.35, 42.2], overlapWidth: 3.5 },
  Ermenistan: { fill: "#ead9c2", label: [40.4, 44.95], overlapWidth: 4 },
  "Azerbaycan (Nahçıvan)": {
    fill: "#f1dfc5",
    label: [39.7, 44.85],
    overlapWidth: 4,
    shortLabel: "Azerbaycan",
  },
  İran: { fill: "#ead6ba", label: [38.35, 45.05], overlapWidth: 4.5 },
  Irak: { fill: "#efe0c8", label: [36.7, 44.6], overlapWidth: 4 },
  Suriye: { fill: "#f4e6d1", label: [36.2, 39], overlapWidth: 3.5 },
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
    x: point.x,
    y: point.y,
    text: area.shortLabel ?? area.country,
  };
}
