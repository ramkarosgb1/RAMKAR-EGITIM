# RAMKAR Eğitim — canlıya alma güvenlik kapıları

## Mevcut durum
Netlify ilk dağıtımı yapıldı. Bu **mevzuata uygun, üretimde kullanılabilir LMS** anlamına gelmez.
Firebase projesi `ramkar-osgb-sistem`, OSGB uygulamasıyla ortaktır.
**Bu depodan Firebase Firestore kurallarını körlemesine yayımlamayın**; OSGB uygulamasının erişimini kesebilir.

## Güvenli giriş tasarımı
- Çalışan kullanıcı adı: 11 haneli TC kimlik numarası; ikinci faktör: doğrulanmış telefon/e-posta için tek kullanımlık kod veya önceden oluşturulmuş güçlü parola.
- TC numarasını **parola, oturum belirteci, URL parametresi veya tek başına kimlik kanıtı** olarak kullanmayın.
- Firebase Authentication ile kullanıcıyı doğrulayın; sunucuda UID -> personel eşleşmesini yapın.
- Yönetici: Firebase Auth + sunucuda doğrulanan custom claim/rol. Firestore `uzmanlar.sifre` alanında düz metin parola tutmayın.
- Firestore kuralları: `personeller`, `egitimler`, `egitim_loglari`, `sistem_giris_loglari`, `settings`, `uzmanlar` koleksiyonları için kullanıcı/kurum bazlı en az yetki. Emulator testleri olmadan yayınlamayın.
- Loglar, sınav puanları ve sertifika hak edişi sadece güvenilir sunucu işlemleriyle kaydedilsin; istemci tarafından `tamamlandi=true` yazılması yeterli olmasın.
- IP/cihaz verisi işleme için KVKK kapsamında amaç, saklama süresi, erişim, aydınlatma ve silme prosedürü belirleyin.

## Yayın kapıları
1. Firebase proje sahibiyle yetkili bağlantı kurulması ve mevcut Firestore kurallarının yedeği.
2. Kimlik doğrulama, rol bazlı erişim ve negatif güvenlik testleri.
3. Mevzuat uzmanının konu/süre eşlemesini ve az tehlikeli sınıf programını onaylaması.
4. Gerçek 8 saatlik video varlıkları; kesintili izleme, hız, tamamlama ve sunucu tarafı süre doğrulaması.
5. Sınav soru bankası, başarı eşiği, tekrar kuralları ve denetlenebilir sertifika üretimi.
6. Netlify dağıtım günlükleri, staging testi ve yetkili canlıya alma onayı.

## Bilinen geçici kısıtlamalar
`src/middleware.ts` yönetici ve çalışan sayfalarını oturum doğrulaması tamamlanana kadar yönlendirir.
`/api/send-email` ve `/api/log-exit` yetkisiz erişime karşı 503 döner.
Bu tedbirler **Firebase Firestore'un doğrudan istemci erişimini kapatmaz**. Firestore güvenlik kuralları ayrıca denetlenmelidir.
