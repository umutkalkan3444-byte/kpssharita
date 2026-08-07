/**
 * Harita altındaki kalıcı, sınav odaklı konu anlatımı.
 *
 * Bu içerik oyun sonu kişiselleştirilmiş çalışmadan farklıdır: kullanıcı haritayı
 * çözerken ya da bitirdikten sonra, konuya ait değişmeyen çekirdek bilgiyi burada
 * görür. Kayıt bulunamadığında genel bir metne düşülmez; içerik denetimi her oyun
 * kategorisinin açıkça tanımlanmasını zorunlu tutar.
 */
export type TopicEssential = {
  definition: string;
  keyPoints: readonly [string, ...string[]];
  examTip: string;
  priority: "Çekirdek" | "Tamamlayıcı";
  reviewedAt: string;
};

const REVIEWED_AT = "2026-08-05";

function essential(
  definition: string,
  keyPoints: readonly [string, ...string[]],
  examTip: string,
  priority: TopicEssential["priority"] = "Çekirdek",
): TopicEssential {
  return { definition, keyPoints, examTip, priority, reviewedAt: REVIEWED_AT };
}

function distributionEssential(
  definition: string,
  keyPoints: readonly [string, string, string],
  examTip: string,
): TopicEssential {
  return essential(definition, keyPoints, examTip);
}

const administrative = {
  "turkiye-bolgeleri": essential(
    "Türkiye, ortak doğal ve beşerî özelliklere göre yedi coğrafi bölgeye ayrılır; bu sınırlar idari değildir.",
    [
      "Bölgeler Marmara, Ege, Akdeniz, İç Anadolu, Karadeniz, Doğu Anadolu ve Güneydoğu Anadolu'dur.",
      "Bölge sınırları il sınırlarıyla tam çakışmaz; bir ilin toprakları birden fazla coğrafi bölgede kalabilir.",
      "Yüz ölçümü en büyük bölge Doğu Anadolu, en küçük bölge Güneydoğu Anadolu'dur.",
    ],
    "Coğrafi bölgeyi idari bölge sanma; ÖSYM özellikle il–bölge sınırlarının tam örtüşmemesini sorgular.",
  ),
  "marmara-illeri": essential(
    "Marmara, Avrupa ile Asya arasında yer alan ve dört denize kıyısı bulunan geçiş bölgesidir.",
    [
      "Trakya'daki Edirne, Kırklareli ve Tekirdağ ile İstanbul'un Avrupa yakası bölgenin Avrupa kesimindedir.",
      "Sanayi, ticaret, ulaşım ve nüfus yoğunluğu Türkiye ortalamasının üzerindedir.",
      "Bilecik'in tamamı değil ağırlıklı bölümü Marmara içinde değerlendirilir; bölge sınırı idari sınır değildir.",
    ],
    "İlleri ezberlerken Trakya–Çatalca/Kocaeli–Güney Marmara kümeleriyle çalış.",
  ),
  "ege-illeri": essential(
    "Ege Bölgesi, kıyıdaki Ege Bölümü ile daha karasal İç Batı Anadolu Bölümü'nden oluşur.",
    [
      "Kıyıda İzmir, Manisa, Aydın ve Muğla; içte Denizli, Uşak, Kütahya ve Afyonkarahisar öne çıkar.",
      "Dağların kıyıya dik uzanması deniz etkisinin içeri sokulmasını ve ulaşımın doğu–batı yönünde kolaylaşmasını sağlar.",
      "Horst–graben yapısı, geniş ovalar ve jeotermal kaynaklar bölgenin temel fiziki özellikleridir.",
    ],
    "Muğla'yı Akdeniz Bölgesi sanma; idari ili Ege Bölgesi hedefidir.",
  ),
  "akdeniz-illeri": essential(
    "Akdeniz Bölgesi, Torosların kıyıya paralel uzandığı; kıyı ile iç kesimler arasında belirgin iklim farkı görülen bölgedir.",
    [
      "Antalya Bölümü batıda, Adana Bölümü doğudadır.",
      "Kıyıda turunçgil, muz ve seracılık; içte karasal koşullar ve tahıl daha belirgindir.",
      "Kahramanmaraş'ın bölgesel sınıflandırması idari sınırla değil coğrafi özelliklerle yapılır.",
    ],
    "Isparta ve Burdur'u yalnız İç Anadolu ile ilişkilendirme; Göller Yöresi Akdeniz Bölgesi içindedir.",
  ),
  "ic-anadolu-illeri": essential(
    "İç Anadolu, deniz etkisine kapalı, geniş plato ve ovaların egemen olduğu karasal iç bölgedir.",
    [
      "Konya Bölümü en geniş kesim; Yukarı Sakarya, Orta Kızılırmak ve Yukarı Kızılırmak diğer bölümlerdir.",
      "Tahıl tarımı ve küçükbaş hayvancılık bozkır koşullarıyla ilişkilidir.",
      "Tuz Gölü–Konya kapalı havzası bölgenin temel hidrografya bilgisidir.",
    ],
    "Afyonkarahisar Ege; Çorum Karadeniz hedefidir: komşuluk, coğrafi bölge üyeliği anlamına gelmez.",
  ),
  "karadeniz-illeri": essential(
    "Karadeniz Bölgesi, dağların kıyıya paralel uzandığı, kıyı–iç kesim farkının güçlü olduğu uzun bir kuşaktır.",
    [
      "Batı, Orta ve Doğu Karadeniz bölümlerine ayrılır.",
      "Kıyıda yağış ve orman; iç kesimlerde karasallık ve tarım alanlarının genişlemesi belirgindir.",
      "Dağlar kıyı ulaşımını ve kıyı–iç kesim bağlantısını zorlaştırır.",
    ],
    "Çorum ve Tokat kıyıda değildir ama Karadeniz Bölgesi illeridir.",
  ),
  "dogu-anadolu-illeri": essential(
    "Doğu Anadolu, Türkiye'nin ortalama yükseltisi ve yüz ölçümü en fazla olan coğrafi bölgesidir.",
    [
      "Yükselti, engebe ve sert karasal iklim tarım süresini kısaltır; çayır–mera büyükbaşı destekler.",
      "Erzurum–Kars, Yukarı Fırat, Yukarı Murat–Van ve Hakkâri bölümleriyle düşünülür.",
      "Volkanik dağlar, tektonik ovalar ve Türkiye'nin büyük akarsu kaynakları burada yoğunlaşır.",
    ],
    "Kilis, Gaziantep, Şanlıurfa ve Mardin'i Doğu Anadolu ile değil Güneydoğu Anadolu ile eşleştir.",
  ),
  "guneydogu-anadolu-illeri": essential(
    "Güneydoğu Anadolu, Fırat ile Dicle havzalarının ve geniş plato alanlarının öne çıktığı en küçük coğrafi bölgedir.",
    [
      "Orta Fırat ve Dicle bölümlerinden oluşur.",
      "GAP ile sulanan alanlarda pamuk, mısır ve kırmızı mercimek üretimi önem kazanmıştır.",
      "Yaz sıcaklığı ve buharlaşma yüksektir; doğal bitki örtüsü çoğunlukla bozkırdır.",
    ],
    "Kahramanmaraş Akdeniz, Elazığ Doğu Anadolu hedefidir; yakınlık seni yanıltmasın.",
  ),
  "iller-81": essential(
    "Türkiye'nin idari yapısında 81 il bulunur; oyun il adını doğrudan il sınırıyla eşleştirir.",
    [
      "İl merkezi noktasıyla il sınırı aynı şey değildir; kartı ilin gerçek alanına bırak.",
      "En küçük yüz ölçümlü iller batıda kümelenirken en geniş yüz ölçümlü il Konya'dır.",
      "Düzce 1999'da il olarak 81. sıraya eklenen son ildir.",
    ],
    "Benzer konumdaki küçük illerde komşuluk zinciri kur: Yalova–Kocaeli–Sakarya ve Bartın–Karabük–Zonguldak.",
  ),
  buyuksehirler: essential(
    "Büyükşehir belediyesi, nüfus ve yasal ölçütlerle kurulan bir yerel yönetim statüsüdür; coğrafi bölge türü değildir.",
    [
      "Türkiye'de büyükşehir belediyesi bulunan 30 il vardır.",
      "Büyükşehir sınırı il mülki sınırıyla örtüşür.",
      "Nüfusu yüksek her il otomatik olarak büyükşehir değildir; statü kanunla belirlenir.",
    ],
    "Haritada nüfus büyüklüğünü değil mevcut büyükşehir statüsünü eşleştir.",
  ),
  "sinir-kapilari": essential(
    "Sınır kapıları Türkiye'nin kara komşularına açılan uluslararası geçiş noktalarıdır.",
    [
      "Kapıkule–Bulgaristan, İpsala–Yunanistan, Sarp–Gürcistan temel eşleştirmeleridir.",
      "Gürbulak–İran, Habur–Irak ve Cilvegözü–Suriye sınavda sık kullanılan kapılardır.",
      "Kapının bulunduğu il ile açıldığı ülkeyi birlikte öğrenmek gerekir.",
    ],
    "Kapıkule'yi Yunanistan ile karıştırma: Edirne'deki Kapıkule Bulgaristan'a, İpsala Yunanistan'a açılır.",
  ),
} satisfies Record<string, TopicEssential>;

