// Geriye uyumlu düz kategori API'si. Hiyerarşi src/data/curriculum.ts'de.
import { project } from "./geo";
import { SHAPES, projectShapePath, shapeCentroid } from "@/data/shapes";
import {
  MAIN_CATEGORIES,
  MAIN_MAP,
  SUBCATEGORY_MAP,
  type Subcategory,
  type MainCategory,
  type GameItem,
  type MapVariant,
} from "@/data/curriculum";

export { MAIN_CATEGORIES, MAIN_MAP, SUBCATEGORY_MAP };
export type { Subcategory, MainCategory, GameItem, MapVariant };

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
  items: { id: string; name: string; lat: number; lon: number; hint?: string }[];
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
  x: number;
  y: number;
  shape?: { type: "polyline" | "polygon"; d: string };
};

export function targetsFor(category: Category): TargetPoint[] {
  // Lazy import to avoid circulars at module init
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SHAPES, projectShapePath, shapeCentroid } = require("@/data/shapes") as typeof import("@/data/shapes");
  return category.items.map((it) => {
    const def = SHAPES[it.name];
    if (def) {
      const c = shapeCentroid(def);
      return {
        id: it.id,
        name: it.name,
        x: c.x,
        y: c.y,
        shape: { type: def.type, d: projectShapePath(def) },
      };
    }
    const { x, y } = project(it.lat, it.lon);
    return { id: it.id, name: it.name, x, y };
  });
}

export function categoriesForMain(mainSlug: string): Category[] {
  const m = MAIN_MAP[mainSlug];
  if (!m) return [];
  return m.subs.map((s) => buildCategory(m, s));
}
