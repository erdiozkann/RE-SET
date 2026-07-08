// Primordial Ses Meditasyonu FAQ — tek kaynak. Hem sayfa bileşeni (görünür FAQ)
// hem prerender statik gövdesi (FAQPage JSON-LD + görünür HTML) bunu kullanır →
// görünür içerik ile schema DAİMA aynı (cloaking yok, H9 uyumlu).

export type PrimordialFaqItem = { q: string; a: string };

export const PRIMORDIAL_FAQ: PrimordialFaqItem[] = [
  {
    q: 'Primordial Ses (Sound) Meditasyonu nedir?',
    a: 'Primordial Ses Meditasyonu, Vedik gelenekten gelen ve kişiye özel bir mantranın (ses) sessizce tekrar edildiği bir meditasyon uygulamasıdır. Mantra, kişinin doğum zamanı ve yerine göre belirlenen, anlamı olmayan bir sestir; amacı zihni düşünce akışından nazikçe uzaklaştırıp sükûnet alanına getirmektir.',
  },
  {
    q: 'Mantra nasıl belirlenir?',
    a: 'Mantra, Vedik hesaplama geleneğine göre kişinin doğduğu tarih, saat ve yere göre belirlenir. Kişiye özeldir ve sessizce, içten tekrar edilir. Bir anlam taşımaz; işlevi zihne sabitlenecek nötr bir ses sağlamaktır.',
  },
  {
    q: 'Nasıl ve ne sıklıkta uygulanır?',
    a: 'Uygulama genellikle günde iki kez, 20–30 dakika, sessiz ve rahat bir ortamda oturarak yapılır. Mantra zorlamadan, doğal bir şekilde tekrar edilir; düşünceler geldiğinde nazikçe mantraya dönülür. Öğrenme süreci birebir eğitim ile aktarılır.',
  },
  {
    q: 'Primordial Ses Meditasyonu ile Demartini Yöntemi arasındaki ilişki nedir?',
    a: 'İkisi farklı ama tamamlayıcı yaklaşımlardır. Demartini Yöntemi algı ve değer hiyerarşisi üzerine sistematik bir sorgulama sürecidir; Primordial Ses Meditasyonu ise sessiz, mantra temelli bir sükûnet pratiğidir. Şafak Özkan her ikisinde de eğitim almıştır ve danışanın ihtiyacına göre yönlendirir.',
  },
  {
    q: 'Deneyimli olmak veya belirli bir inanca sahip olmak gerekir mi?',
    a: 'Hayır. Primordial Ses Meditasyonu belirli bir dinî inanç gerektirmez ve daha önce meditasyon deneyimi olmayanlar için de uygundur. Uygulama basittir; asıl önemli olan düzenli pratiktir.',
  },
];