const agriculture = {
  "tum-tarim": essential(
    "Türkiye'de tarım ürünlerinin dağılışı iklim, sulama, toprak, yükselti ve pazar koşullarının birlikte sonucudur.",
    [
      "Karadeniz fındık–çay; Ege zeytin–üzüm–incir; Akdeniz turunçgil–muz; iç bölgeler tahıl ve şeker pancarıyla öne çıkar.",
      "GAP pamuk, mısır ve mercimek dağılışını Güneydoğu'da güçlendirmiştir.",
      "Harita hedefleri üretimin yapıldığı her ili değil ana yoğunlaşma merkezlerini gösterir.",
    ],
    "Tek yıllık üretim liderini kalıcı yetişme kuşağı sanma; ürünün ekolojik isteğini ve ana bölgesini birlikte düşün.",
  ),
  findik: essential(
    "Fındık, yıl boyu nemli ve ılıman koşulları seven; Karadeniz kıyı kuşağında yoğunlaşan bir üründür.",
    [
      "Ordu, Samsun, Düzce, Giresun, Sakarya ve Trabzon ana üretim merkezleridir.",
      "Doğu Karadeniz kadar Batı Karadeniz'deki Düzce–Sakarya kuşağı da doğrudur.",
      "Don veya tek yıllık rekolte değişimi kalıcı üretim kuşağını değiştirmez.",
    ],
    "Fındığı yalnız Giresun'la sınırlandırma; haritada hem Doğu hem Batı Karadeniz kümelerini ara.",
  ),
  cay: essential(
    "Çay, her mevsim yağış, yüksek nem ve yıkanmış asitli toprak isteyen Doğu Karadeniz ürünüdür.",
    [
      "Rize açık ara çekirdektir; Trabzon, Artvin ve Giresun da hedef kümesindedir.",
      "Kışların ılıman geçmesi don riskini sınırlar.",
      "Türkiye'deki üretim alanı kıyı boyunca dar bir kuşaktır.",
    ],
    "Çayı bütün Karadeniz'e yayma; yoğunlaşma Rize çevresindeki Doğu Karadeniz kıyısıdır.",
  ),
  kivi: essential(
    "Kivi, nemli kıyılar ve don riskinin düşük olduğu mikroklima alanlarında yetişen tamamlayıcı bir üründür.",
    [
      "Yalova ile Ordu–Samsun–Rize–Giresun kuşağı başlıca merkezlerdir.",
      "Bursa, Kocaeli ve Sakarya gibi nemli Marmara illeri de üretimde yer alır.",
      "Dağılış, kıyı nemi ve mikroklimayla ilişkilidir.",
    ],
    "Kiviyi yalnız Doğu Karadeniz ürünü sanma; Yalova ana sınav hedeflerinden biridir.",
    "Tamamlayıcı",
  ),
  celtik: essential(
    "Çeltik, yetişme döneminde bol su isteyen; pirincin kabuklu tarla ürünüdür.",
    [
      "Edirne ve Meriç–Ergene çevresi temel merkezdir.",
      "Samsun/Bafra, Balıkesir ve Çanakkale gibi sulanabilen ovalar da önemlidir.",
      "Su altında yetiştirme nedeniyle üretim alanları sağlık ve su yönetimi açısından denetlenir.",
    ],
    "Çeltik tarladaki kabuklu ürün, pirinç işlenmiş üründür; kavramları karıştırma.",
  ),
  aycicegi: essential(
    "Ayçiçeği, yağ sanayisinin temel bitkilerinden biridir; Trakya klasik üretim kuşağıdır.",
    [
      "Tekirdağ, Edirne ve Kırklareli yağlık ayçiçeğinde çekirdektir.",
      "Toplam yağlık ve çerezlik üretimde Konya da güçlüdür.",
      "Adana, Eskişehir ve İç Anadolu'daki sulanan alanlar dağılışı genişletir.",
    ],
    "Soruda yağlık mı toplam üretim mi istendiğini ayır; lider il buna göre değişebilir.",
  ),
  kanola: essential(
    "Kanola ya da kolza, serin koşullara uyumlu bir yağ bitkisidir.",
    [
      "Ana kuşak Tekirdağ–Edirne–Kırklareli ile Trakya'dır.",
      "Konya, Ankara ve Eskişehir iç bölgelerdeki tamamlayıcı hedeflerdir.",
      "Ekim nöbetinde ve bitkisel yağ üretiminde kullanılır.",
    ],
    "Kanolanın ana bölgesini Trakya olarak sabitle; tek bir il liderliğine bağlanma.",
    "Tamamlayıcı",
  ),
  zeytin: essential(
    "Zeytin, kışları ılık Akdeniz iklimini isteyen ve kıyı kuşağında yoğunlaşan çok yıllık bir üründür.",
    [
      "Ege'de Manisa–Aydın–İzmir–Muğla, Güney Marmara'da Balıkesir–Bursa–Çanakkale çekirdektir.",
      "Hatay, Mersin ve Antalya Akdeniz kuşağındaki önemli hedeflerdir.",
      "Yağlık ve sofralık üretim ile var–yok yılı il sıralamasını değiştirebilir.",
    ],
    "Zeytini yalnız Ege'ye sıkıştırma; Güney Marmara ve Akdeniz de doğru kuşaktır.",
  ),
  uzum: essential(
    "Üzüm, yaz sıcaklığı ve güneşlenme isteyen; kurutmalık, sofralık ve şaraplık alt türlere ayrılan bağ ürünüdür.",
    [
      "Manisa çekirdeksiz kuru üzümün temel merkezidir.",
      "Ege dışında Güneydoğu, Kapadokya ve Trakya'da da bağcılık kümelenir.",
      "Denizli, Mersin, Gaziantep, Elazığ ve Nevşehir sınavda önemli eşleştirmelerdir.",
    ],
    "Ürünün alt türünü kontrol et; bağ alanı ile belirli üzüm türünün liderliği aynı değildir.",
  ),
  hashas: essential(
    "Haşhaş, üretimi izin ve denetime bağlı olan; kapsülünden ilaç hammaddesi, tohumundan yağ elde edilen üründür.",
    [
      "Afyonkarahisar en güçlü tarihsel ve sınavlık merkezdir.",
      "Uşak, Konya, Denizli, Amasya, Isparta ve Burdur izinli üretim kuşağındadır.",
      "İç Batı Anadolu yoğunlaşması temel mekânsal örüntüdür.",
    ],
    "İzin verilen tüm illerle fiilî ana üretim merkezlerini aynı liste sanma.",
  ),
  tutun: essential(
    "Tütün, işçilik isteyen bir sanayi bitkisidir; tarihsel Ege kuşağına ek olarak üretim Güneydoğu'ya yayılmıştır.",
    [
      "Denizli, Manisa, Uşak, Aydın ve Muğla Ege tütünüyle ilişkilidir.",
      "Adıyaman, Batman, Mardin ve Hatay güncel üretim kümelerindendir.",
      "Samsun ve Tokat kalıcı KPSS merkezleri arasında tutulur.",
    ],
    "Eski notlardaki yalnız-Ege dağılışına takılma; güncel Güneydoğu hedeflerini de bil.",
  ),
  incir: essential(
    "İncir, sıcak ve uzun yaz isteyen; özellikle Ege'nin çöküntü ovalarında yoğunlaşan meyvedir.",
    [
      "Aydın ve Büyük Menderes çevresi kuru incirin kesin merkezidir.",
      "İzmir ikinci ana Ege hedefidir.",
      "Bursa, Mersin, Hatay ve Antalya tamamlayıcı sıcak kuşak hedefleridir.",
    ],
    "İncirde Aydın'ı mutlaka sabitle; toplam yaş ürün ile kaliteli kuru incir odağı farklı okunabilir.",
  ),
  keten: essential(
    "Keten, lif ve tohum amacıyla yetiştirilebilen; Türkiye'de üretimi sınırlı bir sanayi bitkisidir.",
    [
      "Lif üretiminde Samsun ve Amasya klasik hedeflerdir.",
      "Tohum alt oyununda Uşak, Samsun ve Tokat ayrıştırılmalıdır.",
      "Küçük deneme üretimleri ana harita hedefi sayılmaz.",
    ],
    "Liflik keten ile tohumluk keteni tek dağılış gibi ezberleme.",
    "Tamamlayıcı",
  ),
  "keten-tohum": essential(
    "Tohumluk keten, liflik ketenden farklı üretim amacıyla; yağ ve tohum için yetiştirilir.",
    [
      "Uşak, Samsun ve Tokat tohum alt oyununun ana hedefleridir.",
      "Liflik ketenin Samsun–Amasya dağılışıyla aynı hedef kümesi kullanılmamalıdır.",
      "Üretim çok düşük olduğundan küçük deneme alanları ana merkez sayılmaz.",
    ],
    "Soruda kullanım amacını kontrol et: lif keteni ile tohum keteninin dağılışını birleştirme.",
    "Tamamlayıcı",
  ),
  susam: essential(
    "Susam, yüksek sıcaklık isteyen ve yağı için yetiştirilen bir üründür.",
    [
      "Antalya, Manisa, Muğla ve Uşak ana hedefler arasındadır.",
      "Adana–Osmaniye–Mersin sıcak kuşağı üretimi destekler.",
      "Dağılış Ege ve Akdeniz ağırlıklıdır.",
    ],
    "Susamı kurak iç bölgelerin ürünü gibi genelleme; sıcak kıyı kuşağı baskındır.",
    "Tamamlayıcı",
  ),
  gul: essential(
    "Yağ gülü, parfüm ve kozmetik sanayisinde kullanılan uçucu yağ için yetiştirilir.",
    [
      "Isparta kesin üretim ve işleme merkezidir.",
      "Burdur, Göller Yöresi'ndeki ikinci temel hedeftir.",
      "İlkbahar serinliği ve uygun yükselti kaliteyi destekler.",
    ],
    "Yağ gülü sorusunda Göller Yöresi ve özellikle Isparta eşleştirmesini kaçırma.",
    "Tamamlayıcı",
  ),
  elma: essential(
    "Elma, serin kış isteyen ve iç bölgelerin yüksek havzalarında yoğunlaşan meyvedir.",
    [
      "Isparta, Niğde ve Karaman ana üretim merkezleridir.",
      "Antalya'nın yüksek ilçeleri, Kayseri, Denizli ve Konya da önemli hedeflerdir.",
      "Amasya güncel payından bağımsız olarak kalıcı çeşit ve KPSS merkezidir.",
    ],
    "Amasya'yı yalnız güncel üretim sırasıyla değerlendirme; sınavdaki tarihsel çeşit merkezidir.",
  ),
  soya: essential(
    "Soya, yağ ve yem sanayisinde kullanılan; sıcaklıkla birlikte bol su isteyen bir üründür.",
    [
      "Adana ve Mersin'deki Çukurova çekirdek üretim alanıdır.",
      "Osmaniye, Kahramanmaraş ve Hatay yakın kuşaktaki hedeflerdir.",
      "GAP illeri ve Samsun sulama koşullarıyla tamamlayıcı üretim alanlarıdır.",
    ],
    "Soya için Çukurova'yı temel al; yağ bitkisi olmasını kuraklığa dayanıklı olduğu şeklinde yorumlama.",
    "Tamamlayıcı",
  ),
  "yer-fistigi": essential(
    "Yer fıstığı, sıcak ve gevşek toprak isteyen; Çukurova çevresinde yoğunlaşan yağ bitkisidir.",
    [
      "Adana ve Osmaniye ana üretim kuşağıdır.",
      "Osmaniye ürünün işleme ve coğrafi kimlik merkezidir.",
      "Hatay, Antalya, Kahramanmaraş ve Mersin diğer önemli hedeflerdir.",
    ],
    "Adı Osmaniye'yle özdeş olsa da üretim haritasında Adana'yı dışarıda bırakma.",
    "Tamamlayıcı",
  ),
  kayisi: essential(
    "Kayısı, yazı sıcak ve kurak, kışı soğuk iç havzalarda kaliteli ürün veren meyvedir.",
    [
      "Malatya kuru kayısı ve kalıcı sınav bilgisinin kesin merkezidir.",
      "Mersin, Kahramanmaraş, Elazığ ve Iğdır diğer önemli üretim hedefleridir.",
      "Don olayları tek yıllık liderliği değiştirse de Malatya'nın coğrafi önemi değişmez.",
    ],
    "Tek yıllık rekolte düşüşü nedeniyle Malatya'yı hedef listesinden çıkarma.",
  ),
  turunçgiller: essential(
    "Turunçgiller, don olaylarına hassas; kışları ılık kıyı ovalarında yetişen subtropikal ürün grubudur.",
    [
      "Mersin, Adana, Hatay ve Antalya ana Akdeniz kuşağıdır.",
      "Muğla, İzmir ve Aydın Ege'deki tamamlayıcı hedeflerdir.",
      "Limon–Mersin, portakal–Antalya/Adana, mandalina–Adana/Hatay/İzmir alt tür eşleştirmeleri önemlidir.",
    ],
    "Alt tür soruluyorsa genel turunçgil dağılışını doğrudan cevap olarak kullanma.",
  ),
  muz: essential(
    "Muz, yüksek sıcaklık ve neme ihtiyaç duyan, dona çok hassas tropikal kökenli üründür.",
    [
      "Anamur–Bozyazı çevresiyle Mersin ana çekirdektir.",
      "Alanya–Gazipaşa çevresiyle Antalya ikinci ana kuşaktır.",
      "Hatay ve Adana korunaklı alanlar ve örtü altı üretimle hedefe eklenir.",
    ],
    "Türkiye'de muzun dar kıyı mikroklimasına bağlı olduğunu unutma; iç kesimlere yayma.",
  ),
  avokado: essential(
    "Avokado, kış soğuklarına hassas subtropikal bir meyvedir.",
    [
      "Antalya'da Alanya–Gazipaşa ana üretim çekirdeğidir.",
      "Mersin ikinci önemli hedef, Muğla tamamlayıcı kıyı hedefidir.",
      "Dağılış don riskinin düşük olduğu Akdeniz kıyı mikroklimasıyla sınırlıdır.",
    ],
    "Avokadoyu geniş Akdeniz Bölgesi yerine Antalya–Mersin merkezli dar kıyı kuşağıyla düşün.",
    "Tamamlayıcı",
  ),
  pamuk: essential(
    "Pamuk, uzun ve sıcak yetişme dönemi ile sulama isteyen önemli bir sanayi bitkisidir.",
    [
      "Şanlıurfa ve Diyarbakır GAP kuşağının ana hedefleridir.",
      "Aydın–İzmir–Manisa Ege; Adana–Hatay Çukurova üretim kuşaklarıdır.",
      "Lif, dokuma ve yağ sanayisine ham madde sağlar.",
    ],
    "Pamuğu yalnız Çukurova ile eşleştiren eski ezbere takılma; güncel ana kuşak GAP'tır.",
  ),
  "antep-fistigi": essential(
    "Antep fıstığı, yaz kuraklığına dayanıklı ve Güneydoğu Anadolu'da yoğunlaşan uzun ömürlü bir üründür.",
    [
      "Şanlıurfa, Gaziantep, Siirt ve Adıyaman ana hedeflerdir.",
      "Kilis, Kahramanmaraş, Diyarbakır ve Mardin kuşağı tamamlar.",
      "Gaziantep yalnız ad ve işleme merkezi değil, doğru üretim hedefidir.",
    ],
    "Siirt fıstığı alt türünü bil; ürünün tamamını yalnız Gaziantep'e bağlama.",
  ),
  "kirmizi-mercimek": essential(
    "Kırmızı mercimek, kuraklığa dayanıklı ve Güneydoğu Anadolu'da yoğunlaşan baklagildir.",
    [
      "Şanlıurfa ve Diyarbakır ana üretim merkezleridir.",
      "Siirt, Batman ve Mardin Güneydoğu çekirdeğini tamamlar.",
      "Konya ve Elazığ daha sınırlı tamamlayıcı hedeflerdir.",
    ],
    "Kırmızı mercimeği Güneydoğu; yeşil mercimeği İç Anadolu ile eşleştir.",
  ),
  bugday: essential(
    "Buğday, Türkiye geneline yayılan ve kurak–yarı kurak iç bölgelerde yoğunlaşan temel tahıldır.",
    [
      "Konya, Şanlıurfa, Ankara ve Diyarbakır ana yoğunluk hedefleridir.",
      "Trakya, İç Anadolu ve Güneydoğu başlıca üretim kuşaklarıdır.",
      "Durum buğdayında Şanlıurfa–Mardin–Diyarbakır özellikle önemlidir.",
    ],
    "Oyun bütün üretim yapılan illeri değil yoğun üretim merkezlerini sorar; haritanın yarısını doğru sayma.",
  ),
  arpa: essential(
    "Arpa, buğdaya göre soğuğa ve kuraklığa daha dayanıklı; yem ve malt amacıyla yetiştirilen tahıldır.",
    [
      "Konya, Ankara, Afyonkarahisar ve Sivas ana üretim hedefleridir.",
      "İç Anadolu ile yüksek iç havzalar temel kuşaktır.",
      "Biralık arpada Karaman özel önem taşır.",
    ],
    "Yaygın üretim ile yoğunlaşma hedefini ayır; oyun ana merkezleri ölçer.",
  ),
  nohut: essential(
    "Nohut, kuraklığa dayanıklı ve nadas alanlarını değerlendiren bir baklagildir.",
    [
      "Ankara, Yozgat, Konya, Karaman ve Kırşehir ana İç Anadolu hedefleridir.",
      "Çorum, Kayseri, Sivas ve Kırıkkale kuşağı dağılışı tamamlar.",
      "Köklerinde azot bağlayan bakteriler toprak verimliliğine katkı sağlar.",
    ],
    "Nohudu İç Anadolu; kırmızı mercimeği Güneydoğu yoğunlaşmasıyla ayırt et.",
  ),
  "yesil-mercimek": essential(
    "Yeşil mercimek, karasal iç bölgelerde yetişen ve İç Anadolu'da yoğunlaşan baklagildir.",
    [
      "Yozgat, Konya ve Kırşehir ana hedeflerdir.",
      "Çorum, Ankara, Kayseri ve Çankırı üretim kuşağını tamamlar.",
      "Kurak koşullara uyumlu olsa da dağılışı kırmızı mercimekten farklıdır.",
    ],
    "Renk ayrımını haritaya taşı: yeşil mercimek İç Anadolu, kırmızı mercimek Güneydoğu.",
  ),
  misir: essential(
    "Dane mısır, sıcaklık ve bol su isteyen; gıda, yem ve sanayide kullanılan bir tahıldır.",
    [
      "Konya, Şanlıurfa, Adana ve Eskişehir ana üretim hedefleridir.",
      "Sulama, ürünün iç ve güney ovalardaki dağılışını belirler.",
      "Dane mısır ile silajlık mısırın il dağılışı aynı değildir.",
    ],
    "Soru alt türünü belirtirse dane ve silajlık verilerini birleştirme.",
  ),
  "seker-pancari": essential(
    "Şeker pancarı, ağır ve hasattan sonra hızla işlenmesi gereken; fabrikaya yakın yetiştirilen bir sanayi bitkisidir.",
    [
      "Konya, Kayseri, Yozgat, Aksaray ve Afyonkarahisar ana hedeflerdir.",
      "İç Anadolu ve İç Batı Anadolu'da yoğunlaşır.",
      "Kota, sulama ve fabrika konumu dağılışı doğrudan etkiler.",
    ],
    "Şeker pancarı–fabrika yakınlığı neden–sonuç ilişkisi ÖSYM'nin sevdiği temel bilgidir.",
  ),
  patates: essential(
    "Patates, serin iklim ve gevşek toprak isteyen bir yumru bitkisidir.",
    [
      "Kayseri, Niğde, Konya ve Afyonkarahisar ana iç bölge hedefleridir.",
      "Nevşehir, Sivas ve Aksaray yüksek plato üretimini tamamlar.",
      "İzmir ve Adana gibi kıyı illerinde erkenci üretim yapılır.",
    ],
    "Kıyıdaki erkenci üretimi görünce ana yüksek plato kuşağını unutma.",
  ),
  kenevir: essential(
    "Kenevir, lif, tohum ve farklı sanayi kullanım alanları bulunan; üretimi mevzuata bağlı bir bitkidir.",
    [
      "Konya güncel fiilî üretimde öne çıkar.",
      "Samsun tarihsel KPSS ve ihtisas merkezi; Amasya ve Çorum diğer hedeflerdir.",
      "İzin verilen il listesi, anlamlı üretim yapılan il listesiyle aynı değildir.",
    ],
    "Mevzuatta izinli bütün illeri ana üretim hedefi sayma.",
    "Tamamlayıcı",
  ),
  anason: essential(
    "Anason, uçucu yağı ve aromatik tohumu için yetiştirilen sıcak iklim bitkisidir.",
    [
      "Burdur, Denizli ve Afyonkarahisar ana hedeflerdir.",
      "Antalya, Konya ve Muğla Güneybatı kuşağını tamamlar.",
      "Göller Yöresi ve Güneybatı Anadolu temel dağılış alanıdır.",
    ],
    "Anasonu Göller Yöresi–Güneybatı Anadolu eşleştirmesiyle hatırla.",
    "Tamamlayıcı",
  ),
  aspir: essential(
    "Aspir, kuraklığa dayanıklı ve yağ elde edilen bir iç bölge bitkisidir.",
    [
      "Kayseri, Konya, Isparta ve Aksaray başlıca hedeflerdir.",
      "Nevşehir, Sivas, Kırşehir ve Yozgat kuşağı tamamlar.",
      "Sulama gereksiniminin görece düşük olması yarı kurak alanlarda avantaj sağlar.",
    ],
    "Aspirin temel ipucu kuraklık dayanımıdır; ayçiçeğinin Trakya kuşağıyla karıştırma.",
    "Tamamlayıcı",
  ),
  "kuru-fasulye": essential(
    "Kuru fasulye, iç bölgelerin sulanabilen yüksek alanlarında yoğunlaşan baklagildir.",
    [
      "Niğde ve Konya ana üretim merkezleridir.",
      "Bitlis, Nevşehir, Karaman ve Kayseri diğer önemli hedeflerdir.",
      "Gümüşhane gibi serin yüksek alanlar da dağılışa katılır.",
    ],
    "Kuru fasulyeyi yalnız İç Anadolu'yla sınırlama; Bitlis ve Gümüşhane yüksek alanlarını da bil.",
  ),
} satisfies Record<string, TopicEssential>;

