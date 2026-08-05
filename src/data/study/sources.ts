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
    reviewedAt: "2026-08-05",
    note: "Kategori üyeliği, görünen hedef adı ve çalışma metninin dayandığı uygulama içi veri kümesi.",
  },
  "map-coordinates-reviewed": {
    id: "map-coordinates-reviewed",
    title: "Harita Ustası gözden geçirilmiş hedef koordinatları",
    publisher: "Harita Ustası",
    kind: "internal-reviewed",
    reviewedAt: "2026-08-05",
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
  "mgm-ruzgar-adlari": {
    id: "mgm-ruzgar-adlari",
    title: "Yönlerine göre rüzgâr adları",
    publisher: "Meteoroloji Genel Müdürlüğü",
    kind: "official",
    url: "https://mgm.gov.tr/genel/sss.aspx?s=denizicilikteruzgarisimleri",
    reviewedAt: "2026-08-05",
    note: "Sekiz ana yönün Türkiye'de kullanılan yerel rüzgâr adları.",
  },
  "target-note-2026-08-05": {
    id: "target-note-2026-08-05",
    title: "ÖSYM–KPSS Türkiye Coğrafyası Harita Oyunu Hedef Notu",
    publisher: "Harita Ustası içerik denetimi",
    kind: "internal-reviewed",
    reviewedAt: "2026-08-05",
    note: "Resmî kaynak bağlantılarıyla hazırlanan kullanıcı araştırması; hedef kümeleri ve sınav tuzakları için içerik kesimi.",
  },
  "tuik-bitkisel": {
    id: "tuik-bitkisel",
    title: "Bitkisel Üretim İstatistikleri — MEDAS",
    publisher: "Türkiye İstatistik Kurumu",
    kind: "official",
    url: "https://biruni.tuik.gov.tr/medas/?kn=92&locale=tr",
    reviewedAt: "2026-08-05",
    note: "Tarım ürünlerinin il düzeyindeki üretim yoğunlukları.",
  },
  "tarim-hayvancilik": {
    id: "tarim-hayvancilik",
    title: "Hayvan Varlığı İstatistik Bülteni",
    publisher: "Tarım ve Orman Bakanlığı",
    kind: "official",
    url: "https://istatistik.tarimorman.gov.tr/sayfa/detay/1934",
    reviewedAt: "2026-08-05",
    note: "Hayvancılık türlerinin güncel il dağılımı için ana resmî kaynak.",
  },
  "dsi-sular": {
    id: "dsi-sular",
    title: "Türkiye'nin Akarsuları, Gölleri ve Barajları",
    publisher: "Devlet Su İşleri Genel Müdürlüğü",
    kind: "official",
    url: "https://www.dsi.gov.tr/sayfa/detay/754",
    reviewedAt: "2026-08-05",
    note: "Akarsu, göl ve baraj adları ile temel havza ilişkileri.",
  },
  "dkmp-korunan-alanlar": {
    id: "dkmp-korunan-alanlar",
    title: "Millî Parklar ve Korunan Alanlar",
    publisher: "Doğa Koruma ve Millî Parklar Genel Müdürlüğü",
    kind: "official",
    url: "https://www.tarimorman.gov.tr/DKMP/Menu/27/Milli",
    reviewedAt: "2026-08-05",
    note: "Güncel millî park listesi, ilan tarihleri ve koruma statüleri.",
  },
  "ramsar-turkiye": {
    id: "ramsar-turkiye",
    title: "Türkiye Ramsar Ülke Profili",
    publisher: "Ramsar Sözleşmesi Sekretaryası",
    kind: "official",
    url: "https://www.ramsar.org/country-profile/turkiye",
    reviewedAt: "2026-08-05",
    note: "Türkiye'deki uluslararası öneme sahip Ramsar sulak alanları.",
  },
  "ticaret-serbest-bolgeler": {
    id: "ticaret-serbest-bolgeler",
    title: "Türkiye'deki 19 Faal Serbest Bölge",
    publisher: "Ticaret Bakanlığı",
    kind: "official",
    url: "https://ticaret.gov.tr/haberler/ticaret-bakanligina-bagli-19-serbest-bolgeden-2026-yilinin-ilk-yarisinda-yeni-ihracat-rekoru-alti-aylik-donemde-serbest-bolgelerden-ihracatimiz-6-2-artisla-6-6-milyar-dolara-yukseldi",
    reviewedAt: "2026-08-05",
    note: "Faal serbest bölge sayısı ve güncel resmî durum.",
  },
  "turkseker-tarihce": {
    id: "turkseker-tarihce",
    title: "Türkiye Şeker Sanayisinin Tarihçesi",
    publisher: "Türkiye Şeker Fabrikaları A.Ş.",
    kind: "official",
    url: "https://www.turkseker.gov.tr/Default.aspx?MenuID=3&ModulID=3",
    reviewedAt: "2026-08-05",
    note: "Tarihsel şeker fabrikalarının açılış sırası ve merkezleri.",
  },
  "sanayi-osb": {
    id: "sanayi-osb",
    title: "Organize Sanayi Bölgeleri Hizmetleri",
    publisher: "Sanayi ve Teknoloji Bakanlığı",
    kind: "official",
    url: "https://www.sanayi.gov.tr/sanayi-bolgeleri/organize-sanayi-bolgeleri-hizmetleri?v=1.0.24",
    reviewedAt: "2026-08-05",
    note: "Sanayi bölgeleri ve sanayi coğrafyası için resmî başvuru kaynağı.",
  },
  "etkb-madenler": {
    id: "etkb-madenler",
    title: "Tabii Kaynaklar Bilgi Merkezi — Maden Dizini",
    publisher: "Enerji ve Tabii Kaynaklar Bakanlığı",
    kind: "official",
    url: "https://www.enerji.gov.tr/bilgimerkezi-tabiikaynaklar-demir",
    reviewedAt: "2026-08-05",
    note: "Demir sayfası ile aynı resmî dizindeki maden sayfalarının kullanım alanı ve başlıca yatak verileri.",
  },
  "etkb-elektrik": {
    id: "etkb-elektrik",
    title: "Elektrik Üretimi ve Kaynak Dağılımı",
    publisher: "Enerji ve Tabii Kaynaklar Bakanlığı",
    kind: "official",
    url: "https://www.enerji.gov.tr/bilgi-merkezi-enerji-elektrik?v=1.0.23",
    reviewedAt: "2026-08-05",
    note: "Enerji kaynakları ve tarihli elektrik üretim payları.",
  },
  "repa-ruzgar": {
    id: "repa-ruzgar",
    title: "Türkiye Rüzgâr Enerjisi Potansiyel Atlası",
    publisher: "Enerji ve Tabii Kaynaklar Bakanlığı",
    kind: "official",
    url: "https://repa.enerji.gov.tr/REPA/",
    reviewedAt: "2026-08-05",
    note: "Rüzgâr enerjisi için alan ve kuşak potansiyeli; kesin il sıralaması değildir.",
  },
  "kgm-yol-agi": {
    id: "kgm-yol-agi",
    title: "1 Ocak 2026 Türkiye Yol Ağı",
    publisher: "Karayolları Genel Müdürlüğü",
    kind: "official",
    url: "https://www.kgm.gov.tr/Sayfalar/KGM/SiteTr/Kurumsal/YolAgi.aspx",
    reviewedAt: "2026-08-05",
    note: "Trafiğe açık otoyol ağı ve ana güzergâhlar.",
  },
  "uab-yht": {
    id: "uab-yht",
    title: "Doğrudan YHT Hizmeti Verilen 11 İl",
    publisher: "Ulaştırma ve Altyapı Bakanlığı",
    kind: "official",
    url: "https://www.uab.gov.tr/haberler/tuerkiye-hizli-treni-sevdi/",
    reviewedAt: "2026-08-05",
    note: "Doğrudan YHT seferli iller ile kombine bağlantıların ayrımı.",
  },
  "dhmi-havalimanlari": {
    id: "dhmi-havalimanlari",
    title: "Türkiye'deki Aktif Havalimanları",
    publisher: "Devlet Hava Meydanları İşletmesi",
    kind: "official",
    url: "https://www.dhmi.gov.tr/Sayfalar/Haber/havalimani-basmudurleri-ankarada-toplandi.aspx",
    reviewedAt: "2026-08-05",
    note: "21 Mayıs 2026 itibarıyla aktif havalimanı sayısı ve ağın güncel durumu.",
  },
  "uab-denizcilik": {
    id: "uab-denizcilik",
    title: "2025 Denizcilik İstatistik Bülteni",
    publisher: "Ulaştırma ve Altyapı Bakanlığı",
    kind: "official",
    url: "https://denizcilik.uab.gov.tr/uploads/pages/yayinlar/istatistik-bulteni-2025-02-02-2026.pdf",
    reviewedAt: "2026-08-05",
    note: "Kruvaziyer yolcu ve Ro–Ro taşımacılığı istatistikleri.",
  },
  "unesco-turkiye": {
    id: "unesco-turkiye",
    title: "Türkiye Dünya Mirası Listesi",
    publisher: "UNESCO Dünya Miras Merkezi",
    kind: "official",
    url: "https://whc.unesco.org/en/statesparties/tr/",
    reviewedAt: "2026-08-05",
    note: "Türkiye'nin güncel Dünya Mirası alanları ve resmî kayıt adları.",
  },
};

