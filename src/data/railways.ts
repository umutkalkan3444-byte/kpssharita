// Türkiye demiryolu ağı — bilgi kartı için yaklaşık hatlar (lat, lon).
import { project } from "@/lib/geo";

export type RailLine = {
  name: string;
  kind: "yht" | "konvansiyonel";
  coords: [number, number][];
};

export const RAIL_LINES: RailLine[] = [
  {
    name: "Ankara – Eskişehir – İstanbul (YHT)",
    kind: "yht",
    coords: [
      [39.93, 32.85],
      [39.78, 32.0],
      [39.77, 31.2],
      [39.78, 30.52],
      [40.1, 29.9],
      [40.5, 29.6],
      [40.78, 29.4],
      [40.88, 29.25],
      [41.01, 28.98],
    ],
  },
  {
    name: "Ankara – Konya (YHT)",
    kind: "yht",
    coords: [
      [39.93, 32.85],
      [39.4, 32.7],
      [38.7, 32.6],
      [38.0, 32.5],
      [37.87, 32.5],
    ],
  },
  {
    name: "Konya – Karaman (YHT)",
    kind: "yht",
    coords: [
      [37.87, 32.5],
      [37.3, 33.0],
      [37.18, 33.22],
    ],
  },
  {
    name: "Ankara – Sivas (YHT)",
    kind: "yht",
    coords: [
      [39.93, 32.85],
      [39.95, 33.5],
      [39.85, 34.8],
      [39.8, 35.8],
      [39.75, 37.02],
    ],
  },
  {
    name: "İstanbul – Edirne (Kapıkule)",
    kind: "konvansiyonel",
    coords: [
      [41.01, 28.98],
      [41.1, 28.3],
      [41.35, 27.5],
      [41.6, 26.8],
      [41.72, 26.36],
    ],
  },
  {
    name: "Eskişehir – İzmir (Ege hattı)",
    kind: "konvansiyonel",
    coords: [
      [39.78, 30.52],
      [39.4, 29.98],
      [38.9, 29.4],
      [38.68, 28.5],
      [38.55, 27.9],
      [38.42, 27.14],
    ],
  },
  {
    name: "İzmir – Aydın – Denizli",
    kind: "konvansiyonel",
    coords: [
      [38.42, 27.14],
      [38.0, 27.5],
      [37.85, 27.85],
      [37.8, 28.5],
      [37.78, 29.09],
    ],
  },
  {
    name: "Adana – Mersin – Konya",
    kind: "konvansiyonel",
    coords: [
      [37.0, 35.32],
      [36.9, 34.9],
      [36.8, 34.63],
      [37.0, 34.4],
      [37.4, 33.8],
      [37.7, 33.0],
      [37.87, 32.5],
    ],
  },
  {
    name: "Adana – Gaziantep – Diyarbakır – Kurtalan",
    kind: "konvansiyonel",
    coords: [
      [37.0, 35.32],
      [37.1, 36.3],
      [37.07, 37.38],
      [37.6, 38.3],
      [37.75, 39.3],
      [37.91, 40.24],
      [37.93, 41.3],
      [37.92, 41.94],
    ],
  },
  {
    name: "Kayseri – Sivas – Erzurum – Kars",
    kind: "konvansiyonel",
    coords: [
      [38.73, 35.48],
      [39.3, 36.3],
      [39.75, 37.02],
      [39.75, 38.5],
      [39.75, 39.5],
      [39.9, 41.17],
      [40.4, 42.0],
      [40.6, 43.1],
    ],
  },
  {
    name: "Ankara – Zonguldak (Karabük)",
    kind: "konvansiyonel",
    coords: [
      [39.93, 32.85],
      [40.4, 32.9],
      [40.85, 32.75],
      [41.2, 32.62],
      [41.45, 31.79],
    ],
  },
  {
    name: "Samsun – Sivas (Karadeniz bağlantısı)",
    kind: "konvansiyonel",
    coords: [
      [41.29, 36.33],
      [40.65, 36.2],
      [40.31, 36.55],
      [39.9, 37.1],
      [39.75, 37.02],
    ],
  },
  {
    name: "Balıkesir – Bandırma – Bursa",
    kind: "konvansiyonel",
    coords: [
      [39.65, 27.88],
      [40.05, 27.95],
      [40.35, 27.98],
      [40.22, 28.6],
      [40.19, 29.06],
    ],
  },
  {
    name: "Malatya – Elazığ – Tatvan (Van Gölü)",
    kind: "konvansiyonel",
    coords: [
      [38.35, 38.31],
      [38.68, 39.22],
      [38.75, 40.2],
      [38.5, 41.2],
      [38.5, 42.28],
    ],
  },
];

export function railPath(line: RailLine): string {
  return line.coords
    .map(([lat, lon], i) => {
      const p = project(lat, lon);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(" ");
}
