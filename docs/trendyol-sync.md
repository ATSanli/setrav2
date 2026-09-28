# Trendyol → SETRA katalog eşitlemesi

Bu entegrasyon Trendyol Türkiye Marketplace Product V2 `products/approved`, `products/approved/inventory-and-price`, `products/unapproved` ve yalnızca eksik barkod doğrulamasında `product/{barcode}` GET servislerini okur. Trendyol'a ürün, stok veya fiyat yazmaz. Satıcı ID yapılandırması `1261085` değerindedir; sunucu ortamındaki `TRENDYOL_SELLER_ID` bunu değiştirebilir.

## Kurulum

1. PostgreSQL için `DATABASE_URL` tanımlayın. Yeni veritabanında `npx prisma migrate deploy` temel şemayı ve Trendyol eklerini kurar. Bu çalışma için sağlanan mevcut Neon veritabanının şeması `0_init` olarak kaydedildi ve Trendyol geçişi uygulandı; mevcut kayıtlar korundu. Başka bir dolu veritabanında temel şema zaten varsa `0_init` geçişini tekrar çalıştırmadan önce o veritabanının şemasını karşılaştırıp Prisma baselining uygulayın. `SHADOW_DATABASE_URL` yalnızca yeni migration geliştirme işlemleri için gerekir.
2. Vercel Production ortamında `TRENDYOL_API_KEY`, `TRENDYOL_API_SECRET`, `CRON_SECRET` değişkenlerini ekleyin. Satıcı ID'yi ortamdan yönetmek isterseniz `TRENDYOL_SELLER_ID` de ekleyin. Bunları istemci değişkeni yapmayın. Trendyol anahtarları satıcı panelindeki Entegrasyon Bilgileri bölümündedir.
3. Yeniden dağıtın. `/admin/trendyol` sayfasında `stock_manage` yetkili kullanıcı **Şimdi eşitle** düğmesiyle ilk tam taramayı başlatır. Eşlenmeyen Trendyol kategorilerini aktif site kategorilerine bağlayıp tekrar eşitleyin.
4. Vercel cron her gün 03:00 UTC'de (Türkiye 06:00, yıl boyu) çalışır. İlk çalışmada ve son tam taramadan yedi gün sonra tüm katalog taranır. Aradaki günlerde değişen onaylı içerik ile tüm stok/fiyat akışı okunur. Hobby planının günlük sınırı nedeniyle daha sık cron ayarlanmadı. Admin düğmesi tam taramayı elle başlatır. 300 saniyelik iş süresi için Vercel Functions ayarlarında Fluid Compute etkin olmalıdır.

## Veri eşlemesi

- Trendyol `productMainId` → mevcut `Product.trendyolMainId`; `contentId` ve `variantId` → mevcut `ProductVariant` üzerindeki kimlik alanları. Varyant eşlemesi benzersiz `barcode` ile yapılır. `stockCode` satıcı SKU'su olarak saklanır.
- `title`, `description`, `brand`, `category`, `images` → mevcut ürün, Trendyol marka alanları ve görsel tabloları. Renk content özniteliğinden, beden varyant özniteliğinden okunur. Görsellerin gerçek mağaza URL'leri API anahtarları olmadan tarayıcıda doğrulanamaz.
- `price.salePrice`, `price.listPrice` ve ayrı stok/fiyat servisindeki `salePrice`, `listPrice` → varyantta tam sayı kuruş. `priceSeenByCustomer` site satış fiyatına aktarılmaz. Mevcut `Product.price` en düşük varyant fiyatının listeleme özetidir.
- `stock.quantity` → `remoteStock`; site stok değeri `max(0, remoteStock + localStockDelta)` olarak hesaplanır. Yayında olmayan varyantlar satılamaz. Onaysız, arşivlenmiş, kilitli veya kara listedeki varyantlar yayında gösterilmez. Stoku bitmiş onaylı ürün detay sayfasında stokta yok gösterilir.
- Trendyol kategori ID'si açık admin eşlemesi olmadan ürün yayına çıkmaz. Eşlenmeyenler panelde listelenir.

Tam ve hatasız tarama sonunda bulunmayan Trendyol varyantları önce tek barkod durum servisinden kontrol edilir. Hâlâ onaylı ve arşivli değilse pasifleştirme ertelenir; aksi halde kayıt silinmeden `missing` durumuna alınır ve stoğu sıfırlanır. Sipariş ve ürün geçmişi korunur. Ağ veya ürün işleme hatasında pasifleştirme yapılmaz. Eşitleme kilidi aynı anda iki işi engeller. İş kaydı, sayılar, pasifleştirilen varyant adedi ve barkod bazlı hatalar admin panelinde görülebilir.
Trendyol kaynaklı ürünlerin içerik, fiyat, stok ve görselleri mevcut genel ürün düzenleme API'sinde salt okunurdur; vitrin işaretleri düzenlenebilir.

## Stok sınırı

Trendyol kaynaklı ürünler sitede görünür ve stokları gösterilir; SETRA sepetine eklenmeleri ve SETRA siparişinde satılmaları sunucu tarafında kapalıdır. Böylece mevcut tek yönlü bağlantı aynı fiziksel stokun iki kanalda eşzamanlı satışıyla fazla satış üretmez. SETRA üzerinde de satış açmak için ayrı kanal stoğu ya da Trendyol'a stok yazan ortak bir stok yönetimi gerekir; bu kapsamda Trendyol'a yazma açılmadı. Daha önce oluşturulmuş yerel stok rezervleri ve iptal düzeltmeleri korunur.

Tek Vercel işinin 300 saniye sınırı vardır. Büyük kataloglarda tarama bu süreyi aşarsa iş hata verir ve eksik ürünler pasifleştirilmez; daha uzun çalışan bir iş altyapısı gerekir. Günlük tarama anlık stok güncellemesi değildir.

## Resmi belgeler

- [V2 onaylı ürün filtreleme](https://developers.trendyol.com/docs/%C3%BCr%C3%BCn-filtreleme-onayl%C4%B1-%C3%BCr%C3%BCn-v2)
- [V2 onaylı ürün stok ve fiyat](https://developers.trendyol.com/docs/%C3%BCr%C3%BCn-filtreleme-onayl%C4%B1-%C3%BCr%C3%BCn-v2-stok-ve-fiyat)
- [V2 temel barkod durumu](https://developers.trendyol.com/docs/%C3%BCr%C3%BCn-filtreleme-temel-bilgiler-v2)
- [V2 onaysız ürün filtreleme](https://developers.trendyol.com/docs/%C3%BCr%C3%BCn-filtreleme-onays%C4%B1z-%C3%BCr%C3%BCn-v2)
- [Kimlik doğrulama ve hız sınırı](https://developers.trendyol.com/docs/2-authorization)
- [Vercel cron sınırları](https://vercel.com/docs/cron-jobs/usage-and-pricing)
