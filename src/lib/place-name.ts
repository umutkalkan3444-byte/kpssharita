/**
 * Harita verisindeki eski/kısa il adları ile kullanıcıya gösterilen resmî
 * adları aynı anahtarda buluşturur.
 */
export function normalizePlaceName(value: string): string {
  const normalized = value
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/â/g, "a")
    .replace(/[^a-z0-9]/g, "");

  // Harita geometrisi tarihsel olarak "Afyon" adını kullanıyor; kartlarda
  // resmî il adı olan "Afyonkarahisar" gösteriliyor.
  return normalized === "afyonkarahisar" ? "afyon" : normalized;
}
