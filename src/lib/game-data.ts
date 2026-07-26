// Geriye uyumlu düz kategori API'si. Hiyerarşi src/data/curriculum.ts'de.
import { MAP_H, MAP_W, project } from "./geo";
import { SHAPES, projectShapePath } from "@/data/shapes";
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
  /** Görünen sürükleme hedefi; yakın hedeflerde okunabilirlik için ayrıştırılabilir. */
  x: number;
  y: number;
  /** Doğrulanmış gerçek harita konumu; doğru yerleşim ve kılavuz çizgisi burada kalır. */
  geoX: number;
  geoY: number;
  shape?: { type: "polyline" | "polygon"; d: string };
};

const MIN_DROP_DISTANCE = 42;
const DROP_EDGE_MARGIN = 22;
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
]);

/**
 * Aynı şehirde ya da birbirine çok yakın olan hedefleri görünür biçimde
 * yelpazeler. Coğrafi konum değişmez; UI hedefi ile gerçek nokta arasındaki
 * kılavuz çizgisini GameBoard çizer.
 */
function separateCloseDropAnchors(points: TargetPoint[]): TargetPoint[] {
  const visited = new Set<number>();
  const result = points.map((point) => ({ ...point }));

  for (let start = 0; start < points.length; start++) {
    if (visited.has(start)) continue;
    const cluster: number[] = [];
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const index = queue.shift()!;
      cluster.push(index);
      for (let candidate = 0; candidate < points.length; candidate++) {
        if (visited.has(candidate)) continue;
        const distance = Math.hypot(
          points[index].geoX - points[candidate].geoX,
          points[index].geoY - points[candidate].geoY,
        );
        if (distance < MIN_DROP_DISTANCE) {
          visited.add(candidate);
          queue.push(candidate);
        }
      }
    }

    if (cluster.length < 2) continue;
    const centerX = cluster.reduce((sum, index) => sum + points[index].geoX, 0) / cluster.length;
    const centerY = cluster.reduce((sum, index) => sum + points[index].geoY, 0) / cluster.length;
    const radius = Math.max(19, cluster.length * 9);

    cluster
      .slice()
      .sort((a, b) => points[a].name.localeCompare(points[b].name, "tr"))
      .forEach((pointIndex, order) => {
        const angle = -Math.PI / 2 + (order / cluster.length) * Math.PI * 2;
        result[pointIndex].x = Math.min(
          MAP_W - DROP_EDGE_MARGIN,
          Math.max(DROP_EDGE_MARGIN, centerX + Math.cos(angle) * radius),
        );
        result[pointIndex].y = Math.min(
          MAP_H - DROP_EDGE_MARGIN,
          Math.max(DROP_EDGE_MARGIN, centerY + Math.sin(angle) * radius),
        );
      });
  }

  // Yelpaze başka bir bağımsız hedefe yaklaşmışsa küçük ve deterministik bir
  // itme turuyla tüm görünür butonlar arasında aynı asgari mesafeyi koru.
  for (let iteration = 0; iteration < 48; iteration++) {
    let changed = false;
    for (let first = 0; first < result.length; first++) {
      for (let second = first + 1; second < result.length; second++) {
        let dx = result[second].x - result[first].x;
        let dy = result[second].y - result[first].y;
        let distance = Math.hypot(dx, dy);
        if (distance >= MIN_DROP_DISTANCE) continue;
        if (distance < 0.001) {
          const angle = ((first + 1) * 2.399_963_229_7) % (Math.PI * 2);
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }
        const push = (MIN_DROP_DISTANCE - distance) / 2 + 0.05;
        const ux = dx / distance;
        const uy = dy / distance;
        result[first].x = Math.min(
          MAP_W - DROP_EDGE_MARGIN,
          Math.max(DROP_EDGE_MARGIN, result[first].x - ux * push),
        );
        result[first].y = Math.min(
          MAP_H - DROP_EDGE_MARGIN,
          Math.max(DROP_EDGE_MARGIN, result[first].y - uy * push),
        );
        result[second].x = Math.min(
          MAP_W - DROP_EDGE_MARGIN,
          Math.max(DROP_EDGE_MARGIN, result[second].x + ux * push),
        );
        result[second].y = Math.min(
          MAP_H - DROP_EDGE_MARGIN,
          Math.max(DROP_EDGE_MARGIN, result[second].y + uy * push),
        );
        changed = true;
      }
    }
    if (!changed) break;
  }

  return result;
}

export function targetsFor(category: Category): TargetPoint[] {
  const targets = category.items.map((it) => {
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
  return category.slug === "iller-81" ? targets : separateCloseDropAnchors(targets);
}

export function categoriesForMain(mainSlug: string): Category[] {
  const m = MAIN_MAP[mainSlug];
  if (!m) return [];
  return m.subs.map((s) => buildCategory(m, s));
}
