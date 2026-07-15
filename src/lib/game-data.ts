import { project } from "./geo";

export type Category = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  gradient: string;
  items: { id: string; name: string; lat: number; lon: number; hint?: string }[];
};

const cat = (
  slug: string,
  title: string,
  emoji: string,
  description: string,
  gradient: string,
  items: [string, number, number, string?][],
): Category => ({
  slug,
  title,
  emoji,
  description,
  gradient,
  items: items.map(([name, lat, lon, hint], i) => ({
    id: `${slug}-${i}`,
    name,
    lat,
    lon,
    hint,
  })),
});

export const CATEGORIES: Category[] = [
  cat("daglar", "Dağlar", "🏔", "Türkiye'nin önemli dağlarını haritada yerleştir.", "from-sky-400 to-cyan-500", [
    ["Ağrı Dağı", 39.702, 44.298],
    ["Erciyes", 38.531, 35.449],
    ["Hasan Dağı", 38.13, 34.17],
    ["Uludağ", 40.07, 29.223],
    ["Ilgaz", 41.076, 33.726],
    ["Kaçkar", 40.833, 41.155],
    ["Süphan", 38.922, 42.817],
    ["Cilo", 37.55, 44.0],
    ["Palandöken", 39.855, 41.247],
    ["Munzur", 39.4, 39.3],
    ["Aladağlar", 37.8, 35.2],
    ["Bolkar", 37.4, 34.6],
    ["Karacadağ", 37.7, 39.8],
    ["Küre Dağları", 41.7, 33.8],
    ["Köroğlu", 40.5, 32.0],
    ["Nur (Amanos)", 36.7, 36.3],
  ]),
  cat("volkanik", "Volkanik Dağlar", "🌋", "Türkiye'deki sönmüş volkanik dağları yerleştir.", "from-orange-400 to-rose-500", [
    ["Erciyes", 38.531, 35.449],
    ["Hasan Dağı", 38.13, 34.17],
    ["Nemrut (Van)", 38.65, 42.23],
    ["Süphan", 38.922, 42.817],
    ["Ağrı Dağı", 39.702, 44.298],
    ["Tendürek", 39.35, 43.87],
    ["Karacadağ", 37.7, 39.8],
    ["Karadağ", 37.4, 33.15],
    ["Melendiz", 38.05, 34.7],
    ["Kula (Divlit)", 38.55, 28.63],
  ]),
  cat("goller", "Göller", "🏞", "Türkiye'nin büyük göllerini haritada eşleştir.", "from-cyan-400 to-teal-500", [
    ["Van Gölü", 38.633, 42.9],
    ["Tuz Gölü", 38.75, 33.4],
    ["Beyşehir", 37.75, 31.5],
    ["Eğirdir", 37.9, 30.85],
    ["Burdur", 37.7, 30.15],
    ["İznik", 40.433, 29.55],
    ["Sapanca", 40.7, 30.25],
    ["Manyas (Kuş)", 40.183, 27.983],
    ["Uluabat", 40.183, 28.567],
    ["Salda", 37.55, 29.667],
    ["Çıldır", 41.033, 43.3],
    ["Acıgöl", 37.833, 29.867],
  ]),
  cat("akarsular", "Akarsular", "🌊", "Türkiye'nin başlıca nehirlerini haritaya yerleştir.", "from-blue-400 to-indigo-500", [
    ["Kızılırmak (ağız)", 41.717, 35.95],
    ["Yeşilırmak (ağız)", 41.283, 36.667],
    ["Sakarya (ağız)", 41.117, 30.633],
    ["Fırat", 38.7, 39.0],
    ["Dicle", 37.85, 40.5],
    ["Meriç", 40.9, 26.2],
    ["Susurluk", 40.4, 28.617],
    ["Aras", 40.4, 42.5],
    ["Çoruh", 41.2, 41.5],
    ["Seyhan", 36.9, 35.283],
    ["Ceyhan", 36.85, 35.617],
    ["B. Menderes", 37.667, 27.4],
  ]),
  cat("bolgeler", "Coğrafi Bölgeler", "🌍", "7 coğrafi bölgeyi haritada işaretle.", "from-emerald-400 to-teal-500", [
    ["Marmara", 40.4, 28.5],
    ["Ege", 38.4, 27.5],
    ["Akdeniz", 36.9, 32.0],
    ["İç Anadolu", 39.0, 34.0],
    ["Karadeniz", 41.0, 37.5],
    ["Doğu Anadolu", 39.3, 42.0],
    ["Güneydoğu Anadolu", 37.5, 40.0],
  ]),
  cat("iller", "Büyük İller", "📍", "Türkiye'nin önemli illerini yerleştir.", "from-sky-400 to-blue-500", [
    ["İstanbul", 41.01, 28.98],
    ["Ankara", 39.93, 32.85],
    ["İzmir", 38.42, 27.14],
    ["Bursa", 40.19, 29.06],
    ["Antalya", 36.9, 30.71],
    ["Adana", 37.0, 35.32],
    ["Konya", 37.87, 32.48],
    ["Gaziantep", 37.07, 37.38],
    ["Trabzon", 41.0, 39.72],
    ["Erzurum", 39.9, 41.27],
    ["Van", 38.49, 43.38],
    ["Diyarbakır", 37.91, 40.24],
    ["Samsun", 41.29, 36.33],
    ["Kayseri", 38.73, 35.48],
    ["Eskişehir", 39.78, 30.52],
    ["Edirne", 41.68, 26.55],
    ["Sinop", 42.02, 35.15],
    ["Hatay", 36.2, 36.16],
    ["Muğla", 37.22, 28.36],
    ["Şanlıurfa", 37.17, 38.79],
  ]),
  cat("komsular", "Komşu Ülkeler", "🧭", "Türkiye'ye komşu ülkeleri sınırlarına yerleştir.", "from-teal-400 to-emerald-500", [
    ["Yunanistan", 41.4, 26.1],
    ["Bulgaristan", 41.9, 27.0],
    ["Gürcistan", 41.6, 42.5],
    ["Ermenistan", 40.5, 44.2],
    ["Azerbaycan (Nah.)", 39.6, 45.0],
    ["İran", 38.5, 44.6],
    ["Irak", 37.2, 43.5],
    ["Suriye", 36.5, 38.5],
  ]),
  cat("ovalar", "Ovalar", "🏕", "Türkiye'nin önemli ovalarını yerleştir.", "from-lime-400 to-emerald-500", [
    ["Çukurova", 37.0, 35.5],
    ["Konya Ovası", 37.87, 32.6],
    ["Harran", 37.0, 39.0],
    ["Muş Ovası", 38.75, 41.5],
    ["Erzurum Ovası", 39.9, 41.27],
    ["Bafra", 41.55, 35.9],
    ["Çarşamba", 41.2, 36.7],
    ["Amik", 36.35, 36.25],
    ["Menemen", 38.6, 27.07],
    ["Bakırçay", 39.1, 27.0],
  ]),
  cat("platolar", "Platolar", "🏞", "Türkiye'nin önemli platolarını haritada işaretle.", "from-amber-300 to-orange-400", [
    ["Erzurum-Kars", 40.3, 42.5],
    ["Uzunyayla", 39.0, 37.0],
    ["Obruk", 38.5, 33.5],
    ["Bozok", 39.8, 34.8],
    ["Cihanbeyli", 38.65, 32.9],
    ["Haymana", 39.4, 32.5],
    ["Taşeli", 36.7, 32.5],
    ["Gaziantep", 37.1, 37.4],
    ["Şanlıurfa", 37.3, 38.9],
  ]),
  cat("bogazlar", "Boğazlar", "🌉", "Türk boğazlarını yerleştir.", "from-blue-400 to-cyan-400", [
    ["İstanbul Boğazı", 41.1, 29.05],
    ["Çanakkale Boğazı", 40.23, 26.4],
  ]),
  cat("adalar", "Adalar", "🏝", "Türkiye'ye ait adaları yerleştir.", "from-cyan-300 to-sky-500", [
    ["Gökçeada", 40.17, 25.85],
    ["Bozcaada", 39.83, 26.05],
    ["Marmara Adası", 40.63, 27.55],
    ["Avşa", 40.5, 27.6],
    ["Kızılada (Fethiye)", 36.65, 28.9],
  ]),
  cat("korfezler", "Körfezler", "🏖", "Türkiye'nin körfezlerini yerleştir.", "from-teal-300 to-cyan-500", [
    ["İzmir Körfezi", 38.5, 26.9],
    ["İskenderun", 36.6, 35.9],
    ["Antalya", 36.8, 30.7],
    ["Edremit", 39.55, 26.8],
    ["Saros", 40.5, 26.5],
    ["Gökova", 37.05, 28.05],
    ["Fethiye", 36.65, 29.05],
    ["Mersin", 36.7, 34.5],
  ]),
  cat("gecitler", "Geçitler", "⛰", "Önemli dağ geçitlerini yerleştir.", "from-stone-300 to-amber-400", [
    ["Çubuk Geçidi", 40.55, 33.35],
    ["Zigana", 40.65, 39.4],
    ["Kop", 40.05, 40.55],
    ["Belen", 36.5, 36.2],
    ["Sertavul", 36.6, 33.35],
    ["Gülek Boğazı", 37.28, 34.75],
    ["Tahir", 39.9, 42.15],
  ]),
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export type TargetPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
};

export function targetsFor(category: Category): TargetPoint[] {
  return category.items.map((it) => {
    const { x, y } = project(it.lat, it.lon);
    return { id: it.id, name: it.name, x, y };
  });
}
