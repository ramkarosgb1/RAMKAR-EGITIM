# RAMKAR İSG eğitim üretim planı (taslak)

## İlk sürüm
- Hedef: az tehlikeli işyerleri, toplam 8 saat; diğer sınıflar daha sonra.
- Kaynak: kullanıcı tarafından verilen ders/süre çizelgesi; kesin süreler görselden tekrar doğrulanmadan sabitlenmez.
- Eğitimler: modül > ders > video > kontrol soruları > sınav > doğrulanabilir eğitim kaydı.
- Her ders için video senaryosu, görsel plan, seslendirme metni, alt yazı, kısa quiz ve kaynak/mevzuat sürümü tutulur.
- Ders süreleri toplamı 480 dakika olacak şekilde onaylı çizelgeden alınır; videonun süresi ve gerçekten izlenen süre ayrı kaydedilir.

## Video üretim prompt şablonu
Rol: Türkçe konuşan, yetişkin çalışanlara eğitim veren İSG uzmanı ve öğretim tasarımcısı.
Girdi: {ders_basligi}, {hedef_sure_dakika}, {mevzuat_kaynagi}, {sektor_ornekleri}.
Çıktı: (1) öğrenme hedefleri (2) dakika-dakika sahne planı (3) tam seslendirme metni (4) görsel üretim promptları (5) ekranda görünen yazılar (6) altyazı dosyası için zamanlı döküm (7) 5 soruluk bilgi kontrolü ve cevap gerekçeleri (8) kaynaklar.
Kurallar: Gerçek dışı kaza görüntüsü veya yanıltıcı yasal iddia üretme; uygulanabilir güvenli davranışları göster; güncel mevzuat maddelerini kaynak olmadan uydurma; toplam sahne süresini hedef süreye eşitle; bölüm sonunda tekrar ve öğrenme kontrolü yap.

## Personel entegrasyonu
Kaynak uygulama: ramkarosgb1/ramkar-osgb. AGENTS.md uyarınca kaynak veri Firebase Firestore projesi ramkar-osgb-sistem üzerindedir.
- Gerçek personel verisini kopyalamadan önce servis ve koleksiyon şeması, erişim izinleri ve KVKK amacı doğrulanmalı.
- Tercih: sunucu tarafında yetkili salt-okunur entegrasyon, şirket bazlı kapsam ve en az veri (personel kimliği, ad-soyad, şirket kimliği, aktiflik).
- İstemcide yönetici anahtarı bulundurma; kimlik doğrulama, erişim günlükleri ve idempotent senkronizasyon kullan.
- Şimdilik gerçek personel aktarımı YAPILMADI.

## Uygunluk kontrol kapısı
İlgili yürürlükteki yönetmelik ve uzaktan eğitim koşulları yetkin İSG uzmanı/hukuk danışmanı tarafından kontrol edilmeden sistem 'mevzuata tam uygun' veya belgeler 'resmi geçerli' olarak sunulmaz. Eğitim tamamlanma ve sınav kayıtları değiştirilemez denetim izleriyle tutulmalıdır.

## Yayına alma koşulları
Kimlik doğrulama, tenant izolasyonu, Firestore güvenlik kuralları, video barındırma, eğitim süresi doğrulama, sınav testleri, KVKK aydınlatması, yedekleme ve mevzuat onayı tamamlanmadan canlıya çıkılmaz.