const livestock = {
  "tum-hayvancilik": essential(
    "Hayvancılığın dağılışı iklim, bitki örtüsü, yem, pazar ve işletme yapısının ortak sonucudur.",
    [
      "Erzurum–Kars çayırları büyükbaş; İç Anadolu bozkırı koyun; Toroslar kıl keçisiyle eşleşir.",
      "Ankara tiftik, Samsun manda, Ordu bal ve Diyarbakır güncel ipek kozası için çekirdek hedeftir.",
      "Ülke geneline yayılan faaliyetlerde oyun ana yoğunluk merkezlerini sorar.",
    ],
    "Hayvan sayısını yalnız doğal koşulla açıklama; yem, pazar ve modern işletme etkisini de düşün.",
  ),
  sigir: essential(
    "Sığır yetiştiriciliği, doğal çayırların bulunduğu doğu illeriyle yem ve pazar avantajlı batı işletmelerinde yoğunlaşır.",
    [
      "Erzurum, Kars, Ardahan, Ağrı, Van ve Muş çayır–mera kuşağıdır.",
      "Konya, İzmir, Balıkesir ve Afyonkarahisar modern işletme ve yem avantajıyla öne çıkar.",
      "Faaliyet Türkiye geneline yayıldığından harita yalnız yoğunlaşma illerini ölçer.",
    ],
    "Büyükbaşı yalnız Doğu Anadolu'ya sıkıştırma; Konya ve batıdaki modern işletmeleri unutma.",
  ),
  manda: essential(
    "Manda, suya ve sulak–bataklık çevrelere uyumlu bir büyükbaş türüdür.",
    [
      "Samsun ve Kızılırmak Deltası en güçlü coğrafi eşleştirmedir.",
      "Diyarbakır ve İstanbul güncel varlıkta belirgin hedeflerdir.",
      "Bitlis, Muş, Tokat ve Afyonkarahisar diğer önemli merkezlerdir.",
    ],
    "Manda için Samsun–Diyarbakır–İstanbul üçlüsünü ve sulak alan bağını birlikte hatırla.",
  ),
  koyun: essential(
    "Koyun, kısa otlu bozkır ve kurak meralara uyumlu küçükbaş türüdür.",
    [
      "Van, Konya ve Şanlıurfa başlıca varlık merkezleridir.",
      "Diyarbakır, Ağrı, Muş, Mardin ve Ankara kuşağı dağılışı tamamlar.",
      "İç, Doğu ve Güneydoğu Anadolu ana yetiştiricilik alanlarıdır.",
    ],
    "Koyunu bozkırla; büyükbaşı uzun boylu çayırla eşleştir.",
  ),
  "kil-kecisi": essential(
    "Kıl keçisi, sarp, taşlık ve çalılık alanlara uyumlu küçükbaş türüdür.",
    [
      "Mersin, Antalya, Adana ve Hatay ana Akdeniz hedefleridir.",
      "Kahramanmaraş, Muğla, Isparta ve Burdur Toros kuşağını tamamlar.",
      "Ana coğrafi eşleştirme Toroslar ve Akdeniz'dir.",
    ],
    "Kıl keçisini Toroslar; tiftik keçisini Ankara ile ayır.",
  ),
  "tiftik-kecisi": essential(
    "Tiftik keçisi ya da Ankara keçisi, değerli tiftik lifi için yetiştirilir.",
    [
      "Ankara kesin ve ilk hatırlanacak hedeftir.",
      "Siirt, Mardin ve Şırnak desteklenen Güneydoğu tiftik kuşağıdır.",
      "Kırıkkale ve Bolu tamamlayıcı hedefler arasındadır.",
    ],
    "Ankara keçisini kıl keçisiyle karıştırma: ürünü tiftiktir.",
  ),
  aricilik: essential(
    "Arıcılık, zengin ve farklı dönemlerde çiçeklenen bitki örtüsüne bağlı; göçer yapılabilen bir faaliyettir.",
    [
      "Ordu ve Adana bal üretiminde, Muğla çam balı ve kovan varlığında öne çıkar.",
      "Sivas, Siirt, Aydın ve İzmir diğer ana yoğunluk hedefleridir.",
      "Faaliyet her bölgede yapılabildiği için harita yalnız başlıca merkezleri gösterir.",
    ],
    "Bal üretimi lideri ile kovan sayısı liderini aynı şey sanma; ölçütü oku.",
  ),
  "ipek-bocegi": essential(
    "İpek böcekçiliği, dut yaprağına ve yoğun emeğe bağlı; koza üretimi ile ipek sanayisini birleştiren faaliyettir.",
    [
      "Diyarbakır/Kulp güncel yaş koza üretiminin çekirdeğidir.",
      "Bursa–Bilecik tarihsel ipekçilik ve örgütlenme merkezidir.",
      "Eskişehir, Antalya/Alanya ve Sakarya tamamlayıcı hedeflerdir.",
    ],
    "Güncel koza merkezi Diyarbakır, tarihsel ipek sanayisi merkezi Bursa ayrımını koru.",
  ),
  kumes: essential(
    "Kümes hayvancılığı, pazara, yeme ve ulaşıma yakın modern tesislerde yoğunlaşır.",
    [
      "Etlik üretimde Manisa, Bolu, Sakarya ve Balıkesir öne çıkar.",
      "Yumurta üretiminde Afyonkarahisar, Manisa, Konya, İzmir ve Balıkesir çekirdektir.",
      "Etlik ve yumurtacı işletmelerin dağılışı ayrı değerlendirilmelidir.",
    ],
    "Tek bir kümes haritasıyla etlik ve yumurtacıyı birleştirme; soru alt türünü kontrol et.",
  ),
  "kumes-yumurta": essential(
    "Yumurta tavukçuluğu, yem, pazar ve modern tesislere yakın yoğun işletmelerde yapılır; etlik piliç dağılışından ayrıdır.",
    [
      "Afyonkarahisar, Manisa ve Konya ana yumurta üretim hedefleridir.",
      "İzmir ve Balıkesir diğer çekirdek merkezlerdir.",
      "Bolu–Sakarya etlik piliç kuşağını otomatik olarak yumurta kuşağına taşıma.",
    ],
    "Etlik ve yumurtacı tavukçuluk haritaları aynı değildir; alt türü okumadan cevap verme.",
  ),
} satisfies Record<string, TopicEssential>;

