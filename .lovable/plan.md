Bu istek büyük ve birbirinden bağımsız 8 başlık içeriyor. Aşağıdaki sırayla, mevcut çalışan sistemi bozmadan uygulayacağım. Başlamadan önce onayınıza sunuyorum çünkü online rekabet + auth kısmı **Lovable Cloud (backend)** aktifleştirmeyi gerektiriyor.

## 1. Bölge Oyunlarında Otomatik & Kilitli Yakınlaştırma
- `curriculum.ts` içindeki bölge kategorilerine `focusRegion: "Ege" | "Marmara" | ...` alanı eklenir.
- `src/lib/geo.ts` içine her bölge için önceden hesaplanmış bounding box (min/max lon-lat → x,y) tablosu eklenir.
- `GameBoard` içindeki `TransformWrapper`:
  - `initialScale` ve `positionX/Y` bounding box'tan hesaplanır (bölge ekranı doldursun).
  - `minScale = initialScale` → zoom-out kilitli. `maxScale` daha yüksek kalır.
  - Panning kilitli sınırlar içinde tutulur.
- Bölge dışı kategorilerde davranış aynen korunur.

## 2. Minimal Doğru Cevap Geri Bildirimi
- `DropDot` içindeki büyük yeşil daire + CheckCircle + büyük etiket kaldırılır.
- Yerine sadece: küçük etiket (il/konu adı) haritada kalır + kısa bir "pulse" animasyonu.
- Doğru bırakıldığında ilin SVG path'i (mümkün olan kategorilerde) yeşile döner (`filled` state → `TurkeyMap`'e `highlightedProvinces` prop'u).
- Confetti çok küçültülür veya yalnızca oyun bitiminde kalır.

## 3. Görsel Hafıza — Gerçek Şekiller
Piksel-hedef modelinden **path-hedef** modeline geçiş. `game-data.ts` her item için opsiyonel `shapePath` (SVG path) veya `points` (polyline) destekler.
- **İller/Bölgeler**: zaten province path'leri var → doğru bırakılınca ilin kendisi yeşile döner. (Kolay)
- **Dağlar / Sıradağlar**: her sıradağ için elle çizilmiş SVG polyline (`Toroslar`, `Kuzey Anadolu`, `Kaçkar`, `Nur`, `Yıldız`, `Küre`, `Ilgaz`, `Köroğlu`, `Sultan`, `Aladağlar`, `Bolkar`, `Munzur`). Uzanış yönü ve uzunluğu görünür.
- **Akarsular**: gerçek nehir yatakları polyline (`Kızılırmak`, `Sakarya`, `Fırat`, `Dicle`, `Yeşilırmak`, `Seyhan`, `Ceyhan`, `Meriç`, `Susurluk`, `Gediz`, `Büyük Menderes`, `Aras`, `Çoruh`).
- **Göller**: ellipse/polygon yaklaşık şekiller (`Van`, `Tuz`, `Beyşehir`, `Eğirdir`, `İznik`, `Sapanca`, `Burdur`, `Manyas`, `Uluabat`, `Salda`, `Çıldır`, `Hazar`).
- **Körfezler**: kıyı yayını temsil eden arc polyline.
- **Ovalar / Platolar**: yaklaşık polygon.
- **Kıyılar / Sınır kapıları**: polyline segment.

Yaklaşım: her kategori için `src/data/shapes/<slug>.ts` dosyaları — SVG viewBox koordinat sisteminde elle koordinat listeleri. Sürükle-bırak hedef alanı, şeklin bounding box'ıdır; doğru bırakılınca şekil renklenir + etiket kalır.

> Not: Bunlar coğrafi olarak "yaklaşık ama tanınabilir" şekillerdir (tam GIS verisi değil). Türkiye içi öğretim amacına yeterlidir.

## 4. Mobil Tek Ekran (Yatay) Deneyimi
- Yatay modda layout: **grid `[1fr_240px]`** — sol harita, sağ dikey kart paneli (scroll edilebilir ama ekran scroll yok).
- Header küçültülür (tek satır, sadece emoji + ✓/✗ + reset).
- Alt sabit "çıkış" butonu → sağ üst köşeye küçük ikon olur.
- `100dvh` kullanılır; overflow-hidden.
- Breadcrumb yatayda gizlenir.

