// İl → Bölge haritası. Türkiye Bölgeleri oyununda haritayı bölgeye
// göre renklendirmek için kullanılır.
export const REGION_OF: Record<string, string> = {
  // Marmara
  İstanbul: "Marmara", Istanbul: "Marmara", Edirne: "Marmara", Kırklareli: "Marmara",
  Kirklareli: "Marmara", Tekirdağ: "Marmara", Tekirdag: "Marmara",
  Çanakkale: "Marmara", Canakkale: "Marmara", Balıkesir: "Marmara", Balikesir: "Marmara",
  Bursa: "Marmara", Yalova: "Marmara", Kocaeli: "Marmara", Sakarya: "Marmara",
  Bilecik: "Marmara",
  // Ege
  İzmir: "Ege", Izmir: "Ege", Manisa: "Ege", Aydın: "Ege", Aydin: "Ege",
  Muğla: "Ege", Mugla: "Ege", Denizli: "Ege", Uşak: "Ege", Usak: "Ege",
  Kütahya: "Ege", Kutahya: "Ege", Afyonkarahisar: "Ege", Afyon: "Ege",
  // Akdeniz
  Antalya: "Akdeniz", Isparta: "Akdeniz", Burdur: "Akdeniz", Mersin: "Akdeniz",
  Adana: "Akdeniz", Osmaniye: "Akdeniz", Hatay: "Akdeniz",
  Kahramanmaraş: "Akdeniz", Kahramanmaras: "Akdeniz",
  // İç Anadolu
  Ankara: "İç Anadolu", Eskişehir: "İç Anadolu", Eskisehir: "İç Anadolu",
  Konya: "İç Anadolu", Karaman: "İç Anadolu", Aksaray: "İç Anadolu",
  Niğde: "İç Anadolu", Nigde: "İç Anadolu", Nevşehir: "İç Anadolu", Nevsehir: "İç Anadolu",
  Kırşehir: "İç Anadolu", Kirsehir: "İç Anadolu",
  Kırıkkale: "İç Anadolu", Kirikkale: "İç Anadolu",
  Yozgat: "İç Anadolu", Sivas: "İç Anadolu", Kayseri: "İç Anadolu",
  Çorum: "İç Anadolu", Corum: "İç Anadolu",
  // Karadeniz
  Zonguldak: "Karadeniz", Bartın: "Karadeniz", Bartin: "Karadeniz",
  Karabük: "Karadeniz", Karabuk: "Karadeniz", Kastamonu: "Karadeniz",
  Sinop: "Karadeniz", Samsun: "Karadeniz", Amasya: "Karadeniz",
  Tokat: "Karadeniz", Ordu: "Karadeniz", Giresun: "Karadeniz",
  Trabzon: "Karadeniz", Rize: "Karadeniz", Artvin: "Karadeniz",
  Gümüşhane: "Karadeniz", Gumushane: "Karadeniz", Bayburt: "Karadeniz",
  Bolu: "Karadeniz", Düzce: "Karadeniz", Duzce: "Karadeniz",
  Çankırı: "Karadeniz", Cankiri: "Karadeniz",
  // Doğu Anadolu
  Erzurum: "Doğu Anadolu", Erzincan: "Doğu Anadolu", Kars: "Doğu Anadolu",
  Ardahan: "Doğu Anadolu", Iğdır: "Doğu Anadolu", Igdir: "Doğu Anadolu",
  Ağrı: "Doğu Anadolu", Agri: "Doğu Anadolu", Van: "Doğu Anadolu",
  Bitlis: "Doğu Anadolu", Muş: "Doğu Anadolu", Mus: "Doğu Anadolu",
  Bingöl: "Doğu Anadolu", Bingol: "Doğu Anadolu",
  Elazığ: "Doğu Anadolu", Elazig: "Doğu Anadolu",
  Tunceli: "Doğu Anadolu", Malatya: "Doğu Anadolu",
  Hakkari: "Doğu Anadolu", Hakkâri: "Doğu Anadolu",
  // Güneydoğu Anadolu
  Gaziantep: "Güneydoğu Anadolu", Kilis: "Güneydoğu Anadolu",
  Şanlıurfa: "Güneydoğu Anadolu", Sanliurfa: "Güneydoğu Anadolu",
  Adıyaman: "Güneydoğu Anadolu", Adiyaman: "Güneydoğu Anadolu",
  Diyarbakır: "Güneydoğu Anadolu", Diyarbakir: "Güneydoğu Anadolu",
  Batman: "Güneydoğu Anadolu", Siirt: "Güneydoğu Anadolu",
  Şırnak: "Güneydoğu Anadolu", Sirnak: "Güneydoğu Anadolu",
  Mardin: "Güneydoğu Anadolu",
};

export const REGION_COLORS: Record<string, string> = {
  "Marmara": "#a7f3d0",
  "Ege": "#fde68a",
  "Akdeniz": "#fecaca",
  "İç Anadolu": "#fcd34d",
  "Karadeniz": "#bbf7d0",
  "Doğu Anadolu": "#ddd6fe",
  "Güneydoğu Anadolu": "#fdba74",
};