const landformsAndWater = {
  "tum-daglar": essential(
    "Türkiye genç, yüksek ve engebeli bir ülkedir; dağların ana uzanışı doğu–batı, yükselti artışı batıdan doğuyadır.",
    [
      "Kıvrım dağları yan basınçlarla, kırık dağlar faylanmayla, volkanik dağlar magma ürünlerinin birikmesiyle oluşur.",
      "Karadeniz ve Akdeniz'de dağlar kıyıya paralel; Ege'de genel olarak kıyıya dik uzanır.",
      "En yüksek dağ 5.137 metreyle volkanik Büyük Ağrı'dır.",
    ],
    "Dağın adını yalnız konumuyla değil oluşum türüyle birlikte öğren; Uludağ volkanik değildir.",
  ),
  "kivrim-daglari": essential(
    "Kıvrım dağları, eski deniz tabanlarında biriken tortulların yan basınçlarla kıvrılıp yükselmesiyle oluşur.",
    [
      "Yüksek kıvrım antiklinal, çukur kıvrım senklinaldir; Türkiye'nin genç kıvrımları Alp Orojeneziyle ilişkilidir.",
      "Kuzey Anadolu Dağları ile Toroslar iki ana kıvrım kuşağıdır.",
      "Kaçkar, Bolkar, Aladağlar ve Munzur temel harita hedefleridir.",
    ],
    "Karadeniz ve Akdeniz'de kıvrım dağlarının kıyıya paralel uzanması ulaşımı zorlaştırır ve boyuna kıyı oluşturur.",
  ),
  "kirik-daglari": essential(
    "Kırık dağlar, sert yer kabuğunun faylanmasıyla yüksekte kalan horst bloklarıdır; çöken bloklara graben denir.",
    [
      "Ege'de kuzeyden güneye Kaz–Madra–Yunt–Bozdağlar–Aydın–Menteşe sırası temel ezberdir.",
      "Aradaki Bakırçay, Gediz, Küçük Menderes ve Büyük Menderes grabenleri doğu–batı uzanır.",
      "Nur/Amanos MEB materyallerinde kırık dağ örneğidir; faylanma deprem ve jeotermali destekler.",
    ],
    "Uludağ volkanik değildir; eski kristalen kütle ve faylarla yükselmiş bir dağdır.",
  ),
  "volkanik-daglar": essential(
    "Volkanik dağlar, magmanın lav, kül ve tüf olarak yüzeye çıkıp birikmesiyle oluşur.",
    [
      "Ağrı, Tendürek, Süphan ve Nemrut Doğu Anadolu; Erciyes, Hasan, Melendiz ve Karadağ İç Anadolu hedefleridir.",
      "Diyarbakır/Şanlıurfa Karacadağ'ı ile Konya/Karapınar Karacadağ'ı iki ayrı volkanik hedeftir.",
      "Kula–Manisa Batı Anadolu'daki genç volkan konileri ve lavlarıyla önemlidir.",
    ],
    "Bitlis–Tatvan'daki volkanik Nemrut'u Adıyaman'daki Nemrut Dağı ile karıştırma.",
  ),
  "delta-ovalari": essential(
    "Delta ovası, akarsuyun denize ulaştığı yerde taşıdığı alüvyonları biriktirerek kıyıyı ilerletmesiyle oluşur.",
    [
      "Delta için bol alüvyon, sığ deniz/geniş kıta sahanlığı, zayıf dalga–akıntı ve az gelgit gerekir.",
      "Kızılırmak–Bafra, Yeşilırmak–Çarşamba, Seyhan+Ceyhan–Çukurova ve Göksu–Silifke çekirdek eşleştirmelerdir.",
      "Ege'de Bakırçay–Dikili/Bergama, Gediz–Menemen ve Büyük Menderes–Balat/Söke önemlidir.",
    ],
    "Antalya Ovası delta değildir; her kıyı ovasını delta sanma.",
  ),
  "karstik-ovalar": essential(
    "Karstik ova ya da polye, kalker, jips veya kaya tuzu gibi çözünebilen kayaçlarda oluşan geniş ve kapalı erime çukurluğudur.",
    [
      "Elmalı, Korkuteli ve Gembos Antalya; Kestel, Tefenni ve Gölhisar Burdur hedefleridir.",
      "Acıpayam–Denizli, Muğla Ovası ve Suğla–Konya diğer temel örneklerdir.",
      "Batı Toroslar, Göller Yöresi ve Güneybatı Anadolu'da yoğunlaşır.",
    ],
    "Amik Ovası karstik değil tektoniktir.",
  ),
  "tektonik-ovalar": essential(
    "Tektonik ova, faylanma ve çökme ile oluşan çanakların alüvyonla dolması sonucu gelişir.",
    [
      "Bursa, Adapazarı, Bolu ve Düzce batıdaki; Erzincan, Erzurum, Muş ve Iğdır doğudaki belirgin örneklerdir.",
      "Ege'deki Bakırçay–Gediz–Küçük/Büyük Menderes ovaları doğu–batı uzanan grabenlerdir.",
      "Verimli tarım alanı olmaları deprem risklerinin düşük olduğu anlamına gelmez.",
    ],
    "Ege grabenlerini tek il noktası olarak değil uzanan çöküntü hattı olarak düşün.",
  ),
  platolar: essential(
    "Plato, çevresine göre yüksek ya da belirgin, akarsularca derince yarılmış geniş düzlük alanıdır.",
    [
      "İç Anadolu'da Haymana, Cihanbeyli, Obruk, Bozok ve Uzunyayla yaygındır.",
      "Teke–Taşeli karstik; Erzurum–Kars ve Ardahan lav platosu; Çatalca–Kocaeli aşınım platosudur.",
      "En yaygın plato bölgesi İç Anadolu, en yüksek plato alanı Erzurum–Kars'tır.",
    ],
    "Her plato çok yüksek olmak zorunda değildir; oluşumunu ve ekonomik kullanımını birlikte öğren.",
  ),
  masifler: essential(
    "Masif, eski jeolojik zamanda oluşmuş, başkalaşıp sertleşmiş ve sonraki kıvrılmalara direnmiş kristalen temel kütledir.",
    [
      "Yıldız/Istranca, Kazdağı, Menderes, Kırşehir, Bitlis ve Alanya masifleri temel hedeflerdir.",
      "Menderes Masifi geniş Ege alanını, Kırşehir Masifi İç Anadolu çekirdeğini temsil eder.",
      "Masif tek bir dağ olmak zorunda değildir.",
    ],
    "Eski masifleri genç Alp kıvrım dağlarıyla karıştırma.",
    "Tamamlayıcı",
  ),
  "toprak-turleri": essential(
    "Topraklar oluşumunda iklim–bitki etkisi baskın zonal, yerel kayaç/su etkili intrazonal ve taşınmış genç azonal gruplara ayrılır.",
    [
      "Akdeniz–terra rossa, Erzurum–Kars–çernezyom, İç Anadolu–kahverengi/kestane step temel eşleştirmeleridir.",
      "Ergene'de vertisol; Tuz Gölü çevresinde halomorfik; delta ve ovalarda alüvyal toprak görülür.",
      "Çernezyom humusça zengindir fakat sert iklim tarımı sınırlar ve büyükbaşı destekler.",
    ],
    "Türkiye'de gerçek tropikal laterit temel sınav eşleştirmesi değildir.",
  ),
  "engebeli-alanlar": essential(
    "Engebeli alanlarda kısa mesafede yükselti farkı ve eğim fazladır.",
    [
      "Hakkâri–Cilo, Doğu/Batı Karadeniz, Teke–Taşeli, Menteşe ve Biga–Kaz kuşakları öne çıkar.",
      "Engebe ulaşımı ve makineleşmeyi zorlaştırır, tarım alanlarını parçalar ve nüfusu seyreltir.",
      "Akarsu hızı, aşındırma ve HES potansiyeli genellikle artar.",
    ],
    "Engebeyi yalnız yükseltiyle ölçme; yüzeyin eğim ve parçalanma derecesi belirleyicidir.",
  ),
  "duz-alanlar": essential(
    "Düz ve az eğimli alanlar geniş ova, plato tabanı ve delta yüzeylerinde görülür.",
    [
      "Ergene, Güney Marmara, Ege grabenleri, Konya ve Harran–Suruç–Ceylanpınar temel örneklerdir.",
      "Tarımda makineleşme, ulaşım ve yerleşme genellikle daha kolaydır.",
      "Tektonik ova düz olsa bile deprem riski taşıyabilir.",
    ],
    "Düzlük ile düşük deprem riski arasında otomatik bağ kurma.",
  ),
  "kiyi-tipleri": essential(
    "Kıyı tipi, dağların uzanışı, jeolojik yapı ve deniz seviyesinin vadiler üzerindeki etkisiyle biçimlenir.",
    [
      "Boyuna kıyı Karadeniz–Akdeniz; enine kıyı Ege'nin temel eşleştirmesidir.",
      "Ria Menteşe ve boğazlar; Dalmaçya Kaş–Kekova; limanlı Büyükçekmece–Küçükçekmece örnekleridir.",
      "Kalanklı kıyı Teke–Taşeli'nin karstik kanyon vadilerinde görülür.",
    ],
    "Türkiye'de fiyort–skyer yoktur; İstanbul'daki özel ad Haliç'i haliçli kıyı tipi sanma.",
  ),
  ruzgarlar: essential(
    "Rüzgâr yüksek basınçtan alçak basınca eser ve adını geldiği yönden alır.",
    [
      "Kuzey Yıldız, kuzeydoğu Poyraz, doğu Gündoğusu, güneydoğu Keşişleme'dir; Samyeli güneydoğulu rüzgâr için kullanılan bölgesel addır.",
      "Güney Kıble, güneybatı Lodos, batı Günbatısı, kuzeybatı Karayel'dir.",
      "Gündüz denizden karaya deniz meltemi; gece karadan denize kara meltemi eser.",
      "Vadi meltemi gündüz vadiden yamaca, dağ meltemi gece dağdan vadiye eser.",
      "Föhn dağ yamacından alçalırken ısınıp kurur; imbat Ege kıyılarındaki gündüz deniz meltemidir.",
    ],
    "Okun ucuna göre değil rüzgârın geldiği yöne göre adlandır: Lodos güneybatıdan, Poyraz kuzeydoğudan gelir.",
  ),
  akarsular: essential(
    "Akarsu, belirli bir yatakta eğim yönünde akan yüzey suyudur; debi su miktarı, rejim bunun yıl içindeki değişimidir.",
    [
      "Türkiye akarsuları çoğunlukla kısa, eğimli, hızlı ve düzensiz rejimlidir; HES gücü yüksek, ulaştırma değeri düşüktür.",
      "Kızılırmak–Yeşilırmak–Sakarya Karadeniz'e; Gediz ve Menderesler Ege'ye; Seyhan–Ceyhan–Göksu Akdeniz'e ulaşır.",
      "Fırat–Dicle Basra'ya, Aras–Kura Hazar'a; Çoruh Gürcistan üzerinden Karadeniz'e gider.",
    ],
    "Tamamı Türkiye'deki en uzun akarsu Kızılırmak'tır; Fırat daha uzun olsa da tamamı Türkiye'de değildir.",
  ),
  "tektonik-goller": essential(
    "Tektonik göller, yer kabuğundaki kırılma ve çökme sonucu oluşan çanaklarda su birikmesiyle gelişir.",
    [
      "Manyas, Uluabat, İznik, Sapanca ve Burdur temel batı örnekleridir.",
      "Tuz, Eber, Akşehir, Seyfe, Hazar ve Aktaş diğer önemli hedeflerdir.",
      "Denizli/Afyonkarahisar'daki tektonik Acıgöl, Konya/Karapınar'daki volkanik Acıgöl ile aynı değildir.",
    ],
    "Aynı adlı Acıgöl hedeflerini oluşum ve konumla ayır.",
  ),
  "volkanik-goller": essential(
    "Volkanik göller krater, kaldera ya da maar çukurlarının suyla dolmasıyla oluşur.",
    [
      "Nemrut–Bitlis kaldera, Meke ve Acıgöl–Karapınar maar örnekleridir.",
      "Nar/Narlıgöl–Niğde, Gölcük–Isparta ve Aygır–Bitlis diğer hedeflerdir.",
      "Kaldera kraterden daha geniş; maar magma ile yer altı suyunun patlamasıyla oluşur.",
    ],
    "Nemrut Kalderası Bitlis'tedir; Adıyaman'daki Nemrut Dağı ile karıştırma.",
  ),
  "karstik-goller": essential(
    "Karstik göller, çözünebilen kayaçlardaki erime çukurlarının suyla dolmasıyla oluşur.",
    [
      "Avlan–Antalya, Kestel ve Salda–Burdur başlıca örneklerdir.",
      "Kızören, Meyil ve Çıralı Konya/Obruk çevresinde yoğunlaşır.",
      "Hafik ve Tödürge Sivas'taki önemli karstik göllerdir.",
    ],
    "Salda'yı yalnız tektonik kabul eden eski sınıflandırmalara dikkat; güncel MEBİ özetinde karstik gruptadır.",
  ),
  "karma-goller": essential(
    "Karma oluşumlu göller, çanağın gelişmesinde ya da önünün kapanmasında birden fazla jeomorfolojik sürecin birlikte etkili olduğu göllerdir.",
    [
      "Beyşehir, Eğirdir, Kovada, Yarışlı ve Suğla için güvenli ifade tektonik–karstik karma oluşumdur.",
      "Van Gölü tektonik çanağın Nemrut lavlarıyla kapanması nedeniyle tektonik–volkanik set karma gölüdür.",
      "Tek bir oluşum etiketi, gölün gelişimindeki ikinci belirleyici süreci gizleyebilir.",
      "Gideğeni olan göller çoğunlukla tatlı; kurak kapalı havzadakiler çoğunlukla tuzlu, acı ya da sodalıdır; kayaç, iklim, derinlik ve beslenme de etkilidir.",
      "Türkiye'nin en büyük doğal gölü Van, en büyük tatlı su gölü Beyşehir'dir.",
    ],
    "Beyşehir–Eğirdir grubuyla Van Gölü'nün karma oluşumunu aynı alt tür sanma.",
  ),
  "buzul-goller": essential(
    "Buzul ya da sirk gölleri, yüksek dağlardaki buzul aşındırma çanaklarında oluşan küçük göllerdir.",
    [
      "Uludağ, Kaçkar, Ağrı, Erciyes, Cilo/Sat, Bolkar ve Aladağlar temel dağ hedefleridir.",
      "Türkiye'de buzullaşma alanı sınırlı olduğu için sayıları ve boyutları küçüktür.",
      "Güncel buzullar en çok yüksek Doğu Anadolu ve Doğu Karadeniz dağlarında görülür.",
    ],
    "Haritada çoğu hedef göl adı değil gölün bulunduğu yüksek dağ kütlesidir.",
  ),
  "volkanik-set": essential(
    "Volkanik set gölü, lavların bir vadi ya da çanağın çıkışını kapatmasıyla oluşur.",
    [
      "Çıldır, Erçek, Nazik, Haçlı ve Balık gölleri temel örneklerdir.",
      "Van Gölü tektonik çanağın Nemrut lavlarıyla kapanması nedeniyle karma tektonik–volkanik set gölüdür.",
      "Doğu Anadolu'daki genç volkanizma bu göl tipinin dağılışını açıklar.",
    ],
    "Van Gölü'nü yalnız tektonik ya da yalnız volkanik diye daraltma; karma oluşumu bil.",
  ),
  "aluvyon-set": essential(
    "Alüvyon set gölü, akarsuyun taşıdığı malzemenin bir çukurluğun önünü kapatmasıyla oluşur.",
    [
      "Marmara Gölü, Bafa, Köyceğiz, Mogan ve Eymir temel örneklerdir.",
      "Bafa eski bir körfezin Büyük Menderes alüvyonlarıyla denizden ayrılmasıyla oluşmuştur.",
      "Uzungöl'ün sınıflandırması kaynaklar arasında değiştiğinden konumu güvenli, tek oluşum yanıtı tartışmalıdır.",
    ],
    "Uzungöl'ü oluşum türünde tek doğruya zorlamadan Trabzon/Çaykara konumuyla öğren.",
  ),
  "kiyi-set": essential(
    "Kıyı seti ya da lagün, bir koy ağzının kıyı kordonuyla kapanması sonucu oluşur.",
    [
      "Büyükçekmece, Küçükçekmece ve Durusu/Terkos İstanbul hedefleridir.",
      "Akyatan Lagünü Adana/Karataş'tadır.",
      "Denizle bağlantı dar kanallarla sürebilir; suları tatlı, tuzlu ya da acı olabilir.",
    ],
    "Lagünü delta gölü veya baraj gölüyle karıştırma; belirleyici unsur kıyı kordonudur.",
  ),
  "heyelan-set": essential(
    "Heyelan set gölü, kayan kütlenin akarsu vadisinin önünü kapatmasıyla oluşur.",
    [
      "Abant ve Yedigöller–Bolu, Boraboy–Amasya, Zinav–Tokat temel örneklerdir.",
      "Sera–Trabzon, Tortum–Erzurum ve Sülüklü–Sakarya diğer önemli hedeflerdir.",
      "Nemli ve eğimli Karadeniz kuşağında örneklerin fazla olması heyelan koşullarıyla ilişkilidir.",
    ],
    "Tortum Gölü heyelan set; Tortum Şelalesi gölün çıkış ayağındaki düşüşle ilişkilidir.",
  ),
  barajlar: essential(
    "Baraj, sulama, enerji, içme suyu ve taşkın kontrolü amacıyla akarsu üzerine insan eliyle yapılan settir.",
    [
      "Atatürk–Fırat, Ilısu–Dicle ve Yusufeli–Çoruh temel eşleştirmelerdir.",
      "Fırat üzerinde Keban–Karakaya–Atatürk–Birecik–Karkamış sırası önemlidir.",
      "Yusufeli 275 metreyle Türkiye'nin en yüksek barajıdır; Atatürk rezervuar/dolgu büyüklüğüyle öne çıkar.",
    ],
    "Değişen toplam baraj sayısını değil baraj–akarsu–il eşleştirmesini öğren.",
  ),
  korfezler: essential(
    "Körfez, denizin karaya doğru geniş biçimde sokulduğu ve koydan daha büyük olan kıyı girintisidir.",
    [
      "Marmara'da İzmit–Gemlik–Bandırma–Erdek; Ege'de Saros'tan Gökova'ya kuzey–güney sırası önemlidir.",
      "Akdeniz'de Fethiye, Finike, Antalya, Mersin ve İskenderun batıdan doğuya dizilir.",
      "Ege'de körfezlerin çokluğu enine kıyı ve horst–graben yapısıyla ilişkilidir.",
    ],
    "İzmit ile Saros'u yalnız kıyı girintisi değil Kuzey Anadolu Fay sistemiyle ilişkili alanlar olarak da bil.",
  ),
  selaleler: essential(
    "Şelale, akarsu suyunun yataktaki belirgin eğim kırığından düşmesidir; tabanda dev kazanı gelişebilir.",
    [
      "Tortum–Erzurum, Muradiye–Van, Kapuzbaşı–Kayseri ve Girlevik–Erzincan birinci tur hedeflerdir.",
      "Düden, Kurşunlu ve Manavgat Antalya'daki temel üçlüdür.",
      "Erfelek, Palovit, Maral, Tomara ve Suuçtu ikinci tur eşleştirmeleridir.",
    ],
    "Değişken 'en yüksek şelale' ezberi yerine ad–il ve mümkünse akarsu eşleştirmesini öğren.",
  ),
} satisfies Record<string, TopicEssential>;