## 5. Ana Sayfa: Sınav Geri Sayım Kartı
- Kart daha kompakt: tek satırda `Sınava Kalan · 47 · Gün` hizalı.
- Mobil dikey padding düşürülür.

## 6-8. Online Rekabet + Liderlik + Auth (Lovable Cloud gerekli)
Bu 3 başlık backend gerektirir. Şunları kuracağım:

**Auth**: Üst navigasyonda "Giriş Yap" butonu. E-posta/şifre + Google. Profil tablosu `profiles(id, username, avatar, created_at)`. Kullanıcı adı zorunlu — liderlik için.

**Şemalar** (RLS + user_roles pattern):
```
profiles(id uuid pk → auth.users, username unique, avatar)
rooms(id, code, host_id, status: waiting|playing|finished, category_slugs[], max_players=5, created_at)
room_players(room_id, user_id, joined_at, score int, total_ms int, finished_at)
match_results(id, room_id, user_id, score, total_ms, rank, played_at)
leaderboard_daily / _monthly (materialized view veya günlük agregat)
hall_of_fame(month, user_id, username) — geçen ayın birincisi
```

**Realtime**: `rooms` + `room_players` Supabase Realtime kanalıyla senkronize. Oda listesi, katılım, "hazır", oyun başlat, skor güncellemeleri realtime.

**Oyun akışı**:
- `/rekabet` → Oda Kur | Odaya Katıl sekmeleri.
- Oda listesi: doluluk oranına göre sıralı (dolmak üzere olanlar üstte).
- Oda kur: kategori seçimi (checkbox listesi), oluştur → lobby.
- Lobby: oyuncular listesi, host'ta "Başlat" butonu (min 2 oyuncu).
- 3-2-1 geri sayım → tüm oyuncularda `startedAt` senkron.
- Her oyuncu bağımsız oynar; skor +1/-1. Kategoriler sırayla otomatik geçer.
- İlk bitirende `first_finished_at` set edilir → diğerleri için 30sn kronometre.
- Sonuç: sıralama (puan → süre). 🏆🥈🥉 animasyonu, Tekrar Oyna (aynı odada reset) / Çık.

**Liderlik `/rakipler`**: Günlük / Aylık sekmeleri. Ortalama puana göre sıralama. Aylık için min 5 aktif gün (cron/edge fn ile her ay 1'inde reset + geçen ayın 1.'sini `hall_of_fame`'e yazma).

**Ana sayfa Onur Köşesi**: `hall_of_fame` son ayı gösterir.

**Navigasyon güncellemesi**: Rozetler | 🏆 Online Rekabet | 🏅 Rakipler | Tekrar

## 9. "KPSS" Yazısını Kaldırma
- Uygulama adı: **"Harita Ustası"** (öneri — değiştirebilirim).
- Tüm başlıklar, meta title/description, breadcrumb, sitemap: "KPSS" kaldırılır.
- Ana sayfadaki sınav geri sayım kartı jenerikleşir: "Hedef sınavına kalan süre" — sınav tarihini kullanıcı localStorage'dan seçebilir (varsayılan 6 Eylül).

---

## Teknik Notlar
- Lovable Cloud aktifleştirilecek (Supabase — auth, DB, realtime, edge fn).
- Online oyun state'i client-authoritative başlar (her oyuncu kendi skorunu yazar); anti-cheat MVP'de dışarıda.
- Gerçek coğrafi şekiller yaklaşık koordinatlarla elle çizilir; ileride GeoJSON'a geçirilebilir.
- Mobil layout için `100dvh` + `orientation: landscape` sorgusu.

---

## Onayınıza Sunulanlar
1. **Uygulama adı olarak "Harita Ustası" uygun mu?** Farklı bir isim istersen söyle.
2. **Lovable Cloud (backend) aktifleştirmemi onaylıyor musun?** Online rekabet, auth ve liderlik bunu gerektiriyor.
3. **Gerçek şekiller "yaklaşık ama tanınabilir" olacak** (elle çizilmiş, GIS verisi değil). Bu kabul edilebilir mi, yoksa gerçek GeoJSON verisi mi entegre edeyim (çok daha büyük iş)?
4. **Kapsam büyük** — hepsini tek seferde mi yapayım, yoksa şu sırayla mı: (a) 1+2+4+5+9 → (b) 3 gerçek şekiller → (c) 6+7+8 online sistem?

Onay verdiğinde koda başlıyorum.