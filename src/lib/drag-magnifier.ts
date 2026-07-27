import { normalizePlaceName } from "./place-name";

const CROWDED_OR_SMALL_PROVINCES = new Set(
  [
    "İstanbul",
    "Kocaeli",
    "Yalova",
    "Sakarya",
    "Düzce",
    "Bilecik",
    "Bursa",
    "Zonguldak",
    "Bartın",
    "Karabük",
    "Bayburt",
    "Gümüşhane",
    "Rize",
    "Trabzon",
    "Giresun",
    "Ordu",
    "Kilis",
    "Osmaniye",
    "Hatay",
    "Iğdır",
  ].map(normalizePlaceName),
);

export function needsProvinceDragMagnifier(
  categorySlug: string,
  mainSlug: string,
  cardName: string,
): boolean {
  const provinceGame =
    categorySlug === "iller-81" ||
    categorySlug.endsWith("-illeri") ||
    mainSlug === "bolgeler-idari";
  return provinceGame && CROWDED_OR_SMALL_PROVINCES.has(normalizePlaceName(cardName));
}