const climateAndVegetation = {
  "yagis-fazla-iller": distributionEssential(
    "Türkiye'de yıllık yağışın en yüksek olduğu alanlar, özellikle Doğu Karadeniz kıyı ve dağ kuşağında toplanır.",
    [
      "Rize, Artvin, Trabzon ve Giresun Doğu Karadeniz'deki temel yağış kümesidir.",
      "Zonguldak ve Bartın, Batı Karadeniz'in denize dönük yamaçlarını temsil eder.",
      "Denize yakınlık tek başına yetmez; dağların uzanışı ve bakı yağış miktarını değiştirir.",
    ],
    "En yağışlı il sorusunda Rize'yi; dağılış sorusunda kıyıya paralel dağların yükselme yağışını düşün.",
  ),
  "kuraklik-yuksek-iller": distributionEssential(
    "Kuraklık belirginliği yağış azlığı ve yüksek buharlaşmanın birleştiği İç Anadolu ile Güneydoğu kuşaklarında artar.",
    [
      "Konya, Karaman ve Aksaray kapalı havza ve karasallık etkisini gösterir.",
      "Şanlıurfa ve Mardin'de yaz sıcaklığı ile buharlaşma çok yüksektir.",
      "Iğdır, çevresindeki yüksek alanlara rağmen mikroklima niteliğinde kurak bir ovadır.",
    ],
    "Kuraklığı yalnız güneyde arama; Konya kapalı havzası ve Iğdır Ovası güçlü ayırt edicilerdir.",
  ),
  "akdeniz-iklimi-iller": distributionEssential(
    "Akdeniz ikliminde yazlar sıcak-kurak, kışlar ılık-yağışlıdır; güney ve batı kıyılarında belirgindir.",
    [
      "Antalya, Mersin, Adana ve Hatay güney kıyı kuşağının çekirdeğidir.",
      "Muğla ve İzmir, Ege kıyılarındaki Akdeniz iklimi etkisini temsil eder.",
      "Dağların kıyıya göre uzanışı deniz etkisinin iç kesimlere sokulma mesafesini değiştirir.",
    ],
    "Coğrafi bölge adıyla iklim alanını eşitleme; Ege kıyılarında da Akdeniz iklimi görülür.",
  ),
  "sert-karasal-iklim-iller": distributionEssential(
    "Sert karasal iklim, yükseltinin ve denizden uzaklığın fazla olduğu doğu iç kesimlerinde uzun ve soğuk kışlarla görülür.",
    [
      "Erzurum, Kars ve Ardahan yüksek plato koşullarının temel kümesidir.",
      "Ağrı ve Hakkâri yükselti ve engebe nedeniyle sert kışlara sahiptir.",
      "Sivas, Doğu Anadolu dışında sert karasal özelliklerin güçlü hissedildiği iç merkezdir.",
    ],
    "Enlemden önce yükseltiyi düşün; Erzurum-Kars platosu sert karasal iklimin klasik sınav alanıdır.",
  ),
  "orman-yogun-iller": distributionEssential(
    "Orman oranının yüksek olduğu iller, yağışlı Karadeniz kuşağı ve kıyıya bakan dağlık alanlarda yoğunlaşır.",
    [
      "Karabük, Bartın ve Kastamonu Batı Karadeniz orman kuşağının çekirdeğidir.",
      "Bolu ve Düzce nemli dağ yamaçlarıyla yüksek orman oranına sahiptir.",
      "Artvin, engebe ve nemin koruduğu Doğu Karadeniz ormanlarını temsil eder.",
    ],
    "Toplam orman alanı ile il yüz ölçümüne göre orman oranını karıştırma; soru kökünü dikkatle oku.",
  ),
  "maki-iller": distributionEssential(
    "Maki, Akdeniz iklimindeki kızılçam ormanlarının tahribiyle yaygınlaşan her dem yeşil çalı topluluğudur.",
    [
      "Antalya, Mersin, Adana ve Hatay güney kıyı kuşağını oluşturur.",
      "Muğla ve İzmir'de Ege kıyılarından içeriye sokulan Akdeniz etkisiyle maki görülür.",
      "Maki doğal iklim göstergesidir; bozkır gibi kurak iç bölge örtüsü değildir.",
    ],
    "Makiyi Akdeniz Bölgesi sınırıyla sınırlama; Ege kıyılarında da maki kuşağı belirgindir.",
  ),
  "bozkir-iller": distributionEssential(
    "Bozkır, ilkbahar yağışlarıyla yeşerip yaz kuraklığında sararan kısa boylu ot topluluğudur.",
    [
      "Konya, Ankara, Eskişehir ve Yozgat İç Anadolu bozkır çekirdeğidir.",
      "Karaman kapalı havza; Sivas yüksek ve karasal iç kesim örneğidir.",
      "Bozkırın genişlemesinde yağış azlığı kadar orman tahribi de etkili olabilir.",
    ],
    "Bozkırı çayırla karıştırma; çayır yaz yağışlı yüksek alanlarda yeşil kalırken bozkır yazın kurur.",
  ),
  "kizilcam-iller": distributionEssential(
    "Kızılçam, sıcak ve kurak yaz koşullarına uyumlu, Akdeniz ve Ege kıyılarının alçak kesimlerinde yaygın bir iğne yapraklıdır.",
    [
      "Antalya, Mersin, Muğla ve Adana ana kızılçam kuşağındadır.",
      "İzmir batı kıyısı, Hatay doğu Akdeniz uzantısını temsil eder.",
      "Yükselti arttıkça kızılçam yerini karaçam, sedir ve göknar gibi türlere bırakabilir.",
    ],
    "Kızılçamı kıyının sıcak alçak kesimleriyle; karaçamı daha yüksek ve karasal alanlarla eşleştir.",
  ),
  "ladin-iller": distributionEssential(
    "Ladin, Türkiye'de doğal yayılışı büyük ölçüde Doğu Karadeniz'in çok nemli dağlık kesimleriyle sınırlı bir ağaçtır.",
    [
      "Rize ve Artvin ladinin en güçlü doğal yayılış merkezleridir.",
      "Trabzon ve Giresun kuşağın batıya uzanan diğer temel illeridir.",
      "Sürekli nem ve serin dağ koşulları ladin dağılışını belirler.",
    ],
    "Ladin sorusunda bütün Karadeniz'i işaretleme; Doğu Karadeniz'in nemli yüksek kesimlerine odaklan.",
  ),
  "saricam-iller": distributionEssential(
    "Sarıçam, soğuğa dayanıklı olup Türkiye'de yüksek ve karasal alanlarla serin dağ kuşaklarında yayılır.",
    [
      "Erzurum ve Kars sarıçamın yüksek plato çevresindeki temel merkezleridir.",
      "Artvin kuzeydoğu yayılışını; Bolu ve Kastamonu batıdaki dağ ormanlarını temsil eder.",
      "Türün dağılışı sıcak kıyılardan çok soğuk ve yüksek alanlarla ilişkilidir.",
    ],
    "Sarıçamı kızılçamla karıştırma: sarıçam soğuk-yüksek, kızılçam sıcak-kıyı koşullarını gösterir.",
  ),
} satisfies Record<string, TopicEssential>;

const disasters = {
  "deprem-riski-yuksek-iller": distributionEssential(
    "Deprem riski, Kuzey Anadolu, Doğu Anadolu ve Batı Anadolu fay sistemleri boyunca yüksek değerler gösterir.",
    [
      "Kocaeli ve Düzce Kuzey Anadolu Fayının batı; Erzincan doğu kesimindeki temel hedeflerdir.",
      "İzmir, Manisa ve Balıkesir Batı Anadolu'nun kırıklı yapısını temsil eder.",
      "Bingöl ve Hatay Doğu Anadolu fay kuşağındaki kritik düğümlerdir.",
    ],
    "Deprem tehlikesi ile nüfus kaynaklı afete dönüşme riskini ayır; harita fay kuşağını sorar.",
  ),
  "heyelan-riski-yuksek-iller": distributionEssential(
    "Heyelan riski; eğim, fazla yağış ve gevşek zemin koşullarının birleştiği Karadeniz yamaçlarında yoğunlaşır.",
    [
      "Rize, Trabzon, Artvin ve Giresun Doğu Karadeniz'in çekirdek heyelan alanlarıdır.",
      "Ordu ve Kastamonu risk kuşağının batıya uzanan önemli örnekleridir.",
      "Bitki örtüsü riski azaltabilse de aşırı eğim ve suya doygun zemin belirleyicidir.",
    ],
    "Heyelanda yalnız yağışı değil eğimi de ara; düz ve yağışlı alan aynı ölçüde riskli değildir.",
  ),
  "sel-riski-yuksek-iller": distributionEssential(
    "Sel ve taşkın riski, kısa sürede şiddetli yağış alan dar kıyı havzaları ile akarsu tabanlarında yükselir.",
    [
      "Samsun, Ordu, Rize ve Trabzon Karadeniz kıyı havzalarını temsil eder.",
      "Bartın ve Zonguldak Batı Karadeniz'in dar vadili, yağışlı örnekleridir.",
      "Plansız yapılaşma ve geçirimsiz yüzeyler doğal tehlikenin zarara dönüşmesini artırır.",
    ],
    "Sel ile taşkını ayır: sel hızlı yüzey akışı, taşkın akarsuyun yatağından çıkmasıdır.",
  ),
  "cig-riski-yuksek-iller": distributionEssential(
    "Çığ riski, uzun süre kar örtüsü bulunan yüksek ve eğimli Doğu Anadolu dağlarında belirgindir.",
    [
      "Hakkâri, Bitlis ve Van yüksek, dik yamaçlı güneydoğu kümesidir.",
      "Ağrı, Erzurum ve Bingöl uzun kar süresi bulunan diğer temel illerdir.",
      "Kar kalınlığı kadar eğim, rüzgârla birikme ve sıcaklık değişimi de çığı etkiler.",
    ],
    "Çığ için sadece kar yağışını değil yüksek eğimli yamaç ve uzun kar örtüsü birlikteliğini ara.",
  ),
  "orman-yangini-riski-yuksek-iller": distributionEssential(
    "Orman yangını riski, sıcak-kurak yazların yaşandığı Akdeniz ve Ege kıyı ormanlarında yükselir.",
    [
      "Antalya ve Muğla en belirgin turizm-orman kesişim alanlarıdır.",
      "İzmir batı kıyısını; Mersin, Adana ve Hatay doğu Akdeniz kuşağını tamamlar.",
      "Rüzgâr, düşük nem ve insan etkinliği yangının başlamasını ve yayılmasını hızlandırabilir.",
    ],
    "Orman varlığının fazla olması tek başına yeterli değildir; yaz kuraklığının belirgin olduğu kıyıları düşün.",
  ),
  "kuraklik-riski-yuksek-iller": distributionEssential(
    "Kuraklık riski, yağışın az ve değişken, buharlaşmanın yüksek olduğu iç ve güneydoğu havzalarda belirgindir.",
    [
      "Konya, Karaman ve Aksaray İç Anadolu'nun kapalı havza kümesidir.",
      "Şanlıurfa, Mardin ve Kilis sıcak Güneydoğu kuşağını temsil eder.",
      "Sulama kuraklığın etkisini azaltır ancak su kaynakları üzerinde baskı da oluşturabilir.",
    ],
    "Kuraklık haritasında çöl arama; yağış-buharlaşma dengesi ve su açığı temel ölçüttür.",
  ),
} satisfies Record<string, TopicEssential>;

const populationAndSettlement = {
  "nufus-yogun-iller": distributionEssential(
    "Nüfus yoğunluğu; sanayi, hizmet, ulaşım ve istihdam olanaklarının güçlü olduğu batı ve büyük kentlerde artar.",
    [
      "İstanbul, Kocaeli ve Bursa Marmara sanayi-nüfus çekirdeğidir.",
      "İzmir Ege, Ankara İç Anadolu, Gaziantep Güneydoğu'nun başlıca yoğun merkezidir.",
      "Toplam nüfus ile aritmetik nüfus yoğunluğu aynı kavram değildir; yüz ölçümü sonucu değiştirir.",
    ],
    "Soru kökünde toplam nüfus mu yoğunluk mu sorulduğunu ayır; yüz ölçümü küçük Kocaeli özellikle önemlidir.",
  ),
  "nufus-seyrek-iller": distributionEssential(
    "Seyrek nüfus; engebe, sert iklim, sınırlı tarım alanı ve göç verme gibi koşulların birleştiği illerde görülür.",
    [
      "Tunceli, Bayburt, Ardahan ve Gümüşhane temel seyrek nüfus kümesidir.",
      "Hakkâri'de engebe; Sinop'ta göç ve erişilebilirlik etkileri belirgindir.",
      "İl nüfusunun az olması ile kırsal yerleşme dokusunun seyrekliği ilişkili ancak aynı değildir.",
    ],
    "Seyrek nüfusta yalnız doğuyu düşünme; Sinop gibi göç veren Karadeniz illeri de sınav hedefidir.",
  ),
  "kentlesme-yuksek-iller": distributionEssential(
    "Kentleşme oranı, nüfusun il ve ilçe merkezlerinde yaşama payını gösterir ve sanayi-hizmet merkezlerinde yükselir.",
    [
      "İstanbul, Ankara ve İzmir ülkenin en büyük hizmet ve yönetim merkezleridir.",
      "Bursa ve Kocaeli sanayi; Gaziantep üretim ve ticaret çekim merkezidir.",
      "Kentleşme oranı yüksekliği, plansız kentleşmenin olmadığı anlamına gelmez.",
    ],
    "Kentleşme oranını toplam nüfusla eşitleme; ölçüt kentlerde yaşayan nüfusun il toplamına oranıdır.",
  ),
  "yasli-nufus-yuksek-iller": distributionEssential(
    "Yaşlı nüfus oranı, gençlerin göç ettiği ve doğurganlığın görece düşük olduğu kuzey-batı illerinde yükselir.",
    [
      "Sinop, Kastamonu ve Giresun Karadeniz'deki temel yaşlı nüfus kümesidir.",
      "Artvin göç etkisini; Balıkesir ve Çanakkale batıdaki yaşlı nüfus yapısını temsil eder.",
      "Yaşlı nüfus sayısı ile toplam nüfus içindeki yaşlı oranı birbirinden farklıdır.",
    ],
    "İstanbul'da yaşlı sayısı yüksek olabilir; ancak sınavda sorulan yaşlı nüfus oranının yüksekliğidir.",
  ),
  "genc-nufus-yuksek-iller": distributionEssential(
    "Genç nüfus oranı, doğurganlığın görece yüksek olduğu Güneydoğu ve Doğu Anadolu illerinde belirgindir.",
    [
      "Şanlıurfa ve Şırnak genç nüfus yapısının en belirgin merkezlerindendir.",
      "Ağrı, Siirt, Muş ve Hakkâri doğu-güneydoğu kümesini tamamlar.",
      "Genç nüfus oranı eğitim, istihdam ve bağımlı nüfus gereksinimini etkiler.",
    ],
    "Genç nüfusu göç alan büyük kentlerle otomatik eşleştirme; oran üzerinde doğurganlık güçlüdür.",
  ),
  "goc-alan-iller": distributionEssential(
    "Göç alan iller, iş, eğitim, turizm, sanayi ve hizmet fırsatlarının güçlü olduğu çekim merkezleridir.",
    [
      "İstanbul, Ankara ve İzmir çok yönlü metropol çekim merkezleridir.",
      "Antalya turizm-hizmet; Kocaeli sanayi; Tekirdağ İstanbul çevresi üretim etkisiyle öne çıkar.",
      "Net göç hızı dönemsel değişebilir; kalıcı çekim nedenleri ekonomik yapı ile açıklanır.",
    ],
    "Tek yıllık sıralamayı ezberlemek yerine göçün sanayi, hizmet ve turizm nedenlerini haritayla ilişkilendir.",
  ),
  "goc-veren-iller": distributionEssential(
    "Göç veren illerde sınırlı istihdam, sert doğal koşullar ve eğitim-hizmet arayışı nüfus çıkışını destekler.",
    [
      "Ağrı, Muş, Kars, Erzurum ve Van doğudaki temel göç verme kümesidir.",
      "Yozgat İç Anadolu'da uzun süreli dış göçle öne çıkan bir örnektir.",
      "Göç verme nüfusu azaltırken yaş yapısını ve kırsal hizmet gereksinimini de değiştirir.",
    ],
    "Göçün yönünü karıştırma; bu illerden büyük sanayi ve hizmet merkezlerine doğru hareket beklenir.",
  ),
} satisfies Record<string, TopicEssential>;