export function sourceRefsForCategory(category: { mainSlug: string; slug?: string }): string[] {
  if (category.slug === "ruzgarlar") {
    return [
      "curriculum-reviewed",
      "target-note-2026-08-05",
      "mgm-ruzgar-adlari",
      "meb-cografya",
      "osym-kpss-2026",
    ];
  }

  const sourceByMainSlug: Record<string, string> = {
    "bolgeler-idari": "hgm-mulki-idare",
    tarim: "tuik-bitkisel",
    hayvancilik: "tarim-hayvancilik",
    "yer-sekilleri": "hgm-fiziki-harita",
    "su-kaynaklari": "dsi-sular",
    cevre: "hgm-fiziki-harita",
    "ekonomi-sanayi": "sanayi-osb",
    madenler: "etkb-madenler",
    enerji: "etkb-elektrik",
    ulasim: "kgm-yol-agi",
    "turizm-kultur": "meb-cografya",
  };
  const sourceByCategorySlug: Record<string, string> = {
    "milli-parklar": "dkmp-korunan-alanlar",
    "orman-alanlari": "dkmp-korunan-alanlar",
    "yeni-korunan-alanlar-2026": "dkmp-korunan-alanlar",
    ramsar: "ramsar-turkiye",
    "serbest-bolgeler": "ticaret-serbest-bolgeler",
    "seker-fabrikalari": "turkseker-tarihce",
    ruzgar: "repa-ruzgar",
    otoyollar: "kgm-yol-agi",
    yht: "uab-yht",
    havalimanlari: "dhmi-havalimanlari",
    kruvaziyer: "uab-denizcilik",
    roro: "uab-denizcilik",
    unesco: "unesco-turkiye",
  };
  const officialSource =
    (category.slug && sourceByCategorySlug[category.slug]) ??
    sourceByMainSlug[category.mainSlug] ??
    "hgm-fiziki-harita";

  return [
    "curriculum-reviewed",
    "target-note-2026-08-05",
    "map-coordinates-reviewed",
    officialSource,
    "meb-cografya",
    "osym-kpss-2026",
  ];
}

export function getStudySource(sourceId: string): StudySource | undefined {
  return STUDY_SOURCES[sourceId];
}
