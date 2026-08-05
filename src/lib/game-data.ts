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

export const COMPASS_LAYOUT: ReadonlyArray<{
  direction: CompassDirection;
  label: string;
  x: number;
  y: number;
}> = [
  { direction: "N", label: "K", x: 500, y: 42 },
  { direction: "NE", label: "KD", x: 620, y: 90 },
  { direction: "E", label: "D", x: 674, y: 210 },
  { direction: "SE", label: "GD", x: 620, y: 330 },
  { direction: "S", label: "G", x: 500, y: 378 },
  { direction: "SW", label: "GB", x: 380, y: 330 },
  { direction: "W", label: "B", x: 326, y: 210 },
  { direction: "NW", label: "KB", x: 380, y: 90 },
];

const COMPASS_TARGETS = Object.fromEntries(
  COMPASS_LAYOUT.map(({ direction, x, y }) => [direction, { x, y }]),
) as Record<CompassDirection, { x: number; y: number }>;

export function targetsFor(category: Category): TargetPoint[] {
  const targets = category.items.map((it) => {
    if (category.slug === "ruzgarlar" && it.compassDirection) {
      const { x, y } = COMPASS_TARGETS[it.compassDirection];
      return { id: it.id, name: it.name, x, y, geoX: x, geoY: y };
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