const environment = {
  "milli-parklar": essential(
    "Millî park, bilimsel, estetik, doğal ya da kültürel değeri seçkin geniş alanların koruma ve kontrollü kullanım statüsüdür.",
    [
      "İlk millî park 1958'de ilan edilen Yozgat Çamlığı'dır.",
      "5 Ağustos 2026 bilgi kesiminde 50 millî park vardır; en yenisi 2025'te ilan edilen Geben Vadisi–Kahramanmaraş'tır.",
      "Kuşcenneti, Uludağ, Yedigöller, Dilek Yarımadası, Munzur, Kazdağı ve Cilo–Sat çekirdek harita hedefleridir.",
    ],
    "Göreme eski kaynakların aksine güncel millî park listesinde değildir; sayı ve en yeni bilgisini tarih vererek kullan.",
  ),
  ramsar: essential(
    "Ramsar alanı, 1971 Ramsar Sözleşmesi kapsamında uluslararası öneme sahip kabul edilen sulak alandır.",
    [
      "Türkiye 1994'te sözleşmeye taraf olmuştur.",
      "Türkiye'de 14 Ramsar alanı bulunur; Sultan Sazlığı, Manyas, Göksu Deltası ve Kızılırmak Deltası çekirdek örneklerdir.",
      "Meke Maarı ve Kızören Obruğu Konya; Nemrut Kalderası Bitlis hedefidir.",
    ],
    "Her korunan sulak alan Ramsar değildir; statü adını kontrol et.",
  ),
  "endemik-bitkiler": essential(
    "Endemik tür, doğal yayılışı belirli ve dar bir coğrafi alanla sınırlı olan türdür.",
    [
      "Kazdağı göknarı–Balıkesir, Kasnak meşesi–Isparta ve sevgi çiçeği–Ankara çekirdek eşleştirmeleridir.",
      "Muş lalesi–Muş ve Tunceli sarımsağı–Tunceli diğer önemli hedeflerdir.",
      "Relikt tür geçmişte daha genişken günümüzde dar alanda kalmıştır; endemikle aynı kavram değildir.",
    ],
    "Sığla ve Datça hurmasını yalnız Türkiye'ye özgü endemik diye genelleme; önemli relikt türlerdir.",
  ),
  "relikt-bitkiler": essential(
    "Relikt tür, geçmiş jeolojik ya da iklim koşullarında daha geniş alana yayılmışken günümüzde dar ve korunaklı alanlarda kalmış türdür.",
    [
      "Sığla ağacı Muğla–Köyceğiz/Marmaris çevresindeki temel relikt hedeftir.",
      "Datça hurması Muğla–Datça ve Güneybatı Anadolu kıyılarında görülür.",
      "Istranca meşesi ve bazı lokal orman toplulukları geçmiş iklimlerin kalıntısını taşır.",
    ],
    "Relikt ile endemiği eş anlamlı sanma; relikt geçmiş yayılışı, endemik güncel doğal yayılış sınırını anlatır.",
    "Tamamlayıcı",
  ),
  "orman-alanlari": essential(
    "Korunan orman statüleri amaçlarına göre tabiatı koruma alanı, muhafaza ormanı, gen koruma ormanı ve tohum meşceresi olarak ayrılır.",
    [
      "Tabiatı koruma alanı bozulmamış ekosistemi bilim ve eğitim için sıkı korur.",
      "Muhafaza ormanı toprağı, suyu ve yerleşmeyi; gen koruma ormanı doğal genetik çeşitliliği korur.",
      "Kasnak Meşesi–Isparta, Kazdağı Göknarı–Balıkesir, Camili–Artvin, Hacıosman–Samsun ve Kargı Köyü Sığla Ormanı–Burdur çekirdek örneklerdir.",
      "2025 resmî sayıları 32 tabiatı koruma alanı, 55 muhafaza ormanı, 386 gen koruma ormanı ve 306 tohum meşceresidir.",
    ],
    "Tabiat parkı, tabiat anıtı ve millî parkı birbirinin yerine kullanma; koruma statüsü sınavın kendisi olabilir.",
    "Tamamlayıcı",
  ),
  "yeni-korunan-alanlar-2026": essential(
    "2026'da ilan edilen yeni korunan alanlar, statü adı ve il eşleştirmesiyle güncel sınav bilgisidir.",
    [
      "Yedimeşe–Giresun/Bulancak 10 Şubat 2026'da tabiat parkı ilan edildi.",
      "Dilimkayalar–Tokat/Niksar aynı tarihte tabiat anıtı statüsü aldı.",
      "Akhisar Musalar–Manisa ve Erikçe–Gaziantep 8 Haziran 2026'da tabiat parkı ilan edildi.",
    ],
    "Bu alanları millî park sanma; Yedimeşe, Musalar ve Erikçe tabiat parkı, Dilimkayalar tabiat anıtıdır.",
    "Tamamlayıcı",
  ),
  magaralar: essential(
    "Mağara, özellikle kalkerin karbonik asitli sularla çözünmesi sonucu gelişen doğal yer altı boşluğudur.",
    [
      "Karain–Antalya Paleolitik buluntularıyla; İnsuyu–Burdur turizme açılan ilk mağaralardan olmasıyla önemlidir.",
      "Damlataş, Dim ve Altınbeşik Antalya; Ballıca Tokat; Karaca Gümüşhane hedefidir.",
      "Dupnisa–Kırklareli, Gilindire–Mersin ve Tınaztepe–Konya diğer çekirdek eşleştirmelerdir.",
    ],
    "Mağaralarda ad–il bilgisinin yanında karstik oluşum koşulunu da bil.",
  ),
} satisfies Record<string, TopicEssential>;

const industry = {
  "serbest-bolgeler": essential(
    "Serbest bölge, ülke sınırları içinde olup gümrük, dış ticaret ve bazı mali uygulamalarda özel rejime tabi üretim–ticaret alanıdır.",
    [
      "5 Ağustos 2026 bilgi kesiminde Türkiye'de 19 faal serbest bölge vardır.",
      "İlk kurulan Mersin ve Antalya serbest bölgeleri 1987'de faaliyete başlamıştır.",
      "İzmir'de Ege, Menemen ve Batı Anadolu; Kocaeli'nde iki ayrı serbest bölge bulunduğuna dikkat et.",
    ],
    "Serbest bölgeyi ülke toprağı dışında sanma; yalnız özel ekonomik ve gümrük rejimi uygulanır.",
  ),
  "seker-fabrikalari": essential(
    "Şeker fabrikaları, ağır ve çabuk işlenmesi gereken şeker pancarına yakın iç bölge merkezlerinde kurulmuştur.",
    [
      "İlk temeli atılan fabrika Uşak'tır (1925).",
      "İlk Türk şekerini üreten fabrika Alpullu/Kırklareli'dir (26 Kasım 1926).",
      "Eskişehir, Turhal, Konya, Kayseri, Erzurum ve Afyonkarahisar tarihsel KPSS hedefleridir.",
    ],
    "'İlk fabrika' sorusunda temel atma ile ilk üretimi ayır: Uşak–Alpullu.",
  ),
  "sanayide-ilkler": essential(
    "Sanayide ilkler, Türkiye'nin ekonomik gelişimini tesis–il ve tarih eşleştirmesiyle ölçen klasik sınav konusudur.",
    [
      "İlk OSB Bursa (1962); ilk entegre demir–çelik Karabük'tür.",
      "Cumhuriyet'in ilk kâğıt–karton fabrikası İzmit (1936), ilk modern altın üretimi Ovacık/Bergama'dır.",
      "İlk ticari petrol Raman/Batman, ilk alüminyum tesisi Seydişehir/Konya, ilk YHT Ankara–Eskişehir'dir.",
    ],
    "Tesisin ilk kuruluşu, ilk üretimi ve güncel işletme durumunu aynı kavram sanma.",
  ),
  "demir-celik-fabrikalari": essential(
    "Demir-çelik sanayisi ağır ham madde, enerji, liman ve demiryolu bağlantılarının etkisiyle belirli merkezlerde toplanır.",
    [
      "KARDEMİR–Karabük, ERDEMİR–Ereğli/Zonguldak ve İSDEMİR–İskenderun/Hatay çekirdek eşleştirmelerdir.",
      "Aliağa–İzmir liman ve ithal ham madde bağlantısıyla öne çıkar.",
      "Osmaniye ve Sivas diğer önemli üretim merkezleridir.",
    ],
    "Demir yatağıyla fabrikayı karıştırma; Divriği çıkarım, Karabük ve Ereğli işleme merkezidir.",
  ),
  "petrol-rafinerileri": essential(
    "Petrol rafinerisi, ham petrolü yakıt ve petrokimya girdilerine dönüştüren büyük ölçekli sanayi tesisidir.",
    [
      "Batman rafinerisi yerli üretim sahasına yakın tarihsel merkezdir.",
      "İzmit/Kocaeli ve Aliağa/İzmir liman-pazar bağlantısıyla öne çıkar.",
      "Kırıkkale rafinerisi İç Anadolu pazarına ve boru hattına göre konumlanmıştır.",
    ],
    "Petrol çıkarılan illerle rafineri illerini aynı liste sanma; konum nedenlerini ayrı öğren.",
  ),
  "otomotiv-sanayisi": essential(
    "Otomotiv sanayisi, yan sanayi, nitelikli iş gücü, pazar ve ulaşım ağlarının güçlü olduğu Marmara'da yoğunlaşır.",
    [
      "Bursa, Kocaeli ve Sakarya üretim tesisleri ve yan sanayinin çekirdek kümesidir.",
      "İstanbul büyük pazar ve tedarik; Ankara ve İzmir diğer üretim merkezleridir.",
      "Dağılışta tek bir ham maddeye yakınlıktan çok pazar, liman ve ulaşım belirleyicidir.",
    ],
    "Otomotiv haritasında önce Bursa–Kocaeli–Sakarya Marmara üçlüsünü bul, sonra diğer merkezleri ekle.",
  ),
  "tekstil-sanayisi": essential(
    "Tekstil sanayisi ham madde, iş gücü, girişimcilik, pazar ve ihracat bağlantılarıyla çok merkezli bir yapı gösterir.",
    [
      "İstanbul ve Bursa geleneksel Marmara; Denizli Ege tekstil merkezidir.",
      "Gaziantep halı ve dokuma; Adana pamuk; Kayseri dokuma ve ev tekstiliyle öne çıkar.",
      "Pamuk üretim alanı ile tekstil fabrikasının konumu her zaman aynı değildir.",
    ],
    "Tarım haritasındaki pamuğu sanayi haritasındaki tekstille otomatik eşleme; pazar ve iş gücünü de düşün.",
  ),
  "kagit-fabrikalari": essential(
    "Kâğıt sanayisi selüloz, su, enerji, ulaşım ve pazar gereksinimi yüksek olan bir üretim koludur.",
    [
      "İzmit/Kocaeli Cumhuriyet döneminin ilk kâğıt fabrikası eşleştirmesidir.",
      "Çaycuma/Zonguldak, Balıkesir ve Dalaman/Muğla klasik harita hedefleridir.",
      "Aksu/Giresun Karadeniz'deki tarihsel sanayi merkezlerinden biridir.",
    ],
    "Kâğıtta yalnız ormana yakınlığı değil bol su, ulaşım ve pazar koşullarını birlikte değerlendir.",
  ),
  "gubre-fabrikalari": essential(
    "Gübre sanayisi tarımsal talep, kimyasal ham madde, enerji ve liman bağlantılarına göre konumlanır.",
    [
      "Kütahya ve Samsun iç-kuzey; Mersin ve İskenderun güney liman kuşağıdır.",
      "Bandırma/Balıkesir ve Gemlik/Bursa Marmara'nın liman-sanayi merkezleridir.",
      "Fabrika konumu yalnız gübre tüketiminin fazla olduğu tarım alanıyla açıklanamaz.",
    ],
    "Gübre tesislerinde tarım pazarının yanında liman, enerji ve kimyasal ham madde bağlantısını ara.",
  ),
} satisfies Record<string, TopicEssential>;

