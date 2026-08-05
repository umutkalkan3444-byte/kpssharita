import { isProvinceName } from "./province-names";
import { REGION_ILLERI_SLUGS } from "./geo";
import { normalizePlaceName } from "./place-name";

/**
 * İl adlarını kart olarak öğreten kategoriler tıklamalı moda geçemez
 * (soru zaten ilin kendisi olur). Bunlar sürüklemeli kalır.
 */
const CLICK_EXCLUDED_SLUGS = new Set<string>(["iller-81", ...Object.keys(REGION_ILLERI_SLUGS)]);

/**
 * Bir kart "dümdüz il seçimi" mi? (ör. "Konya") → tıklamalı.
 * "TÜBİTAK-MAM (Kocaeli)" gibi tesis adları → sürüklemeli.
 */
export function splitGameItems<T extends { name: string }>(
  slug: string,
  items: readonly T[],
): { clickItems: T[]; dragItems: T[] } {
  if (CLICK_EXCLUDED_SLUGS.has(slug)) return { clickItems: [], dragItems: [...items] };
  const clickItems: T[] = [];
  const dragItems: T[] = [];
  const used = new Set<string>();
  for (const item of items) {
    const key = normalizePlaceName(item.name);
    if (isProvinceName(item.name) && !used.has(key)) {
      used.add(key);
      clickItems.push(item);
    } else {
      dragItems.push(item);
    }
  }
  return { clickItems, dragItems };
}

export function gameModeLabel(hasClick: boolean, hasDrag: boolean): string | null {
  if (hasClick && hasDrag) return "Karma";
  if (hasClick) return "Tıklamalı";
  if (hasDrag) return "Sürüklemeli";
  return null;
}
