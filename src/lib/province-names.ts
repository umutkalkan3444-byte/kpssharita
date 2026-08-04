import provincesData from "@/data/turkey-provinces.json";
import { normalizePlaceName } from "@/lib/place-name";

const provinces = (provincesData as { provinces: { name: string }[] }).provinces;

export const PROVINCE_NAME_SET = new Set(provinces.map((p) => normalizePlaceName(p.name)));

/** İsim gerçek bir il adına karşılık geliyor mu? */
export function isProvinceName(name: string): boolean {
  return PROVINCE_NAME_SET.has(normalizePlaceName(name));
}

/** Kategorinin tüm öğeleri il adı mı? (il sürükleme modu için) */
export function allNamesAreProvinces(items: readonly { name: string }[]): boolean {
  return items.length > 0 && items.every((item) => isProvinceName(item.name));
}