const mines = {
  demir: essential(
    "Demir, demir–çelik sanayisinin temel hammaddesidir.",
    [
      "Divriği–Sivas kesin ve ilk öğrenilecek yatak eşleştirmesidir.",
      "Hekimhan/Hasançelebi–Malatya ve Avnik–Bingöl diğer ana hedeflerdir.",
      "Karabük ve Ereğli demir cevheri yatağı değil, demir–çelik sanayi merkezidir.",
    ],
    "Maden çıkarma yeriyle işleme tesisini ayır: Divriği yatak, Karabük fabrika merkezidir.",
  ),
  bakir: essential(
    "Bakır, yüksek iletkenliği nedeniyle elektrik ve elektronik sanayisinde kullanılan metalik madendir.",
    [
      "Küre–Kastamonu ve Murgul–Artvin temel eşleştirmelerdir.",
      "Çayeli–Rize, Maden/Ergani–Elazığ ve Espiye–Giresun diğer hedeflerdir.",
      "Yatakların önemli bölümü Kuzey Anadolu kuşağında sıralanır.",
    ],
    "Küre'yi il sanma; Kastamonu'daki maden ilçesidir.",
  ),
  krom: essential(
    "Krom, paslanmaz çelik ve ferrokrom üretiminde kullanılan stratejik metalik madendir.",
    [
      "Guleman/Alacakaya–Elazığ kesin çekirdek hedeftir.",
      "Fethiye/Köyceğiz–Muğla, Kop–Erzincan, Sivas, Bursa ve Eskişehir diğer yatak alanlarıdır.",
      "Ferrokrom tesisleri Elazığ ve Antalya'dadır.",
    ],
    "Krom yatağı ile ferrokrom işleme tesisini ayrı öğren.",
  ),
  boksit: essential(
    "Boksit, alüminyum metalinin üretildiği temel ekonomik cevherdir.",
    [
      "Seydişehir–Konya kesin yatak ve alüminyum tesisi eşleştirmesidir.",
      "Akseki–Antalya, Milas–Muğla ve Saimbeyli–Adana diğer hedeflerdir.",
      "Toros karst kuşağı boksit yatakları açısından önemlidir.",
    ],
    "Boksit–Seydişehir–alüminyum üçlüsünü birlikte sabitle.",
  ),
  bor: essential(
    "Bor mineralleri cam, seramik, deterjan, tarım ve ileri teknolojide kullanılan stratejik hammaddelerdir.",
    [
      "Kırka–Eskişehir, Emet–Kütahya, Bigadiç–Balıkesir ve Kestelek–Bursa dört çekirdek hedeftir.",
      "Türkiye dünya bor rezervlerinin yaklaşık yüzde 73'üne sahiptir.",
      "Yataklar ağırlıkla İç Batı Anadolu ve Güney Marmara'da kümelenir.",
    ],
    "Dört merkezden birini atlama: Kırka–Emet–Bigadiç–Kestelek.",
  ),
  altin: essential(
    "Altın, değerli metal ve teknoloji hammaddesidir; yatak/rezerv bilgisi güncel işletme anlamına gelmez.",
    [
      "Ovacık/Bergama ve Efemçukuru İzmir'deki ana hedeflerdir.",
      "Kışladağ–Uşak, Çöpler/İliç–Erzincan ve Himmetdede–Kayseri diğer önemli merkezlerdir.",
      "Ovacık 2001'de başlayan ilk modern altın üretimiyle bilinir.",
    ],
    "Yatak konumunu faal işletme durumu şeklinde yorumlama; işletme statüsü değişebilir.",
  ),
  nikel: essential(
    "Nikel, paslanmaz çelik ve batarya teknolojilerinde kullanılan metalik madendir.",
    [
      "Gördes/Çaldağ–Manisa ana hedeftir.",
      "Banaz–Uşak, Mihalıççık–Eskişehir ve Mudurnu–Bolu diğer yatak alanlarıdır.",
      "Orhaneli–Bursa ve Dörtyol–Hatay tamamlayıcı eşleştirmelerdir.",
    ],
    "Manisa'daki Gördes ve Çaldağ adlarını aynı ildeki iki hedef olarak tanı.",
    "Tamamlayıcı",
  ),
  feldispat: essential(
    "Feldispat, cam ve seramik sanayisinin önemli endüstriyel hammaddesidir.",
    [
      "Çine/Karpuzlu–Aydın kesin üretim merkezidir.",
      "Milas–Muğla, Gördes/Demirci–Manisa ve Simav–Kütahya diğer hedeflerdir.",
      "Batı Anadolu kristalen kayaç kuşağında yoğunlaşır.",
    ],
    "Feldispat denince önce Çine–Aydın eşleştirmesini getir.",
  ),
  mermer: essential(
    "Mermer ve doğal taş, yapı, kaplama ve süslemede kullanılan ekonomik kayaç grubudur.",
    [
      "Afyonkarahisar/İscehisar en bilinen merkezdir.",
      "Bilecik, Marmara Adası–Balıkesir, Denizli traverteni ve Muğla/Milas diğer hedeflerdir.",
      "Elazığ vişne mermeri ayırt edici çeşit eşleştirmesidir.",
    ],
    "Jeolojik mermer tanımıyla ticari doğal taş tanımının kapsamı aynı olmayabilir.",
  ),
  manganez: essential(
    "Manganez, çelik üretiminde alaşım ve dayanım artırıcı olarak kullanılan metalik madendir.",
    [
      "Tavas–Denizli ve Çatalca–İstanbul temel hedeflerdir.",
      "Artvin–Giresun kuşağı ve Ereğli–Zonguldak diğer eşleştirmelerdir.",
      "Kullanımının demir–çelik sanayisiyle ilişkisi sınav için önemlidir.",
    ],
    "Manganezi çıkarım yeriyle değil yalnız çelik fabrikalarıyla eşleştirme.",
    "Tamamlayıcı",
  ),
  "kursun-cinko": essential(
    "Kurşun ve çinko cevherleri çoğu yatakta birlikte bulunur ve metal sanayisinde kullanılır.",
    [
      "Balya–Balıkesir ve Yahyalı/Zamantı–Kayseri temel hedeflerdir.",
      "Keban–Elazığ, Çayeli–Rize, Yenice–Çanakkale ve Gümüşhane diğer merkezlerdir.",
      "Aynı yataktan birden fazla metal elde edilebilmesi maden eşleştirmelerinde önemlidir.",
    ],
    "Kurşun ve çinkoyu iki tamamen ayrı harita kuşağı gibi ezberleme.",
  ),
  zimpara: essential(
    "Zımpara taşı, aşındırma ve parlatmada kullanılan sert doğal endüstriyel hammaddedir.",
    [
      "İzmir, Aydın, Denizli ve Muğla Ege çekirdeğidir.",
      "Burdur tamamlayıcı Güneybatı hedefidir.",
      "Dağılış Batı ve Güneybatı Anadolu'da yoğunlaşır.",
    ],
    "Zımpara taşını Batı Anadolu/Ege kuşağıyla eşleştir.",
    "Tamamlayıcı",
  ),
  asbest: essential(
    "Asbest ya da amyant, lifli ve kanserojen bir silikat mineral grubudur; eski yatak bilgisi güncel kullanım önerisi değildir.",
    [
      "Mihalıççık–Eskişehir, Orhaneli–Bursa ve Zara/Divriği–Sivas klasik yatak hedefleridir.",
      "Dörtyol–Hatay ve Çankırı diğer tarihsel eşleştirmelerdir.",
      "Sağlık riski nedeniyle çıkarım ve kullanım bilgisi tarihsel coğrafya bağlamında ele alınır.",
    ],
    "Yatak konumunu bugün ekonomik ve güvenli üretim yapıldığı şeklinde yorumlama.",
    "Tamamlayıcı",
  ),
  volfram: essential(
    "Volfram ya da tungsten, çok sert ve yüksek erime noktalı stratejik metaldir.",
    [
      "Uludağ–Bursa klasik ve kesin yatak eşleştirmesidir.",
      "Yüksek sıcaklığa dayanıklı alaşım ve kesici takım üretiminde kullanılır.",
      "Klasik yatak bilgisi faal üretim iddiası değildir.",
    ],
    "Uludağ'ı volkanik dağ sanma; volfram yatağı bulunması oluşum türünü değiştirmez.",
    "Tamamlayıcı",
  ),
  pomza: essential(
    "Pomza, gaz boşlukları nedeniyle hafif ve gözenekli olan volkanik yapı taşıdır.",
    [
      "Nevşehir ve Bitlis/Tatvan–Ahlat ana hedeflerdir.",
      "Kayseri, Ağrı ve Van diğer volkanik kuşak merkezleridir.",
      "Hafif beton, yalıtım ve aşındırıcı ürünlerde kullanılır.",
    ],
    "Pomzayı volkanik alanlarla eşleştir; perlit ile aynı ürün sanma.",
  ),
  perlit: essential(
    "Perlit, ısıtıldığında genleşen ve yalıtımda kullanılan volkanik camdır.",
    [
      "Bergama–İzmir ve Manisa başlıca Batı Anadolu hedefleridir.",
      "Erzincan, Nevşehir, Van/Bitlis ve Kızılcahamam–Ankara diğer merkezlerdir.",
      "Genleşme özelliği pomzadan ayırt edici üretim bilgisidir.",
    ],
    "Perlitin temel anahtar sözcüğü 'ısıtılınca genleşen volkanik cam'dır.",
    "Tamamlayıcı",
  ),
  barit: essential(
    "Barit, yüksek yoğunluğu nedeniyle özellikle petrol ve doğal gaz sondaj çamurunda kullanılan mineraldir.",
    [
      "Alanya/Gazipaşa–Antalya ve Şarkikaraağaç–Isparta ana hedeflerdir.",
      "Hüyük–Konya, Kahramanmaraş ve Muş diğer merkezlerdir.",
      "Kullanım alanı sondaj faaliyetleriyle güçlü biçimde ilişkilidir.",
    ],
    "Barit sorusunda önce sondaj çamuru kullanımını, sonra Antalya–Isparta–Konya kuşağını hatırla.",
    "Tamamlayıcı",
  ),
  uranyum: essential(
    "Uranyum, nükleer yakıt hammaddesi olan radyoaktif elementtir.",
    [
      "Manisa, Uşak, Yozgat ve Söke–Aydın kaynak alanlarıdır.",
      "Nevşehir ve Malatya diğer potansiyel hedeflerdir.",
      "Kaynak alanı bilgisi ticari işletme yapıldığı anlamına gelmez.",
    ],
    "Uranyum yatağını nükleer santral konumuyla karıştırma; Akkuyu Mersin'dedir.",
    "Tamamlayıcı",
  ),
} satisfies Record<string, TopicEssential>;

const energy = {
  dogalgaz: essential(
    "Doğal gaz, metan ağırlıklı fosil yakıttır; bu harita yalnız üretim sahalarını gösterir.",
    [
      "Sakarya Gaz Sahası–Batı Karadeniz ve Filyos–Zonguldak güncel üretim zincirinin çekirdeğidir.",
      "Hamitabat–Kırklareli ve Akçakoca–Düzce diğer üretim hedefleridir.",
      "Denizdeki saha ile karadaki işleme ve dağıtım noktası aynı coğrafi hedef değildir.",
    ],
    "Üretim sahasını depolama tesisi veya boru hattı giriş noktasıyla karıştırma.",
  ),
  "dogalgaz-boru-hatlari": essential(
    "Doğal gaz boru hatları, üretim alanlarından ayrı olarak gazı ülkeye taşıyan ya da Türkiye üzerinden geçiren çizgisel altyapıdır.",
    [
      "Mavi Akım Karadeniz altından Samsun'a ulaşır.",
      "TürkAkım'ın Türkiye giriş noktası Kıyıköy/Kırklareli'dir.",
      "TANAP Posof/Ardahan'dan girip İpsala/Edirne yönünde Türkiye'yi doğudan batıya geçer.",
    ],
    "Saha ile hattı ayır: Sakarya Gaz Sahası üretim, Mavi Akım–TürkAkım–TANAP taşıma altyapısıdır.",
  ),
  "tas-komuru": essential(
    "Taş kömürü, yüksek kalorili ve koklaşabilir fosil yakıttır; demir–çelik sanayisinde kullanılır.",
    [
      "Türkiye'nin temel ekonomik taş kömürü havzası Zonguldak'tır.",
      "Amasra/Bartın havzanın doğu uzantısındaki hedeflerdendir.",
      "Karabük ve Ereğli demir–çelik tesislerinin konumu kömür havzası ve limanla ilişkilidir.",
    ],
    "Taş kömürünü Zonguldak; yaygın linyiti farklı iç ve batı havzalarıyla eşleştir.",
  ),
  petrol: essential(
    "Petrol, enerji ve petrokimya hammaddesi olan fosil yakıttır; Türkiye üretimi Güneydoğu'da yoğunlaşır.",
    [
      "Raman–Garzan/Batman klasik ve ilk ticari üretim merkezidir.",
      "Adıyaman, Diyarbakır, Siirt ve Şırnak diğer üretim illeridir.",
      "Gabar–Şırnak güncel üretimde öne çıkan sahadır.",
    ],
    "Raman tarihsel ilk, Gabar güncel yükselen saha bilgisini birlikte koru.",
  ),
  linyit: essential(
    "Linyit, düşük kalorili ve nem oranı yüksek; çıkarıldığı yere yakın termik santrallerde kullanılan yaygın fosil yakıttır.",
    [
      "Afşin–Elbistan, Soma ve Tunçbilek/Seyitömer temel havzalardır.",
      "Yatağan/Milas, Çayırhan, Kangal ve Orhaneli diğer önemli hedeflerdir.",
      "Taşıma maliyeti nedeniyle termik santral çoğunlukla linyit yatağına yakın kurulur.",
      "2025 elektrik üretiminde kömür yüzde 33,6 ile birinci, doğal gaz yüzde 23 ile ikinci sıradadır; bu oranlar tarih belirtilerek kullanılmalıdır.",
    ],
    "Linyitin yaygınlığı ile taş kömürünün Zonguldak'taki dar havzasını ayır.",
  ),
  nukleer: essential(
    "Nükleer enerji, ağır atom çekirdeklerinin bölünmesiyle açığa çıkan ısıdan elektrik üretir.",
    [
      "Akkuyu–Gülnar/Mersin Türkiye'nin ilk nükleer güç santrali projesidir.",
      "Sinop/İnceburun planlanan ikinci saha hedefidir.",
      "5 Ağustos 2026 bilgi kesiminde Akkuyu ilk elektrik öncesi devreye alma sürecindedir; faal üretim gibi kodlanmamalıdır.",
    ],
    "Proje, inşaat ve ticari üretim aşamalarını ayır; tarih belirtilmeden 'faal' deme.",
  ),
  biyokutle: essential(
    "Biyokütle, tarım, hayvancılık, orman ve kentsel organik atıklardan enerji elde edilmesidir.",
    [
      "Konya, Balıkesir ve Manisa tarım–hayvancılık atığı potansiyeliyle öne çıkar.",
      "İstanbul, Ankara ve İzmir çöp gazı tesisleri için başlıca örneklerdir.",
      "Tek zorunlu il yoktur; ham madde ve tesis türü dağılışı belirler.",
    ],
    "Biyokütleyi tek bir coğrafi bölgeye hapsetme; atık türü ve tesis tipini sorudan oku.",
    "Tamamlayıcı",
  ),
  asfaltit: essential(
    "Asfaltit, petrol kökenli katı ve bitümlü bir fosil yakıttır.",
    [
      "Şırnak ana ve kesin il hedefidir.",
      "Silopi ve Harbul klasik saha eşleştirmeleridir.",
      "Yerel termik enerji üretiminde kullanılabilir.",
    ],
    "Asfaltit denince Şırnak–Silopi/Harbul eşleştirmesini doğrudan hatırla.",
    "Tamamlayıcı",
  ),
  gunes: essential(
    "Güneş enerjisi potansiyeli güneşlenme süresi, bulutluluk ve ışınım şiddetiyle belirlenir.",
    [
      "Şanlıurfa, Mardin, Gaziantep ve Kilis güçlü Güneydoğu hedefleridir.",
      "Konya/Karapınar ve Karaman büyük iç bölge potansiyel alanlarıdır.",
      "Bölgesel olarak Güneydoğu ve Akdeniz yüksek, Karadeniz düşüktür.",
    ],
    "En sıcak yer ile en yüksek güneş enerjisi potansiyelini otomatik olarak aynı sanma; bulutluluk da önemlidir.",
  ),
  ruzgar: essential(
    "Rüzgâr enerjisi, sürekli ve yeterli hızdaki hava hareketinin türbinlerle elektriğe çevrilmesidir.",
    [
      "İzmir, Balıkesir, Çanakkale ve Manisa ana Ege–Güney Marmara hedefleridir.",
      "Tekirdağ ve İstanbul Marmara; Muğla ve Hatay tamamlayıcı kıyı hedefleridir.",
      "Ana potansiyel kuşak Ege ve Marmara kıyılarıdır.",
    ],
    "Rüzgâr yönleri oyunuyla karıştırma: burada ok yönü değil enerji potansiyel alanları sorulur.",
  ),
  jeotermal: essential(
    "Jeotermal enerji, yer içi ısısının sıcak su ve buhar yoluyla kullanılmasıdır; faylı genç tektonik alanlarla ilişkilidir.",
    [
      "Germencik–Aydın, Kızıldere–Denizli ve Alaşehir/Salihli–Manisa çekirdek üretim hedefleridir.",
      "Balçova–İzmir, Afyonkarahisar ve Kütahya ısıtma/kaplıca kullanımlarıyla önemlidir.",
      "Potansiyelin yaklaşık yüzde 78'i Batı Anadolu'dadır; ilk elektrik Kızıldere'de 1975'te üretilmiştir.",
    ],
    "Jeotermal ile kaplıca aynı kaynağa dayanabilir ama kullanım amacı farklıdır.",
  ),
} satisfies Record<string, TopicEssential>;

