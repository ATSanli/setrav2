export const projectFilters = [
  { id: 'all', label: 'Tümü' },
  { id: 'operations', label: 'Operasyon' },
  { id: 'commerce', label: 'E-ticaret' },
  { id: 'integration', label: 'Entegrasyon' },
  { id: 'ai', label: 'Yapay zekâ' },
  { id: 'infrastructure', label: 'Altyapı' },
  { id: 'marketing', label: 'Pazarlama' },
] as const

export type ProjectCategory = Exclude<(typeof projectFilters)[number]['id'], 'all'>

export type TechProject = {
  name: string
  category: ProjectCategory
  area: string
  problem: string
  solution: string
  href?: string
  linkLabel?: string
}

// CompOS hakkında repo içinde ek proje materyali bulunmadığı için tanım yalnızca
// proje sahibinin sağladığı bilgilerle sınırlıdır. Dizideki ilk öğe öne çıkarılır.
export const projects: TechProject[] = [
  {
    name: 'CompOS — Company Operating System',
    category: 'operations',
    area: 'Şirket yönetimi · Otomasyon',
    problem: 'Şirket yönetimi ve operasyon süreçlerini birlikte ele alma ihtiyacı.',
    solution: 'Şirket yönetimi ve operasyon süreçleri için geliştirilen otomasyon platformu.',
  },
  {
    name: 'Talep Yönetim Sistemi (TYS)', category: 'operations', area: 'Süreç yönetimi',
    problem: 'İş, olay ve sorumlulukları tek yerden izleme ihtiyacı.',
    solution: 'Şirket ihtiyaçlarına uyarlanabilen web tabanlı talep ve iş takibi uygulaması.',
  },
  {
    name: 'SETRA operasyon panelleri', category: 'operations', area: 'Yönetim paneli',
    problem: 'Ürün, sipariş ve yetki işlemlerinin ekiplerce yönetilmesi.',
    solution: 'Rol ve izin kontrolleriyle çalışan operasyon ekranları.',
  },
  {
    name: 'SETRA dijital mağaza', category: 'commerce', area: 'E-ticaret',
    problem: 'Koleksiyon keşfinden siparişe tutarlı bir alışveriş akışı.',
    solution: 'Ürün, arama, favori, sepet, ödeme ve hesap ekranlarını birleştiren mağaza.',
    href: '/', linkLabel: 'Mağazayı incele',
  },
  {
    name: 'SETRA Trendyol katalog eşitleme', category: 'integration', area: 'Pazaryeri entegrasyonu',
    problem: 'Pazaryeri ürün, fiyat ve stok verisini mağazada kontrollü güncelleme ihtiyacı.',
    solution: 'Trendyol’dan SETRA’ya tek yönlü katalog okuma, kategori eşleme ve eşitleme izleme. Trendyol kaynaklı ürünler için SETRA siparişi şu anda kapalı.',
  },
  {
    name: 'Trendyol sipariş ve stok takibi', category: 'integration', area: 'Pazaryeri operasyonu',
    problem: 'Sipariş, stok, ürün, iade ve fatura bilgisinin dağınık takibi.',
    solution: 'Bu operasyon verilerini aynı yazılımda izlemek için geliştirilen araç.',
  },
  {
    name: 'Trendyol stok ve kaynak yönetimi', category: 'integration', area: 'OCR · Pazaryeri',
    problem: 'Stok ve kaynak bilgisinin mobil ortamda işlenmesi.',
    solution: 'OCR ve Google Gemini bağlantısıyla tanıtılan mobil uyumlu araç.',
  },
  {
    name: 'Jet Kayıt', category: 'ai', area: 'Muhasebe otomasyonu',
    problem: 'Fatura girişindeki tekrar eden işlemler.',
    solution: 'Yapay zekâ destekli muhasebe otomasyonu projesi.',
  },
  {
    name: 'Audit Eyes fatura işleme', category: 'ai', area: 'Belge işleme',
    problem: 'Fatura verilerini elle okuma ve işleme yükü.',
    solution: 'Fatura içeriğini okumak ve işlemek için geliştirilen yapay zekâ aracı.',
  },
  {
    name: 'Web kamerası duygu analizi', category: 'ai', area: 'Görüntü işleme',
    problem: 'Video görüntüsündeki yüz ifadelerini gerçek zamanlı analiz etme ihtiyacı.',
    solution: 'Yedi temel duyguya yönelik model ve veri seti araştırması.',
  },
  {
    name: 'Dijital Vergi Dairesi otomasyonu', category: 'ai', area: 'İş otomasyonu',
    problem: 'Tekrarlanan dijital vergi işlemlerinin elle yürütülmesi.',
    solution: 'Bu işlemleri otomatikleştirmek için geliştirilen araç.',
  },
  {
    name: 'Duck Anderson e-ticaret', category: 'commerce', area: 'Web ve uygulama',
    problem: 'Markanın çevrimiçi satış kanalı ve operasyon ihtiyacı.',
    solution: 'E-ticaret sitesi ve uygulaması çalışması.',
  },
  {
    name: 'Wardrobe e-ticaret', category: 'commerce', area: 'E-ticaret',
    problem: 'Çevrimiçi satış deneyimi oluşturma ihtiyacı.',
    solution: 'Marka için geliştirilen e-ticaret çalışması.',
  },
  {
    name: 'Byfire sayısal dürbün kontrolü', category: 'operations', area: 'Savunma yazılımı',
    problem: 'Koordinata dayalı hedefleme ve ölçüm hesaplarının desteklenmesi.',
    solution: 'Sayısal dürbün için hedefleme ve mesafe hesaplarını işleyen kontrol yazılımı.',
  },
  {
    name: 'Byfire kamera hedef kontrolü', category: 'operations', area: 'Savunma yazılımı',
    problem: 'Kamera tabanlı hedef kontrol hesaplarının yönetimi.',
    solution: 'Sayısal dürbün çalışmasının devamı olarak geliştirilen kontrol yazılımı.',
  },
  {
    name: 'Byfire seri port terminali', category: 'integration', area: 'Donanım iletişimi',
    problem: 'Kart yazılımları arasında veri paketi alışverişi.',
    solution: 'Seri port üzerinden paket gönderme ve gelen paketi çözümleme yazılımı.',
  },
  {
    name: 'Çakışan IP tespit aracı', category: 'infrastructure', area: 'Ağ yönetimi',
    problem: 'Yerel ağdaki IP çakışmalarını görmek.',
    solution: 'Çakışan adresleri görünür kılmak için geliştirilen kontrol paneli.',
  },
  {
    name: 'Google Haritalar işletme veri aracı', category: 'integration', area: 'Veri raporlama',
    problem: 'Konum ve anahtar kelimeye göre işletme verilerini derlemek.',
    solution: 'Harita sonuçlarındaki verileri Excel’e aktaran araç.',
  },
  {
    name: 'Camfrog kullanıcı adı kontrol paneli', category: 'operations', area: 'Özel yazılım',
    problem: 'Kullanıcı adı durumlarını bir arayüzden izlemek.',
    solution: 'Birden fazla işlemi aynı ekranda yöneten kontrol paneli.',
  },
  {
    name: 'Trendyol reklam ajanları', category: 'marketing', area: 'Pazarlama raporlaması',
    problem: 'Ürün, mağaza ve reklam verilerini farklı ekranlarda izleme yükü.',
    solution: 'Verileri derleyip Excel raporuna dönüştüren ajan çalışması.',
  },
  {
    name: 'Göksu Atölyesi reklam analitiği', category: 'marketing', area: 'Veri analitiği',
    problem: 'Reklam verilerini karar süreçlerinde kullanma ihtiyacı.',
    solution: 'Reklam verilerini analiz etmeye yönelik çalışma.',
  },
]
