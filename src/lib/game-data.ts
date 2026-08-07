// Geriye uyumlu düz kategori API'si. Hiyerarşi src/data/curriculum.ts'de.
import { project } from "./geo";
import { SHAPES, projectShapePath } from "@/data/shapes";
import {
  MAIN_CATEGORIES,
  MAIN_MAP,
  SUBCATEGORY_MAP,
  type Subcategory,
  type MainCategory,
  type GameItem,
  type MapVariant,
  type CompassDirection,
} from "@/data/curriculum";

export { MAIN_CATEGORIES, MAIN_MAP, SUBCATEGORY_MAP };
export type { Subcategory, MainCategory, GameItem, MapVariant, CompassDirection };

// Oyunun kullandığı düzleştirilmiş kategori tipi.
export type Category = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  gradient: string;
  mainSlug: string;
  mainTitle: string;
  mapVariant: MapVariant;
  items: {
    id: string;
    name: string;
    lat: number;
    lon: number;
    hint?: string;
    compassDirection?: CompassDirection;
  }[];
};

function buildCategory(main: MainCategory, sub: Subcategory): Category {
  return {
    slug: sub.slug,
    title: sub.title,
    emoji: sub.emoji ?? main.emoji,
    description: sub.description ?? main.description,
    gradient: main.gradient,
    mainSlug: main.slug,
    mainTitle: main.title,
    mapVariant: sub.mapVariant ?? "provinces",
    items: sub.items.map((it, i) => ({
      id: `${sub.slug}-${i}`,
      name: it.name,
      lat: it.lat,
      lon: it.lon,
      hint: it.hint,
      compassDirection: it.compassDirection,
    })),
  };
}

export const CATEGORIES: Category[] = MAIN_CATEGORIES.flatMap((m) =>
  m.subs.map((s) => buildCategory(m, s)),
);

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

export type TargetPoint = {
  id: string;
  name: string;
  /** Sürükleme hedefinin doğrulanmış harita konumu. */
  x: number;
  y: number;
  /** Çizgi/alan katmanları için aynı gerçek harita konumu. */
  geoX: number;
  geoY: number;
  shape?: { type: "polyline" | "polygon"; d: string };
};

const SHAPE_CATEGORY_SLUGS = new Set([
  "akarsular",
  "tektonik-goller",
  "volkanik-goller",
  "karstik-goller",
  "aluvyon-set",
  "kiyi-set",
  "heyelan-set",
  "tum-daglar",
  "kivrim-daglari",
  "kirik-daglari",
  "volkanik-daglar",
  "delta-ovalari",
  "otoyollar",
  "dogalgaz-boru-hatlari",
]);

/**
 * Rüzgârlar haritada pusula gülü yerine, geldikleri yönden Türkiye'nin
 * üzerine doğru uzanan oklarla gösterilir (ör. Yıldız kuzeyden güneye).
 */
const COMPASS_VECTORS: Record<CompassDirection, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  NE: { dx: 0.7071, dy: -0.7071 },
  E: { dx: 1, dy: 0 },
  SE: { dx: 0.7071, dy: 0.7071 },
  S: { dx: 0, dy: 1 },
  SW: { dx: -0.7071, dy: 0.7071 },
  W: { dx: -1, dy: 0 },
  NW: { dx: -0.7071, dy: -0.7071 },
};

const WIND_CENTER = { x: 500, y: 205 };
const WIND_OUTER = { x: 480, y: 215 };
const WIND_INNER_RATIO = 0.42;

export const COMPASS_LAYOUT: ReadonlyArray<{
  direction: CompassDirection;
  label: string;
  x: number;
  y: number;
}> = (
  [
    ["N", "K"],
    ["NE", "KD"],
    ["E", "D"],
    ["SE", "GD"],
    ["S", "G"],
    ["SW", "GB"],
    ["W", "B"],
    ["NW", "KB"],
  ] as const
).map(([direction, label]) => {
  const v = COMPASS_VECTORS[direction];
  return {
    direction,
    label,
    x: WIND_CENTER.x + v.dx * WIND_OUTER.x,
    y: WIND_CENTER.y + v.dy * WIND_OUTER.y,
  };
});

function windArrow(direction: CompassDirection): {
  x: number;
  y: number;
  d: string;
} {
  const v = COMPASS_VECTORS[direction];
  const sx = WIND_CENTER.x + v.dx * WIND_OUTER.x;
  const sy = WIND_CENTER.y + v.dy * WIND_OUTER.y;
  const ex = WIND_CENTER.x + v.dx * WIND_OUTER.x * WIND_INNER_RATIO;
  const ey = WIND_CENTER.y + v.dy * WIND_OUTER.y * WIND_INNER_RATIO;
  return {
    x: (sx + ex) / 2,
    y: (sy + ey) / 2,
    d: `M${sx.toFixed(1)},${sy.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`,
  };
}


export function targetsFor(category: Category): TargetPoint[] {
  const targets = category.items.map((it) => {
    if (category.slug === "ruzgarlar" && it.compassDirection) {
      const arrow = windArrow(it.compassDirection);
      return {
        id: it.id,
        name: it.name,
        x: arrow.x,
        y: arrow.y,
        geoX: arrow.x,
        geoY: arrow.y,
        shape: { type: "polyline" as const, d: arrow.d },
      };
    }

    // Aynı ad farklı kavramlarda kullanılabilir (ör. Burdur ili/gölü veya
    // Seyhan nehri/barajı). Şekil yalnız anlamı açık coğrafya kategorilerinde
    // bağlanır; ad eşleşmesi tek başına yeterli kabul edilmez.
    const def = SHAPE_CATEGORY_SLUGS.has(category.slug) ? SHAPES[it.name] : undefined;
    // Sürükleme hedefi her zaman doğrulanmış veri koordinatında kalır.
    // Uzun bir çizginin geometrik merkezi, dağın/akarsuyun öğretim için
    // seçilmiş işaret noktasını bozabildiğinden sadece şeklin çizimi için
    // SHAPES kullanılır.
    const { x, y } = project(it.lat, it.lon);
    if (def) {
      return {
        id: it.id,
        name: it.name,
        x,
        y,
        geoX: x,
        geoY: y,
        shape: { type: def.type, d: projectShapePath(def) },
      };
    }
    return { id: it.id, name: it.name, x, y, geoX: x, geoY: y };
  });
  return targets;
}

export function categoriesForMain(mainSlug: string): Category[] {
  const m = MAIN_MAP[mainSlug];
  if (!m) return [];
  return m.subs.map((s) => buildCategory(m, s));
}
