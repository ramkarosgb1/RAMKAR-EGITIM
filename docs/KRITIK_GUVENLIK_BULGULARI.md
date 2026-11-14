# Kritik güvenlik incelemesi — 14 Kasım 2026

Bu belge canlı sistemde değişiklik yapmaz. Mevcut ortak Firebase projesinin güvenliğini bozmadan geliştirme yapılabilmesi için tespit edilen sorunları kaydeder.

## Kaynak kodda doğrulanan bulgular
1. `src/app/portal/egitim/[id]/page.tsx`: geliştirici testi için videoyu atlayıp sınava geçme düğmesi bulunuyor. Üretim sürümünden çıkarılmalı.
2. Aynı sayfada gerçek video URL'si yoksa üçüncü taraf örnek MP4 kullanılıyor. Gerçek eğitim kanıtı olarak kullanılamaz.
3. Aynı sayfa sınav puanını `setDoc` ile doğrudan Firestore'a yazıyor. Doğrulanmış sunucu kimliği ve soru bankası olmadan sertifika hakkı oluşturmamalı.
4. `src/components/StrictVideoPlayer.tsx`: tarayıcı `tamamlandi: true` alanını doğrudan Firestore'a yazıyor. Sunucu doğrulaması gerekli.
5. Aynı bileşen IP adresini üçüncü taraf ipify servisine soruyor. KVKK değerlendirmesi ve veri minimizasyonu yapılmadan etkinleştirilmemeli.
6. `src/middleware.ts` geçici olarak çalışan/yönetici sayfalarını giriş ekranına yönlendiriyor. Bu, Firestore güvenlik kurallarının yerine geçmez.

## Tamamlama koşulları
- Kullanıcı Firebase Authentication ile doğrulanmalı; personel eşlemesi sunucu tarafında yapılmalı.
- Video izleme kayıtları doğrulanmış kullanıcıya ve eğitim atamasına bağlanmalı.
- Sınav değerlendirmesi ve sertifika hak edişi güvenilir sunucuda hesaplanmalı.
- Deneme ve üretim eğitimleri ayrı tutulmalı.
- Firestore güvenlik kuralları, OSGB uygulamasının mevcut kullanım senaryolarıyla birlikte emulator testlerinden geçirilmeli.
- Tüm video varlıkları gerçek içerikle üretilmeli; süreleri dosya metadatası ve eğitim kayıtlarıyla karşılaştırılmalı.

## Dağıtım notu
Bu kontrol listesi tek başına güvenlik düzeltmesi değildir. Kullanıcıya üretim hazırlığı tamamlandı denmemelidir.
