// Hizmet sayfaları (para sayfaları) FAQ + intro — TEK KAYNAK.
// Hem sayfa bileşenleri (görünür FAQ) hem prerender statik gövdesi (FAQPage
// JSON-LD + görünür HTML) bunları kullanır → görünür içerik = schema (cloaking yok).
//
// İÇERİK KURALI: yalnız doğrulanmış bilgiler (faq.ts + mevcut site + drdemartini
// dizini). Fiyat YOK (kullanıcı kararı), tıbbi iddia YOK, unvan "Eğitimli/Trained".

export type FaqItem = { q: string; a: string };

// ── /demartini-seansi ──────────────────────────────────────────────────────
export const SEANS_INTRO: string[] = [
  "Demartini seansı; Dr. John Demartini'nin geliştirdiği Demartini Yöntemi'nin (Demartini Metodu) birebir uygulandığı, yapılandırılmış bir algı dengeleme çalışmasıdır. Seansta, 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process kullanılarak gündeminizdeki konu (ilişki, öz değer, kariyer, yas gibi) sistematik sorularla ele alınır.",
  "Seanslar, Dr. John Demartini'nin resmi uygulayıcı dizininde Trained (Eğitimli) seviyesinde listelenen Şafak Özkan tarafından yürütülür. 11 yıllık uygulama deneyimiyle, İstanbul Tarabya'da yüz yüze veya Zoom/Google Meet üzerinden online olarak çalışılır; Türkiye'nin her yerinden ve yurt dışından katılım mümkündür.",
];

export const SEANS_FAQ: FaqItem[] = [
  {
    q: 'Demartini seansı nedir, nasıl ilerler?',
    a: "Demartini seansı, Demartini Yöntemi'nin birebir uygulandığı yapılandırılmış bir çalışmadır. Kolaylaştırıcı eşliğinde, gündeminizdeki konu 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process ile sistematik olarak ele alınır; amaç tek yönlü algıları (suçlama, idealleştirme, kızgınlık) dengeleyip minnet ve netlik alanına geçmektir.",
  },
  {
    q: 'Bir seans ne kadar sürer, kaç seans gerekir?',
    a: 'Birebir seanslar genellikle 60–90 dakikadır. Konunun yoğunluğuna göre 2–6 seanslık bir süreç önerilebilir; ilk ücretsiz keşif görüşmesinde ihtiyacınıza uygun plan birlikte netleştirilir.',
  },
  {
    q: "İstanbul'da Demartini seansı nerede yapılıyor?",
    a: "Yüz yüze seanslar İstanbul Tarabya'da yapılır. İstanbul dışından veya yurt dışından katılanlar için Zoom/Google Meet üzerinden, yüz yüze seansla eşdeğer online seans imkânı vardır.",
  },
  {
    q: 'Online Demartini seansı yüz yüze kadar etkili mi?',
    a: 'Evet. Yöntem soru-cevap temelli yapılandırılmış bir süreç olduğu için online ortamda birebir aynı adımlarla uygulanır. Türkiye dışındaki danışanlar da online seansa katılabilir.',
  },
  {
    q: 'Demartini seansı için randevu nasıl alınır?',
    a: 'Önce 30 dakikalık ücretsiz keşif görüşmesi planlanır; bu görüşmede ihtiyacınızın yöntemle örtüşüp örtüşmediği değerlendirilir. Randevu sayfasından veya iletişim formundan yazarak başlayabilirsiniz.',
  },
  {
    q: 'Seans ücreti ne kadar?',
    a: 'Seans ve program koşulları, ihtiyacınıza göre ücretsiz keşif görüşmesinde paylaşılır. Bu görüşme bir satış görüşmesi değildir; doğru programı birlikte belirlemek içindir.',
  },
];

// ── /deger-belirleme ───────────────────────────────────────────────────────
export const DEGER_INTRO: string[] = [
  "Değer Belirleme Süreci (Value Determination Process), Dr. John Demartini'nin 13 reflektif soru üzerinden kişinin gerçek değer hiyerarşisini ortaya çıkardığı süreçtir. Sosyal beklentilerden bağımsız olarak; zamanınızı, enerjinizi, paranızı ve dikkatinizi gerçekte neye verdiğinizi gösteren içsel öncelik haritanızı çıkarır.",
  "Değerler hiyerarşiniz netleştiğinde; motivasyon, erteleme, kararsızlık ve ilişki çatışmaları gibi konulara bakışınız değişir: kendi değerlerinize göre yüksek olan alanlarda disiplin dışarıdan zorlamayla değil, doğal olarak ortaya çıkar. Bu süreç Demartini Yöntemi'nin temelidir ve birebir seansların ilk adımıdır.",
];

