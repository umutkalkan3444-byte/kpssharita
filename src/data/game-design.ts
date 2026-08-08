export type InteractionModel = "drag" | "map-select" | "guided-choice";

export type GameDesign = {
  interaction: InteractionModel;
  learningGoal: string;
  startingKnowledge: string;
  rationale: string;
  pdfPages: string;
};

type DesignCategory = {
  slug: string;
  title: string;
  mainSlug: string;
};

/**
 * Adı veya çizgisi haritadaki konumu anlamlı biçimde düşündüren oyunlar.
 * Özellikle büyükşehirler, kullanıcı talebindeki örnek gereği il kartlarını
 * gerçek il alanlarına sürükleterek çalışır.
 */
export const DRAG_GAME_SLUGS = new Set([
  "turkiye-bolgeleri",
  "marmara-illeri",
  "ege-illeri",
  "akdeniz-illeri",
  "ic-anadolu-illeri",
  "karadeniz-illeri",
  "dogu-anadolu-illeri",
  "guneydogu-anadolu-illeri",
  "iller-81",
  "buyuksehirler",
  "tum-daglar",
  "kivrim-daglari",
  "kirik-daglari",
  "volkanik-daglar",
  "delta-ovalari",
  "karstik-ovalar",
  "tektonik-ovalar",
  "platolar",
  "masifler",
  "toprak-turleri",
  "engebeli-alanlar",
  "duz-alanlar",
  "kiyi-tipleri",
  "ruzgarlar",
  "akarsular",
  "tektonik-goller",
  "volkanik-goller",
  "karstik-goller",
  "buzul-goller",
  "volkanik-set",
  "karma-goller",
  "aluvyon-set",
  "kiyi-set",
  "heyelan-set",
  "barajlar",
  "korfezler",
  "selaleler",
  "dogalgaz-boru-hatlari",
  "otoyollar",
  "yht",
  "sinir-kapilari",
]);

/** Dağılış haritasında öne çıkan illerin bir küme olarak bulunacağı konular. */
const MAP_SELECT_MAIN_SLUGS = new Set([
  "tarim",
  "hayvancilik",
  "iklim-bitki",
  "afetler",
  "nufus-yerlesme",
  "kalkinma",
]);

/** İl kümesi öğreten, fakat ana başlığının diğer oyunları tesis sorusu olan dağılışlar. */
const MAP_SELECT_GAME_SLUGS = new Set([
  "serbest-bolgeler",
  "seker-fabrikalari",
  "otomotiv-sanayisi",
  "tekstil-sanayisi",
  "kagit-fabrikalari",
  "gubre-fabrikalari",
  "zimpara",
  "pomza",
  "perlit",
  "petrol",
  "biyokutle",
  "gunes",
  "ruzgar",
  "jeotermal",
]);

/** Ana küme içinde tek bir kavramı bir noktaya bağlayan özet oyunlar. */
const GUIDED_OVERRIDE_SLUGS = new Set([
  "tum-tarim",
  "tum-hayvancilik",
  "bolgesel-kalkinma-planlari",
]);

const PDF_PAGE_RANGES: Readonly<Record<string, string>> = {
  "bolgeler-idari": "188–194",
  tarim: "90–124",
  hayvancilik: "125–132",
  "yer-sekilleri": "10–42",
  "su-kaynaklari": "43–53",
  "iklim-bitki": "31–68",
  afetler: "69–74",
  "nufus-yerlesme": "75–89",
  cevre: "60–76",
  "ekonomi-sanayi": "163–172",
  madenler: "133–155",
  enerji: "156–162",
  ulasim: "173–181",
  "turizm-kultur": "76, 83, 182–187",
  kalkinma: "190–194",
};

