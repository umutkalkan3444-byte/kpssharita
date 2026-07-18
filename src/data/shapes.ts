// Gerçek coğrafi şekiller — elle yaklaşık çizilmiş polylines/polygons.
// Koordinatlar (lat, lon). Oyun içi görsel için yeterli hassasiyette.
// Yeni öğe eklemek için: SHAPES sözlüğüne müfredattaki `name` ile aynı anahtarı ekle.
import { project } from "@/lib/geo";

export type ShapeType = "polyline" | "polygon";
export type ShapeDef = { type: ShapeType; coords: [number, number][] };

export const SHAPES: Record<string, ShapeDef> = {
  // ============ AKARSULAR (kaynak → ağız) ============
  "Kızılırmak (ağız)": { type: "polyline", coords: [
    [39.30, 38.35], [39.65, 37.70], [39.75, 37.02], [39.30, 36.10],
    [39.05, 35.20], [39.15, 34.16], [39.85, 33.51], [40.15, 33.90],
    [40.55, 34.95], [41.10, 35.55], [41.72, 35.95],
  ]},
  "Yeşilırmak (ağız)": { type: "polyline", coords: [
    [39.80, 37.10], [40.10, 36.65], [40.31, 36.55], [40.55, 36.20],
    [40.65, 35.83], [40.85, 36.15], [41.10, 36.45], [41.28, 36.67],
  ]},
  "Sakarya (ağız)": { type: "polyline", coords: [
    [39.42, 32.20], [39.55, 31.60], [39.80, 31.05], [40.10, 30.55],
    [40.45, 30.35], [40.78, 30.40], [41.00, 30.55], [41.12, 30.63],
  ]},
  "Fırat": { type: "polyline", coords: [
    [39.90, 41.10], [39.55, 40.20], [39.10, 39.55], [38.68, 39.22],
    [38.35, 38.55], [37.95, 38.35], [37.55, 38.30], [37.20, 38.15],
    [36.85, 38.20], [36.55, 38.00],
  ]},
  "Dicle": { type: "polyline", coords: [
    [38.45, 39.55], [38.15, 40.00], [37.91, 40.24], [37.88, 41.05],
    [37.60, 41.80], [37.20, 42.10],
  ]},
  "Meriç": { type: "polyline", coords: [
    [41.80, 26.40], [41.68, 26.55], [41.30, 26.35], [40.92, 26.38], [40.75, 26.10],
  ]},
  "Aras": { type: "polyline", coords: [
    [40.05, 41.55], [40.30, 42.20], [40.40, 42.60], [40.25, 43.15],
    [40.05, 43.75], [39.92, 44.04], [39.65, 44.50],
  ]},
  "Çoruh": { type: "polyline", coords: [
    [40.15, 40.20], [40.46, 40.30], [40.65, 40.65], [40.90, 41.25],
    [41.18, 41.82], [41.52, 41.55],
  ]},
  "Seyhan": { type: "polyline", coords: [
    [38.30, 35.45], [37.90, 35.55], [37.40, 35.45], [37.00, 35.32], [36.75, 35.30],
  ]},
  "Ceyhan": { type: "polyline", coords: [
    [38.10, 37.10], [37.75, 36.90], [37.20, 36.80], [36.85, 35.95], [36.60, 35.60],
  ]},
  "B. Menderes": { type: "polyline", coords: [
    [38.20, 30.10], [38.05, 29.60], [37.90, 29.10], [37.85, 28.30],
    [37.72, 27.85], [37.55, 27.28],
  ]},
  "Göksu": { type: "polyline", coords: [
    [37.30, 33.20], [36.95, 33.45], [36.65, 33.80], [36.38, 33.93],
  ]},
  "Susurluk": { type: "polyline", coords: [
    [39.85, 29.10], [40.05, 28.55], [40.22, 28.30], [40.32, 28.55], [40.40, 28.62],
  ]},

  // ============ GÖLLER (polygon) ============
  "Van Gölü": { type: "polygon", coords: [
    [38.35, 42.55], [38.45, 42.30], [38.72, 42.25], [39.00, 42.50],
    [39.15, 42.85], [39.05, 43.30], [38.80, 43.55], [38.55, 43.60],
    [38.35, 43.45], [38.25, 43.10], [38.25, 42.80],
  ]},
  "İznik": { type: "polygon", coords: [
    [40.48, 29.35], [40.50, 29.55], [40.47, 29.80], [40.42, 29.85],
    [40.38, 29.65], [40.40, 29.40],
  ]},
  "Sapanca": { type: "polygon", coords: [
    [40.72, 30.10], [40.73, 30.30], [40.71, 30.42], [40.68, 30.32], [40.69, 30.15],
  ]},
  "Beyşehir": { type: "polygon", coords: [
    [37.98, 31.35], [37.92, 31.60], [37.78, 31.72], [37.58, 31.68],
    [37.48, 31.50], [37.55, 31.30], [37.75, 31.22], [37.90, 31.24],
  ]},
  "Eğirdir": { type: "polygon", coords: [
    [38.15, 30.72], [38.10, 30.95], [37.95, 30.98], [37.80, 30.92],
    [37.70, 30.80], [37.78, 30.65], [37.95, 30.68], [38.08, 30.70],
  ]},
  "Burdur": { type: "polygon", coords: [
    [37.86, 30.08], [37.80, 30.25], [37.70, 30.32], [37.60, 30.22],
    [37.65, 30.05], [37.76, 30.00],
  ]},
  "Manyas": { type: "polygon", coords: [
    [40.24, 27.88], [40.24, 28.06], [40.15, 28.10], [40.10, 28.00], [40.14, 27.88],
  ]},
  "Ulubat (Uluabat)": { type: "polygon", coords: [
    [40.24, 28.40], [40.22, 28.65], [40.15, 28.72], [40.10, 28.60], [40.15, 28.42],
  ]},
  "Salda": { type: "polygon", coords: [
    [37.58, 29.63], [37.58, 29.72], [37.52, 29.72], [37.51, 29.63],
  ]},
  "Nemrut Kalderası": { type: "polygon", coords: [
    [38.68, 42.20], [38.67, 42.28], [38.63, 42.29], [38.62, 42.22],
  ]},
  "Bafa": { type: "polygon", coords: [
    [37.55, 27.30], [37.53, 27.50], [37.46, 27.53], [37.45, 27.35],
  ]},
  "Köyceğiz": { type: "polygon", coords: [
    [36.98, 28.60], [36.97, 28.72], [36.90, 28.75], [36.87, 28.62],
  ]},
  "Çıldır": { type: "polygon", coords: [
    [41.08, 43.25], [41.08, 43.38], [40.98, 43.42], [40.97, 43.25],
  ]},
  "Marmara G. (Manisa)": { type: "polygon", coords: [
    [38.65, 27.98], [38.65, 28.10], [38.58, 28.12], [38.58, 27.98],
  ]},
  "Eber": { type: "polygon", coords: [
    [38.65, 31.05], [38.65, 31.25], [38.58, 31.28], [38.58, 31.05],
  ]},

  // ============ DAĞ SIRALARI (polyline sırt) ============
  "Kuzey Anadolu D.": { type: "polyline", coords: [
    [40.80, 30.55], [40.90, 32.60], [41.00, 34.60], [40.95, 36.50],
    [40.85, 38.50], [40.80, 40.30], [40.85, 41.30],
  ]},
  "Toroslar (Orta)": { type: "polyline", coords: [
    [37.10, 32.00], [37.20, 33.20], [37.35, 34.30], [37.55, 35.20], [37.70, 36.10],
  ]},
  "Batı Toroslar": { type: "polyline", coords: [
    [37.40, 29.50], [37.20, 30.20], [37.00, 30.80], [36.78, 31.20],
  ]},
  "Doğu Toroslar": { type: "polyline", coords: [
    [37.60, 36.40], [37.85, 37.30], [38.10, 38.20], [38.30, 39.20],
  ]},
  "Aladağlar": { type: "polyline", coords: [
    [37.60, 35.00], [37.80, 35.20], [38.00, 35.35],
  ]},
  "Bolkar Dağları": { type: "polyline", coords: [
    [37.25, 34.20], [37.40, 34.60], [37.55, 34.95],
  ]},
  "Kaçkar Dağları": { type: "polyline", coords: [
    [40.70, 40.80], [40.83, 41.15], [40.95, 41.50],
  ]},
  "Munzur Dağları": { type: "polyline", coords: [
    [39.20, 39.00], [39.40, 39.30], [39.55, 39.65],
  ]},
  "Nur (Amanos)": { type: "polyline", coords: [
    [36.30, 36.20], [36.55, 36.28], [36.85, 36.40], [37.10, 36.55],
  ]},
  "Kaz Dağı": { type: "polyline", coords: [
    [39.65, 26.70], [39.72, 26.90], [39.78, 27.10],
  ]},
  "Bozdağlar": { type: "polyline", coords: [
    [38.25, 27.90], [38.32, 28.15], [38.40, 28.45],
  ]},
  "Aydın Dağları": { type: "polyline", coords: [
    [37.90, 27.90], [37.95, 28.15], [38.00, 28.45],
  ]},
  "Menteşe Dağları": { type: "polyline", coords: [
    [37.20, 28.20], [37.30, 28.60], [37.45, 29.00],
  ]},
  "Madra Dağı": { type: "polyline", coords: [
    [39.15, 27.00], [39.20, 27.10], [39.25, 27.20],
  ]},

  // ============ DELTA OVALARI (polygon) ============
  "Çukurova (Seyhan-Ceyhan)": { type: "polygon", coords: [
    [37.10, 35.10], [37.10, 35.85], [36.55, 35.80], [36.45, 35.20],
  ]},
  "Bafra Ovası": { type: "polygon", coords: [
    [41.65, 35.70], [41.78, 36.15], [41.50, 36.22], [41.42, 35.75],
  ]},
  "Çarşamba Ovası": { type: "polygon", coords: [
    [41.32, 36.55], [41.38, 36.95], [41.12, 37.00], [41.08, 36.60],
  ]},
  "Gediz Deltası": { type: "polygon", coords: [
    [38.65, 26.75], [38.65, 27.02], [38.48, 27.05], [38.48, 26.80],
  ]},
  "B. Menderes Deltası": { type: "polygon", coords: [
    [37.62, 27.08], [37.62, 27.42], [37.48, 27.44], [37.48, 27.12],
  ]},
  "Bakırçay Deltası": { type: "polygon", coords: [
    [39.15, 26.75], [39.15, 26.95], [39.02, 26.98], [39.02, 26.78],
  ]},
  "Silifke (Göksu)": { type: "polygon", coords: [
    [36.42, 33.85], [36.42, 34.00], [36.32, 34.02], [36.32, 33.85],
  ]},
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