export const DEGER_FAQ: FaqItem[] = [
  {
    q: 'Değer Belirleme Süreci nedir?',
    a: "Dr. John Demartini'nin geliştirdiği, 13 reflektif soru üzerinden kişinin gerçek değer hiyerarşisini ortaya çıkaran süreçtir. Sosyal ideallerden bağımsız, davranışla doğrulanan içsel öncelik haritanızı gösterir ve Demartini Yöntemi'nin temelini oluşturur.",
  },
  {
    q: '13 soru neyi ölçer?',
    a: 'Sorular; alanınızı nasıl doldurduğunuz, zamanınızı ve enerjinizi neye harcadığınız, neyi düşünüp neyi hayal ettiğiniz, neyden konuşmaktan keyif aldığınız gibi gözlemlenebilir davranış kanıtlarına bakar. Amaç "olmak istediğiniz" değil, "gerçekte olduğunuz" değer sıralamasını ortaya çıkarmaktır.',
  },
  {
    q: 'Değerler hiyerarşisi günlük hayatta ne işe yarar?',
    a: 'Yüksek değerlerinizle uyumlu hedeflerde motivasyon ve süreklilik doğal olarak yükselir; düşük değerlerinize ait alanlarda kendinizi suçlamak yerine delege etme/yeniden çerçeveleme stratejileri kurabilirsiniz. Kariyer, ilişki ve öncelik kararlarında pusula işlevi görür.',
  },
  {
    q: 'Değer belirleme çalışması nasıl yapılır?',
    a: "Birebir seansta kolaylaştırıcı eşliğinde 13 soru üzerinden çalışılır; yanıtlar davranış kanıtlarıyla test edilir ve hiyerarşi netleştirilir. İstanbul Tarabya'da yüz yüze veya online yapılabilir.",
  },
  {
    q: 'Bu bir kişilik testi mi?',
    a: 'Hayır. Anket/tip testi değildir; kendi davranış kanıtlarınız üzerinden yürüyen reflektif bir sorgulama sürecidir. Sonuç bir "tip" etiketi değil, size özgü sıralı bir değerler hiyerarşisidir.',
  },
];

// ── /breakthrough-experience ───────────────────────────────────────────────
export const BREAKTHROUGH_INTRO: string[] = [
  "Breakthrough Experience, Dr. John Demartini'nin geliştirdiği 2 tam günlük amiral programdır. Katılımcılar, Demartini Yöntemi'nin tüm adımlarını — Değer Belirleme Süreci ve Quantum Collapse Process dâhil — uygulamalı olarak deneyimler ve kişisel bir konuyu bizzat çalışarak dönüştürür.",
  "Türkiye'deki birebir uygulamalarda bu programın adımları, Dr. John Demartini'nin resmi dizininde Trained seviyesinde listelenen Şafak Özkan eşliğinde çalışılır. Programın kapsamı ve uygunluğu, ücretsiz keşif görüşmesinde birlikte değerlendirilir.",
];

export const BREAKTHROUGH_FAQ: FaqItem[] = [
  {
    q: 'Breakthrough Experience nedir?',
    a: "Dr. John Demartini'nin geliştirdiği 2 tam günlük yoğun programdır. Katılımcılar Demartini Yöntemi'nin tüm adımlarını uygulamalı deneyimler ve kendi seçtikleri gerçek bir konuyu (ilişki, kayıp, öz değer gibi) bizzat çalışarak dönüştürür.",
  },
  {
    q: 'Programda neler çalışılır?',
    a: 'Değer Belirleme Süreci ile gerçek değer hiyerarşiniz çıkarılır; ardından Quantum Collapse Process ile seçtiğiniz konudaki duygusal kutupluluklar (kızgınlık–hayranlık, suçluluk–gurur) sistematik sorularla dengelenir.',
  },
  {
    q: 'Kimler katılabilir?',
    a: 'Ön koşul yoktur; kişisel bir konusunu derinlemesine çalışmak isteyen 18 yaş üstü herkes katılabilir. Klinik bir durumda (tanı almış rahatsızlıklar) program tıbbi/psikolojik tedavinin yerine geçmez; uzman gözetimindeki sürece tamamlayıcı olabilir.',
  },
  {
    q: "Türkiye'de Breakthrough Experience'a nasıl başlarım?",
    a: 'İlk adım 30 dakikalık ücretsiz keşif görüşmesidir; programın konunuza uygunluğu ve süreç birlikte planlanır. Randevu sayfasından veya iletişim formundan başlayabilirsiniz.',
  },
];
