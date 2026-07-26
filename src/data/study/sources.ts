export type StudySource = {
  id: string;
  title: string;
  publisher: string;
  kind: "official" | "academic" | "internal-reviewed";
  url?: string;
  reviewedAt: string;
  note?: string;
};

/**
 * Source metadata is deliberately separate from the rendered study text.
 * Externally researched facts can be added here without changing the UI/API.
 */
export const STUDY_SOURCES: Record<string, StudySource> = {
  "curriculum-reviewed": {
    id: "curriculum-reviewed",
    title: "Harita Ustası gözden geçirilmiş kategori ve hedef verisi",
    publisher: "Harita Ustası",
    kind: "internal-reviewed",
    reviewedAt: "2026-07-26",
    note: "Kategori üyeliği, görünen hedef adı ve çalışma metninin dayandığı uygulama içi veri kümesi.",
  },
  "map-coordinates-reviewed": {
    id: "map-coordinates-reviewed",
    title: "Harita Ustası gözden geçirilmiş hedef koordinatları",
    publisher: "Harita Ustası",
    kind: "internal-reviewed",
    reviewedAt: "2026-07-26",
    note: "Yalnızca uygulamadaki mekânsal sıralama ve göreli konum sorularında kullanılır.",
  },
  "hgm-mulki-idare": {
    id: "hgm-mulki-idare",
    title: "Türkiye Mülki İdare Bölümleri Haritası",
    publisher: "Harita Genel Müdürlüğü",
    kind: "official",
    url: "https://www.harita.gov.tr/urun/turkiye-mulk-idare-bolumleri-haritasi/189",
    reviewedAt: "2026-07-26",
    note: "81 il alanı ve idari harita karşılaştırması.",
  },
  "hgm-fiziki-harita": {
    id: "hgm-fiziki-harita",
    title: "Türkiye Fiziki Haritası",
    publisher: "Harita Genel Müdürlüğü",
    kind: "official",
    url: "https://www.harita.gov.tr/urun/turkiye-fiziki-haritasi/193",
    reviewedAt: "2026-07-26",
    note: "Fiziki unsur konumlarının görsel kaynak denetimi.",
  },
  "meb-cografya": {
    id: "meb-cografya",
    title: "Coğrafya ders ve sınav hazırlık materyalleri",
    publisher: "Millî Eğitim Bakanlığı",
    kind: "official",
    url: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya2.pdf",
    reviewedAt: "2026-07-26",
    note: "Türkiye coğrafyası sınıflandırmaları ve sınav odaklı örnekler.",
  },
  "osym-kpss-2026": {
    id: "osym-kpss-2026",
    title: "2026 KPSS Lisans Kılavuzu",
    publisher: "Ölçme, Seçme ve Yerleştirme Merkezi",
    kind: "official",
    url: "https://www.osym.gov.tr/TR%2C34157/2026-kpss-lisans-kilavuz-ve-basvuru-bilgileri.html",
    reviewedAt: "2026-07-26",
    note: "KPSS sınav bağlamı ve güncel kılavuz referansı.",
  },
};

export function sourceRefsForCategory(category: { mainSlug: string }): string[] {
  const geographySource =
    category.mainSlug === "bolgeler-idari" ? "hgm-mulki-idare" : "hgm-fiziki-harita";
  return [
    "curriculum-reviewed",
    "map-coordinates-reviewed",
    geographySource,
    "meb-cografya",
    "osym-kpss-2026",
  ];
}

export function getStudySource(sourceId: string): StudySource | undefined {
  return STUDY_SOURCES[sourceId];
}