const MAIN_GOALS: Readonly<Record<string, string>> = {
  "bolgeler-idari": "İl, bölge ve sınır ilişkilerini boş Türkiye haritasında kurmak",
  tarim: "Ürünlerin yalnızca başlıca ve sınav değeri yüksek üretim kümelerini ayırt etmek",
  hayvancilik: "Hayvancılık türlerinin Türkiye'deki ana yoğunlaşma alanlarını karşılaştırmak",
  "yer-sekilleri": "Yer şekillerini uzanış, komşuluk ve bölgesel konumlarıyla eşleştirmek",
  "su-kaynaklari": "Akarsu, göl, baraj ve kıyı unsurlarının mekânsal örüntüsünü öğrenmek",
  "iklim-bitki": "İklim ve bitki örtüsü dağılışını kıyı–iç kesim farkıyla okumak",
  afetler: "Afet risklerinin yoğunlaştığı illeri ve kuşakları ayırt etmek",
  "nufus-yerlesme": "Nüfus ve yerleşme göstergelerinin bölgesel dağılışını yorumlamak",
  cevre: "Korunan doğal alanları ve ayırt edici coğrafi konumlarını eşleştirmek",
  "ekonomi-sanayi": "Sanayi tesislerini ham madde, ulaşım ve pazar bağlantılarıyla eşleştirmek",
  madenler: "Madenleri başlıca çıkarım ve işleme merkezleriyle eşleştirmek",
  enerji: "Enerji kaynakları ve hatlarını üretim alanlarıyla ilişkilendirmek",
  ulasim: "Ulaşım ağlarını, geçitleri ve limanları mekânsal bağlantılarıyla öğrenmek",
  "turizm-kultur": "Turizm ve kültür varlıklarını bulundukları illerle eşleştirmek",
  kalkinma: "Bölgesel kalkınma planlarının kapsadığı illeri ayırt etmek",
};

export function getGameDesign(category: DesignCategory): GameDesign {
  const interaction: InteractionModel = DRAG_GAME_SLUGS.has(category.slug)
    ? "drag"
    : (MAP_SELECT_MAIN_SLUGS.has(category.mainSlug) || MAP_SELECT_GAME_SLUGS.has(category.slug)) &&
        !GUIDED_OVERRIDE_SLUGS.has(category.slug)
      ? "map-select"
      : "guided-choice";

  const learningGoal =
    MAIN_GOALS[category.mainSlug] ??
    `${category.title} konusundaki temel coğrafi dağılışı harita üzerinde öğrenmek`;

  if (interaction === "drag") {
    return {
      interaction,
      learningGoal,
      startingKnowledge:
        "Kartın adı, yönü, bölgesi veya çizgisi hedef konumu mekânsal olarak düşündürür.",
      rationale:
        "Kartı gerçek konuma taşımak komşuluk ve uzanış bilgisini güçlendirir; etkileşim salt tahmine dönüşmez.",
      pdfPages: PDF_PAGE_RANGES[category.mainSlug] ?? "ilgili konu haritası",
    };
  }

  if (interaction === "map-select") {
    return {
      interaction,
      learningGoal,
      startingKnowledge:
        "Kullanıcı konu başlığını bilir; PDF'de öne çıkarılan illeri dağılış kümesi olarak arar.",
      rationale:
        "İl kartlarını tek tek sürükletmek yerine doğrudan haritada seçim yapmak yoğunluk örüntüsünü daha açık gösterir.",
      pdfPages: PDF_PAGE_RANGES[category.mainSlug] ?? "ilgili dağılış haritası",
    };
  }

  return {
    interaction,
    learningGoal,
    startingKnowledge: "Kavramın hangi ili temsil ettiği adından güvenilir biçimde çıkarılamaz.",
    rationale:
      "Dört il seçeneği bilgi testini yönlendirir; 81 il üzerinde rastgele bırakma yaparak öğrenme dışı hata oluşmasını önler.",
    pdfPages: PDF_PAGE_RANGES[category.mainSlug] ?? "ilgili konu haritası",
  };
}

export function interactionLabel(interaction: InteractionModel): string {
  if (interaction === "drag") return "Sürükle–bırak";
  if (interaction === "map-select") return "Haritada seçim";
  return "Yönlendirmeli seçim";
}
