// Tek kaynak FAQ — hem görünür home sayfası, hem FAQPage JSON-LD, hem
// prerender statik gövdesi bunu kullanır. Böylece üçü DAİMA senkron kalır
// (cloaking riski yok) ve yeni soru eklemek tek yerden yapılır.
//
// GEO/AEO stratejisi: soru-cevap biçimi, AI cevap motorlarının (ChatGPT,
// Perplexity, Google AI Overviews) ve "People Also Ask" kutusunun doğrudan
// alıntıladığı formattır. Sorular gerçek arama niyetlerini (Demartini
// metodu/yöntemi, John Demartini, Breakthrough Experience, değerler
// hiyerarşisi, Quantum Collapse Process) hedefler. Cevaplar dürüst ve
// bilgilendiricidir — anahtar kelime doldurma yapılmaz.

export type FaqItem = { q: string; a: string };

export const FAQ: FaqItem[] = [
  {
    q: 'Demartini Metodu nedir?',
    a: "Demartini Metodu, Dr. John Demartini tarafından geliştirilen, 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process'ten oluşan sistematik bir algı dengeleme yöntemidir. Kişinin gerçek değer hiyerarşisini ortaya çıkarmak, duygusal yükleri nötralize etmek ve ilham, sevgi, minnet alanına geçişi sağlamak için kullanılır.",
  },
  {
    q: 'Demartini Yöntemi ile Demartini Metodu aynı şey mi?',
    a: 'Evet, ikisi aynı yöntemi anlatır. İngilizce "Demartini Method" ifadesi Türkçeye hem "Demartini Metodu" hem "Demartini Yöntemi" olarak çevrilir; her iki kullanım da Dr. John Demartini\'nin geliştirdiği değer belirleme ve algı dengeleme sistemini ifade eder.',
  },
  {
    q: 'John Demartini kimdir?',
    a: 'Dr. John Demartini, insan davranışı uzmanı, araştırmacı, yazar ve eğitmendir. Demartini Metodu\'nun ve Breakthrough Experience programının kurucusudur; "The Breakthrough Experience" başta olmak üzere çok sayıda kitabın yazarıdır ve "The Secret" filminde yer almıştır. Şafak Özkan, onun Türkiye\'deki eğitimli (Trained) uygulayıcılarındandır.',
  },
  {
    q: 'Demartini Metodu kimler için uygundur?',
    a: 'İlişki çatışmaları, öz değer ve öz güven, kariyer kararsızlığı, yaşam geçişleri, yas ve hayat yönü arayışı gibi konularda algısını dengelemek isteyen herkes için uygundur. Klinik bir durumda (ör. depresyon, travma, bağımlılık) yöntem tıbbi veya psikolojik tedavinin yerine geçmez; uzman gözetimindeki bir sürece tamamlayıcı bir farkındalık aracı olarak kullanılabilir.',
  },
  {
    q: 'Demartini Metodu hangi konularda yardımcı olur?',
    a: 'Kaygı ve stresle başa çıkma, ilişki dengeleme, zorlu geçmiş deneyimlerle yüzleşme, öz güven ve öz değer, yas ve kayıp, öfke ve suçluluk gibi duyguların nötralize edilmesi, kariyer ve hayat yönü netliği ile minnettarlık geliştirme başlıca çalışma alanlarıdır. Yöntem, olayları değiştirmeye değil, olaylara dair algıyı dengelemeye odaklanır.',
  },
  {
    q: 'Değer Belirleme Süreci (değerler hiyerarşisi) nedir?',
    a: "Değer Belirleme Süreci, Dr. John Demartini'nin 13 reflektif soru üzerinden kişinin gerçek değer hiyerarşisini ortaya çıkardığı adımdır. Sosyal beklentilerden bağımsız olarak, kişinin zamanını, enerjisini ve dikkatini gerçekte neye verdiğini gösteren içsel öncelik haritasıdır ve Demartini Metodu'nun temelini oluşturur.",
  },
  {
    q: 'Quantum Collapse Process nasıl çalışır?',
    a: 'Quantum Collapse Process, Demartini Metodu içinde yer alan ve duygusal kutuplukları (kızgınlık–hayranlık, suçluluk–gurur gibi) tek tek dengeleyen tekniktir. Bir olaya veya kişiye yüklenen tek yönlü duygunun karşı kutbu sistematik sorularla görünür kılınır; iki kutup dengelendiğinde suçlama ve idealleştirme yerini minnet ve sevgiye bırakır.',
  },
  {
    q: 'Breakthrough Experience nedir?',
    a: "Breakthrough Experience, Dr. John Demartini'nin geliştirdiği 2 tam günlük amiral grup programıdır. Katılımcılar, Demartini Metodu'nun tüm adımlarını (Değer Belirleme Süreci ve Quantum Collapse Process dâhil) uygulamalı olarak deneyimler ve kişisel bir konuyu bizzat çalışarak dönüştürür.",
  },
  {
    q: 'Bir Demartini seansı ne kadar sürer?',
    a: 'Birebir seanslar genellikle 60–90 dakikadır. Konunun yoğunluğuna göre 2–6 seanslık bir süreç önerilebilir. Breakthrough Experience programı ise 2 tam günlük bir grup çalışmasıdır.',
  },
  {
    q: 'Demartini Metodu NLP veya koçluktan farklı mıdır?',
    a: 'Evet. NLP davranış kalıplarını yeniden çerçevelerken, Demartini Metodu kişinin değer hiyerarşisini ve duygusal kutuplukları (kızgınlık/hayranlık, suçluluk/gurur) tek tek dengeleyerek nöroplastik bir farkındalık değişimi hedefler. 13 soruluk Değer Belirleme Süreci yöntemin temelidir.',
  },
  {
    q: 'Demartini Metodu terapi midir?',
    a: 'Hayır. Demartini Metodu bir psikoterapi veya tıbbi tedavi değildir; kişinin kendi farkındalığıyla algı yapısını dengelediği bütüncül bir gelişim ve algı dengeleme yöntemidir. Psikiyatrik/psikolojik tedavinin yerine geçmez, ancak bu süreçlerle birlikte tamamlayıcı olarak kullanılabilir.',
  },
  {
    q: 'Online Demartini seansı yapıyor musunuz?',
    a: 'Evet. Zoom veya Google Meet üzerinden yüz yüze seansla eşdeğer Demartini Metodu seansları sunuyoruz. Türkiye dışındaki danışanlar da online seansa katılabilir.',
  },
  {
    q: 'Şafak Özkan kimdir?',
    a: "Şafak Özkan, İstanbul Tarabya merkezli, Eğitimli Demartini Yöntemi Uygulayıcısı'dır (Dr. John Demartini'nin resmi dizininde Trained seviyesinde listelenir). Aynı zamanda Primordial Ses (Sound) Meditasyonu eğitimi almıştır. 11 yıllık uygulama deneyimiyle Türkiye'de danışanlarına Demartini Metodu ile rehberlik etmektedir.",
  },
  {
    q: 'Ücretsiz keşif görüşmesi mümkün mü?',
    a: '30 dakikalık ücretsiz keşif görüşmesi sunuyoruz. Bu görüşme; ihtiyacınızın yöntemle örtüşüp örtüşmediğini değerlendirmek ve doğru programı seçmek içindir. Randevu sayfasından planlayabilirsiniz.',
  },
  {
    q: 'Demartini Metodu bilimsel midir?',
    a: 'Demartini Metodu; psikoloji, davranış bilimi, nöroplastisite ve felsefe alanlarındaki araştırmalardan beslenen bütüncül bir farkındalık ve algı dengeleme yöntemidir. Tıbbi/psikiyatrik tedavinin yerine geçmez ancak terapötik süreçlerle birlikte kullanılabilir.',
  },
];