const transportation = {
  otoyollar: essential(
    "Otoyol, giriş–çıkışı kontrollü ve karşı yönleri ayrılmış yüksek standartlı karayoludur.",
    [
      "Edirne–İstanbul, İstanbul–Ankara ve İstanbul–Bursa–İzmir ana omurgalardır.",
      "Kuzey Marmara, Ankara–Niğde ve Malkara–Çanakkale diğer çekirdek hatlardır.",
      "Ege'de İzmir–Aydın–Denizli; güneyde Mersin–Adana–Gaziantep–Şanlıurfa hattı önemlidir.",
      "KGM'nin 1 Ocak 2026 verisinde trafiğe açık otoyol ağı 3.796 kilometredir.",
    ],
    "Otoyolu bölünmüş devlet yoluyla aynı sanma; erişim kontrollü olma özelliğini ara.",
  ),
  yht: essential(
    "Yüksek Hızlı Tren ağı, doğrudan sefer istasyonu bulunan iller ile otobüs/tren aktarmalı bağlantı illerini ayırmayı gerektirir.",
    [
      "Doğrudan YHT seferli 11 il Ankara, Eskişehir, Konya, Bilecik, Sakarya, Kocaeli, İstanbul, Karaman, Yozgat, Kırıkkale ve Sivas'tır.",
      "İlk YHT hattı Ankara–Eskişehir'dir ve 2009'da açılmıştır.",
      "Bursa, Antalya, Adana ve Afyonkarahisar gibi kombine bağlantı illeri doğrudan hat sayılmaz.",
    ],
    "Doğrudan ray hattı ile otobüs aktarmalı YHT bağlantısını karıştırma.",
  ),
  havalimanlari: essential(
    "Havalimanı haritasında tesis adı, hizmet verdiği bölge ve gerçek il konumu birlikte öğrenilir.",
    [
      "İstanbul Havalimanı–Arnavutköy, Sabiha Gökçen–Pendik, Esenboğa–Ankara ve Adnan Menderes–İzmir çekirdektir.",
      "Ordu–Giresun Türkiye ve Avrupa'nın deniz dolgusu üzerindeki ilk; Rize–Artvin Türkiye'nin ikinci havalimanıdır.",
      "Çukurova Uluslararası Tarsus/Mersin'de; Zafer Bölgesel Kütahya'da olup çevre illere de hizmet verir.",
      "21 Mayıs 2026'da 58 aktif havalimanı vardı; 15 Haziran 2026'da yeniden açılan Ankara/Etimesgut hükümet ve özel izinli uçuş odaklıdır, tarifeli ana havalimanı Esenboğa'nın yerine geçmez.",
    ],
    "Hizmet verdiği il adı tesisin bulunduğu il olmayabilir; Çukurova ve Zafer örneklerine dikkat et.",
  ),
  "gecit-tunel": essential(
    "Geçit dağ sırasını aşmayı kolaylaştıran doğal alçak yer, tünel ise insan yapımı ulaşım yapısıdır.",
    [
      "Gülek–Niğde/Mersin, Sertavul–Karaman/Mersin ve Belen–Hatay temel güney geçitleridir.",
      "Zigana, Kop, Ovit, Ilgaz, Bolu ve Sabuncubeli diğer çekirdek eşleştirmelerdir.",
      "Yeni Zigana 14,5 kilometreyle Türkiye'nin ve Avrupa'nın en uzun çift tüplü karayolu tünelidir.",
    ],
    "Marmaray demiryolu, Avrasya karayolu tünelidir; geçit ve tünel kavramlarını ayır.",
  ),
  kruvaziyer: essential(
    "Kruvaziyer limanı, turistik yolcu gemilerine hizmet veren limandır.",
    [
      "Kuşadası–Aydın, İstanbul/Galataport ve Bodrum–Muğla ana hedeflerdir.",
      "İzmir, Çeşme, Marmaris, Antalya, Alanya ve Çanakkale diğer önemli merkezlerdir.",
      "Amasra, Samsun ve Trabzon Karadeniz'deki hedeflerdir.",
      "2025'te limanlarda 2.138.136 kruvaziyer yolcusu ağırlandı; Kuşadası yılın en yoğun merkeziydi.",
    ],
    "Yük limanı büyüklüğüyle kruvaziyer yolcu yoğunluğunu aynı ölçüt sanma.",
  ),
  roro: essential(
    "Ro–Ro, tekerlekli araçların gemiye kendi tekerleriyle girip çıktığı taşıma türüdür.",
    [
      "Tuzla/Pendik, Yalova, Mersin, Çeşme, Ambarlı, Tekirdağ, Gemlik ve Kocaeli Avrupa çıkışlarında önemlidir.",
      "Samsun, Karasu ve İstanbul Karadeniz; Mersin ve Taşucu KKTC hatlarında öne çıkar.",
      "Çeşme–Trieste, Yalova–Sète ve Taşucu–Girne klasik hat örnekleridir.",
    ],
    "Seferler değişebilir; geçici hat sayısından çok liman–işlev eşleştirmesini öğren.",
  ),
} satisfies Record<string, TopicEssential>;

const developmentProjects = {
  "bolgesel-kalkinma-planlari": essential(
    "Bölgesel kalkınma projeleri, bölgeler arası gelişmişlik farkını azaltmak için çok ili kapsayan planlı yatırımlardır.",
    [
      "GAP–Şanlıurfa, DAP–Erzurum, DOKAP–Giresun ve KOP–Konya merkez eşleştirmeleri kullanılır.",
      "Projeler yalnız sulamadan oluşmaz; tarım, sanayi, ulaşım, enerji ve beşerî gelişmeyi birlikte ele alır.",
      "Coğrafi bölge sınırı ile kalkınma projesi kapsamı tam olarak aynı değildir.",
    ],
    "Kısaltmayı önce aç, sonra merkezini ve kapsadığı il kümesini ayrı ayrı eşleştir.",
  ),
  "gap-illeri": essential(
    "GAP, Fırat ve Dicle havzalarında sulama, enerji ve sosyal kalkınmayı bütünleştiren dokuz illi bölgesel projedir.",
    [
      "Adıyaman, Batman, Diyarbakır, Gaziantep ve Kilis GAP kapsamındadır.",
      "Mardin, Siirt, Şanlıurfa ve Şırnak diğer proje illeridir.",
      "Sulama pamuk, mısır ve ikinci ürün tarımını güçlendirirken kentleşme ve sanayiyi de etkiler.",
    ],
    "GAP'ı yalnız baraj projesi sanma; dokuz ilde ekonomik ve sosyal kalkınmayı birlikte hedefler.",
  ),
  "dap-illeri": essential(
    "DAP, Doğu Anadolu'nun tarım-hayvancılık, altyapı ve beşerî gelişme olanaklarını güçlendirmeyi amaçlayan bölgesel projedir.",
    [
      "Haritadaki Erzurum, Kars, Ardahan ve Ağrı kuzeydoğu çekirdek kümesidir.",
      "Van, Muş, Bitlis ve Bingöl göl havzası ile Yukarı Fırat'a uzanan çalışma kümesini gösterir.",
      "Oyun okunabilirlik için PDF'deki çekirdek illeri kullanır; proje kapsamı bu sekiz ille sınırlı değildir.",
    ],
    "DAP'ı coğrafi Doğu Anadolu Bölgesi sınırıyla bire bir eşitleme; burada çekirdek öğrenme kümesi gösterilir.",
  ),
  "dokap-illeri": essential(
    "DOKAP, Doğu Karadeniz'in kırsal kalkınma, ulaşım, turizm ve tarımsal üretim potansiyelini geliştiren projedir.",
    [
      "Artvin, Rize, Trabzon, Giresun ve Ordu kıyı çekirdeğini oluşturur.",
      "Gümüşhane ve Bayburt iç kesim; Samsun batı bağlantısı olarak haritada yer alır.",
      "Oyun okunabilirlik için merkezî kümeyi kullanır; güncel idari kapsam daha geniş olabilir.",
    ],
    "DOKAP'ı yalnız kıyı illeri sanma; Gümüşhane ve Bayburt gibi iç kesim hedeflerini unutma.",
  ),
  "kop-illeri": essential(
    "KOP, su kaynaklarını verimli kullanma ve İç Anadolu'nun tarımsal-ekonomik yapısını geliştirme odaklı bölgesel projedir.",
    [
      "Konya, Karaman, Aksaray ve Niğde projenin klasik çekirdek illeridir.",
      "Nevşehir, Kırıkkale, Kırşehir ve Yozgat genişletilmiş KOP kapsamındaki diğer illerdir.",
      "Sulama yanında kırsal kalkınma, enerji verimliliği ve beşerî kapasite çalışmaları da bulunur.",
    ],
    "Eski dört illi ezberle yetinme; genişletilmiş KOP kümesindeki sekiz ili birlikte öğren.",
  ),
} satisfies Record<string, TopicEssential>;

const tourismAndCulture = {
  "sakin-sehirler": essential(
    "Sakin şehir, Cittaslow ağına kabul edilen; yerel yaşam kalitesi, çevre ve kültürel kimliği korumayı amaçlayan yerleşmedir.",
    [
      "Seferihisar–İzmir Türkiye'nin ilk Cittaslow üyesidir.",
      "Akyaka–Muğla, Gökçeada–Çanakkale, Halfeti–Şanlıurfa ve Taraklı–Sakarya sık kullanılan harita örnekleridir.",
      "Statü il geneline değil çoğunlukla ilçe ya da belde yerleşmesine aittir.",
    ],
    "Karttaki yerleşmeyi ilin tamamı sanma; Cittaslow statüsü yerel yönetim birimine aittir.",
    "Tamamlayıcı",
  ),
  hoyukler: essential(
    "Höyük, aynı yerde üst üste kurulan yerleşmelerin zamanla oluşturduğu yapay tepedir.",
    [
      "Çatalhöyük–Konya ve Alacahöyük–Çorum temel eşleştirmelerdir.",
      "Göbeklitepe–Şanlıurfa bir höyük adını taşımasa da tarih öncesi yerleşme/inanç merkezi haritalarında çekirdek hedeftir.",
      "Troya–Çanakkale ve Hattuşa–Çorum çok katmanlı arkeolojik yerleşme bağlamında önemlidir.",
    ],
    "Her antik kenti höyük sanma; höyük oluşumunda üst üste yerleşim tabakaları belirleyicidir.",
  ),
  "antik-kentler": essential(
    "Antik kentler, geçmiş uygarlıkların kent yerleşimlerini ve kültürel coğrafya izlerini taşır.",
    [
      "Efes–İzmir, Bergama–İzmir, Afrodisias–Aydın, Hierapolis–Denizli ve Troya–Çanakkale batıdaki çekirdek hedeflerdir.",
      "Perge–Aspendos–Termessos Antalya; Zeugma Gaziantep; Ani Kars'tadır.",
      "Kent–il eşleştirmesi kadar uygarlık ve özgün yapı bilgisi de sınavda ayırt edicidir.",
    ],
    "Benzer Ege hedeflerini kuzeyden güneye sıralayarak öğren; hepsini İzmir'de sanma.",
  ),
  unesco: essential(
    "UNESCO Dünya Mirası, üstün evrensel değere sahip kültürel ya da doğal varlıkların uluslararası listesidir.",
    [
      "İstanbul'un Tarihî Alanları, Göreme–Kapadokya ve Divriği Ulu Camii ve Darüşşifası ilk Türkiye kayıtları arasındadır.",
      "Hattuşa–Çorum, Nemrut Dağı–Adıyaman, Troya–Çanakkale, Efes–İzmir ve Göbeklitepe–Şanlıurfa çekirdek hedeflerdir.",
      "Geçici liste ile Dünya Mirası Listesi aynı statü değildir.",
    ],
    "Bir alanın UNESCO Geçici Listesi'nde bulunmasını kesin Dünya Mirası kaydı sanma.",
  ),
  inanc: essential(
    "İnanç turizmi, farklı din ve dönemlere ait ibadet, ziyaret ve kutsal kabul edilen merkezlere yapılan seyahatlerdir.",
    [
      "Mevlânâ–Konya, Hacı Bektaş Veli–Nevşehir ve Hacı Bayram Veli–Ankara temel İslam kültürü hedefleridir.",
      "Meryem Ana Evi–İzmir, Sümela–Trabzon, Akdamar–Van ve Saint Pierre–Hatay Hristiyanlık mirasıyla ilişkilidir.",
      "Şanlıurfa peygamberler tarihi ve inanç merkezleriyle öne çıkar.",
    ],
    "Yapının adıyla bulunduğu ili birlikte öğren; özellikle Akdamar–Van ve Sümela–Trabzon'u karıştırma.",
  ),
  kayak: essential(
    "Kayak turizmi, yeterli kar örtüsü, eğim, yükselti ve ulaşım olanaklarına bağlı kış turizmi türüdür.",
    [
      "Uludağ–Bursa, Palandöken–Erzurum, Erciyes–Kayseri ve Kartalkaya–Bolu çekirdektir.",
      "Sarıkamış–Kars kristal karıyla; Ilgaz–Kastamonu/Çankırı konumuyla önemlidir.",
      "Davraz–Isparta ve Saklıkent–Antalya, sıcak kıyı bölgelerinde de yüksek dağ kış turizmi yapılabildiğini gösterir.",
    ],
    "Kayak merkezinin il merkeziyle aynı noktada olmadığını; dağ ve il eşleştirmesini öğren.",
  ),
  kaplicalar: essential(
    "Kaplıca, yer altından sıcak ve mineralli çıkan suların sağlık ve turizm amacıyla kullanıldığı tesistir.",
    [
      "Afyonkarahisar, Kütahya ve Denizli Batı Anadolu'nun temel termal turizm hedefleridir.",
      "Bursa, Yalova, Balıkesir ve İzmir fay hatlarıyla ilişkili diğer merkezlerdir.",
      "Kızılcahamam–Ankara, Kozaklı–Nevşehir ve Balçova–İzmir klasik eşleştirmelerdir.",
    ],
    "Kaplıca turizmi ile jeotermal elektrik üretimini aynı kullanım biçimi sanma.",
  ),
} satisfies Record<string, TopicEssential>;

/**
 * Her anahtar gerçek bir oyun slug'ıdır. `validate:content` eksik veya artık
 * kullanılmayan anahtarları hata sayar; UI hiçbir zaman genel bir fallback
 * metni göstermez.
 */
export const TOPIC_ESSENTIALS: Readonly<Record<string, TopicEssential>> = {
  ...administrative,
  ...agriculture,
  ...livestock,
  ...landformsAndWater,
  ...climateAndVegetation,
  ...disasters,
  ...populationAndSettlement,
  ...environment,
  ...industry,
  ...mines,
  ...energy,
  ...transportation,
  ...developmentProjects,
  ...tourismAndCulture,
};

export function getTopicEssential(categorySlug: string): TopicEssential | undefined {
  return TOPIC_ESSENTIALS[categorySlug];
}
