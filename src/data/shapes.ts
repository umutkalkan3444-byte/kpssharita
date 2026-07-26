// Gerçek coğrafi şekiller — elle yaklaşık çizilmiş polylines/polygons.
// Koordinatlar (lat, lon). Oyun içi görsel için yeterli hassasiyette.
// Yeni öğe eklemek için: SHAPES sözlüğüne müfredattaki `name` ile aynı anahtarı ekle.
import { project } from "@/lib/geo";

export type ShapeType = "polyline" | "polygon";
export type ShapeDef = { type: ShapeType; coords: [number, number][] };

export const SHAPES: Record<string, ShapeDef> = {
  // ============ AKARSULAR (kaynak → ağız) ============
  "Kızılırmak (ağız)": {
    type: "polyline",
    coords: [
      [39.3, 38.35],
      [39.65, 37.7],
      [39.75, 37.02],
      [39.3, 36.1],
      [39.05, 35.2],
      [39.15, 34.16],
      [39.85, 33.51],
      [40.15, 33.9],
      [40.55, 34.95],
      [41.1, 35.55],
      [41.72, 35.95],
    ],
  },
  "Yeşilırmak (ağız)": {
    type: "polyline",
    coords: [
      [39.8, 37.1],
      [40.1, 36.65],
      [40.31, 36.55],
      [40.55, 36.2],
      [40.65, 35.83],
      [40.85, 36.15],
      [41.1, 36.45],
      [41.28, 36.67],
    ],
  },
  "Sakarya (ağız)": {
    type: "polyline",
    coords: [
      [39.42, 32.2],
      [39.55, 31.6],
      [39.8, 31.05],
      [40.1, 30.55],
      [40.45, 30.35],
      [40.78, 30.4],
      [41.0, 30.55],
      [41.12, 30.63],
    ],
  },
  Fırat: {
    type: "polyline",
    coords: [
      [39.9, 41.1],
      [39.55, 40.2],
      [39.1, 39.55],
      [38.68, 39.22],
      [38.35, 38.55],
      [37.95, 38.35],
      [37.55, 38.3],
      [37.2, 38.15],
      [36.85, 38.2],
      [36.55, 38.0],
    ],
  },
  Dicle: {
    type: "polyline",
    coords: [
      [38.45, 39.55],
      [38.15, 40.0],
      [37.91, 40.24],
      [37.88, 41.05],
      [37.6, 41.8],
      [37.2, 42.1],
    ],
  },
  Meriç: {
    type: "polyline",
    coords: [
      [41.8, 26.4],
      [41.68, 26.55],
      [41.3, 26.35],
      [40.92, 26.38],
      [40.75, 26.1],
    ],
  },
  Aras: {
    type: "polyline",
    coords: [
      [40.05, 41.55],
      [40.3, 42.2],
      [40.4, 42.6],
      [40.25, 43.15],
      [40.05, 43.75],
      [39.92, 44.04],
      [39.65, 44.5],
    ],
  },
  Çoruh: {
    type: "polyline",
    coords: [
      [40.15, 40.2],
      [40.46, 40.3],
      [40.65, 40.65],
      [40.9, 41.25],
      [41.18, 41.82],
      [41.52, 41.55],
    ],
  },
  Seyhan: {
    type: "polyline",
    coords: [
      [38.3, 35.45],
      [37.9, 35.55],
      [37.4, 35.45],
      [37.0, 35.32],
      [36.75, 35.3],
    ],
  },
  Ceyhan: {
    type: "polyline",
    coords: [
      [38.1, 37.1],
      [37.75, 36.9],
      [37.2, 36.8],
      [36.85, 35.95],
      [36.6, 35.6],
    ],
  },
  "B. Menderes": {
    type: "polyline",
    coords: [
      [38.2, 30.1],
      [38.05, 29.6],
      [37.9, 29.1],
      [37.85, 28.3],
      [37.72, 27.85],
      [37.55, 27.28],
    ],
  },
  Göksu: {
    type: "polyline",
    coords: [
      [37.3, 33.2],
      [36.95, 33.45],
      [36.65, 33.8],
      [36.38, 33.93],
    ],
  },
  Susurluk: {
    type: "polyline",
    coords: [
      [39.85, 29.1],
      [40.05, 28.55],
      [40.22, 28.3],
      [40.32, 28.55],
      [40.4, 28.62],
    ],
  },

  // ============ GÖLLER (polygon) ============
  "Van Gölü": {
    type: "polygon",
    coords: [
      [38.35, 42.55],
      [38.45, 42.3],
      [38.72, 42.25],
      [39.0, 42.5],
      [39.15, 42.85],
      [39.05, 43.3],
      [38.8, 43.55],
      [38.55, 43.6],
      [38.35, 43.45],
      [38.25, 43.1],
      [38.25, 42.8],
    ],
  },
  İznik: {
    type: "polygon",
    coords: [
      [40.48, 29.35],
      [40.5, 29.55],
      [40.47, 29.8],
      [40.42, 29.85],
      [40.38, 29.65],
      [40.4, 29.4],
    ],
  },
  Sapanca: {
    type: "polygon",
    coords: [
      [40.72, 30.1],
      [40.73, 30.3],
      [40.71, 30.42],
      [40.68, 30.32],
      [40.69, 30.15],
    ],
  },
  Beyşehir: {
    type: "polygon",
    coords: [
      [37.98, 31.35],
      [37.92, 31.6],
      [37.78, 31.72],
      [37.58, 31.68],
      [37.48, 31.5],
      [37.55, 31.3],
      [37.75, 31.22],
      [37.9, 31.24],
    ],
  },
  Eğirdir: {
    type: "polygon",
    coords: [
      [38.15, 30.72],
      [38.1, 30.95],
      [37.95, 30.98],
      [37.8, 30.92],
      [37.7, 30.8],
      [37.78, 30.65],
      [37.95, 30.68],
      [38.08, 30.7],
    ],
  },
  Burdur: {
    type: "polygon",
    coords: [
      [37.86, 30.08],
      [37.8, 30.25],
      [37.7, 30.32],
      [37.6, 30.22],
      [37.65, 30.05],
      [37.76, 30.0],
    ],
  },
  Manyas: {
    type: "polygon",
    coords: [
      [40.24, 27.88],
      [40.24, 28.06],
      [40.15, 28.1],
      [40.1, 28.0],
      [40.14, 27.88],
    ],
  },
  "Ulubat (Uluabat)": {
    type: "polygon",
    coords: [
      [40.24, 28.4],
      [40.22, 28.65],
      [40.15, 28.72],
      [40.1, 28.6],
      [40.15, 28.42],
    ],
  },
  Salda: {
    type: "polygon",
    coords: [
      [37.58, 29.63],
      [37.58, 29.72],
      [37.52, 29.72],
      [37.51, 29.63],
    ],
  },
  "Nemrut Kalderası": {
    type: "polygon",
    coords: [
      [38.68, 42.2],
      [38.67, 42.28],
      [38.63, 42.29],
      [38.62, 42.22],
    ],
  },
  Bafa: {
    type: "polygon",
    coords: [
      [37.55, 27.3],
      [37.53, 27.5],
      [37.46, 27.53],
      [37.45, 27.35],
    ],
  },
  Köyceğiz: {
    type: "polygon",
    coords: [
      [36.98, 28.6],
      [36.97, 28.72],
      [36.9, 28.75],
      [36.87, 28.62],
    ],
  },
  Çıldır: {
    type: "polygon",
    coords: [
      [41.08, 43.25],
      [41.08, 43.38],
      [40.98, 43.42],
      [40.97, 43.25],
    ],
  },
  "Marmara G. (Manisa)": {
    type: "polygon",
    coords: [
      [38.65, 27.98],
      [38.65, 28.1],
      [38.58, 28.12],
      [38.58, 27.98],
    ],
  },
  Eber: {
    type: "polygon",
    coords: [
      [38.65, 31.05],
      [38.65, 31.25],
      [38.58, 31.28],
      [38.58, 31.05],
    ],
  },

  // ============ DAĞ SIRALARI (polyline sırt) ============
  "Kuzey Anadolu D.": {
    type: "polyline",
    coords: [
      [40.8, 30.55],
      [40.9, 32.6],
      [41.0, 34.6],
      [40.95, 36.5],
      [40.85, 38.5],
      [40.8, 40.3],
      [40.85, 41.3],
    ],
  },
  "Toroslar (Orta)": {
    type: "polyline",
    coords: [
      [37.1, 32.0],
      [37.2, 33.2],
      [37.35, 34.3],
      [37.55, 35.2],
      [37.7, 36.1],
    ],
  },
  "Batı Toroslar": {
    type: "polyline",
    coords: [
      [37.4, 29.5],
      [37.2, 30.2],
      [37.0, 30.8],
      [36.78, 31.2],
    ],
  },
  "Doğu Toroslar": {
    type: "polyline",
    coords: [
      [37.6, 36.4],
      [37.85, 37.3],
      [38.1, 38.2],
      [38.3, 39.2],
    ],
  },
  Aladağlar: {
    type: "polyline",
    coords: [
      [37.6, 35.0],
      [37.8, 35.2],
      [38.0, 35.35],
    ],
  },
  "Bolkar Dağları": {
    type: "polyline",
    coords: [
      [37.25, 34.2],
      [37.4, 34.6],
      [37.55, 34.95],
    ],
  },
  "Kaçkar Dağları": {
    type: "polyline",
    coords: [
      [40.7, 40.8],
      [40.83, 41.15],
      [40.95, 41.5],
    ],
  },
  "Munzur Dağları": {
    type: "polyline",
    coords: [
      [39.2, 39.0],
      [39.4, 39.3],
      [39.55, 39.65],
    ],
  },
  "Nur (Amanos)": {
    type: "polyline",
    coords: [
      [36.3, 36.2],
      [36.55, 36.28],
      [36.85, 36.4],
      [37.1, 36.55],
    ],
  },
  "Kaz Dağı": {
    type: "polyline",
    coords: [
      [39.65, 26.7],
      [39.72, 26.9],
      [39.78, 27.1],
    ],
  },
  Bozdağlar: {
    type: "polyline",
    coords: [
      [38.25, 27.9],
      [38.32, 28.15],
      [38.4, 28.45],
    ],
  },
  "Aydın Dağları": {
    type: "polyline",
    coords: [
      [37.9, 27.9],
      [37.95, 28.15],
      [38.0, 28.45],
    ],
  },
  "Menteşe Dağları": {
    type: "polyline",
    coords: [
      [37.2, 28.2],
      [37.3, 28.6],
      [37.45, 29.0],
    ],
  },
  "Madra Dağı": {
    type: "polyline",
    coords: [
      [39.15, 27.0],
      [39.2, 27.1],
      [39.25, 27.2],
    ],
  },
  "Yunt Dağı": {
    type: "polyline",
    coords: [
      [38.72, 27.18],
      [38.85, 27.35],
      [39.0, 27.48],
    ],
  },

  // ============ DELTA OVALARI (polygon) ============
  "Çukurova (Seyhan-Ceyhan)": {
    type: "polygon",
    coords: [
      [37.1, 35.1],
      [37.1, 35.85],
      [36.55, 35.8],
      [36.45, 35.2],
    ],
  },
  "Bafra Ovası": {
    type: "polygon",
    coords: [
      [41.65, 35.7],
      [41.78, 36.15],
      [41.5, 36.22],
      [41.42, 35.75],
    ],
  },
  "Çarşamba Ovası": {
    type: "polygon",
    coords: [
      [41.32, 36.55],
      [41.38, 36.95],
      [41.12, 37.0],
      [41.08, 36.6],
    ],
  },
  "Gediz Deltası": {
    type: "polygon",
    coords: [
      [38.65, 26.75],
      [38.65, 27.02],
      [38.48, 27.05],
      [38.48, 26.8],
    ],
  },
  "B. Menderes Deltası": {
    type: "polygon",
    coords: [
      [37.62, 27.08],
      [37.62, 27.42],
      [37.48, 27.44],
      [37.48, 27.12],
    ],
  },
  "Bakırçay Deltası": {
    type: "polygon",
    coords: [
      [39.15, 26.75],
      [39.15, 26.95],
      [39.02, 26.98],
      [39.02, 26.78],
    ],
  },
  "Silifke (Göksu)": {
    type: "polygon",
    coords: [
      [36.42, 33.85],
      [36.42, 34.0],
      [36.32, 34.02],
      [36.32, 33.85],
    ],
  },
};

export function projectShapePath(def: ShapeDef): string {
  const pts = def.coords.map(([lat, lon]) => project(lat, lon));
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  return def.type === "polygon" ? d + " Z" : d;
}

export function shapeCentroid(def: ShapeDef): { x: number; y: number } {
  const pts = def.coords.map(([lat, lon]) => project(lat, lon));
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return { x: cx, y: cy };
}
