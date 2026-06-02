import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { egitimBaslik, personeller } = await request.json();

    if (!egitimBaslik || !personeller || !Array.isArray(personeller)) {
      return NextResponse.json(
        { error: "Eksik parametreler" },
        { status: 400 }
      );
    }

    // SMTP Ayarları (Kurumsal kullanıma geçildiğinde .env'den alınacak)
    // Şu an test aşamasında olduğumuz için console'a logluyoruz.
    // Eğer SMTP şifresi varsa mail atacak, yoksa sadece simülasyon yapacak.
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    let transporter;
    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    let basarili = 0;
    let basarisiz = 0;

    for (const personel of personeller) {
      // Eğer personelin e-posta adresi kayıtlıysa mail gönder
      if (personel.eposta || personel.email) {
        const aliciEposta = personel.eposta || personel.email;
        const mailOptions = {
          from: `"OSGB Eğitim Portalı" <${smtpUser || "noreply@osgbegitim.com"}>`,
          to: aliciEposta,
          subject: `Yeni İSG Eğitimi Atandı: ${egitimBaslik}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #4F46E5;">Sayın ${personel.ad || ""} ${personel.soyad || ""},</h2>
              <p>Sisteme yeni bir İş Sağlığı ve Güvenliği (İSG) uzaktan eğitim modülü atanmıştır.</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Eğitim Adı:</strong> ${egitimBaslik}</p>
              </div>

              <p>Eğitiminizi tamamlamak ve sınavınıza girmek için lütfen aşağıdaki bilgilerle sisteme giriş yapınız:</p>
              <ul>
                <li><strong>Giriş Adresi:</strong> <a href="https://isgbysuzaktanegitim.com/portal/login" target="_blank">Eğitim Portalı</a></li>
                <li><strong>Giriş Şifreniz (TC Kimlik Numaranız):</strong> ${personel.tcNo}</li>
              </ul>
              
              <p style="color: #dc2626; font-weight: bold; margin-top: 30px;">
                Önemli Not: Eğitim videolarındaki izleme süreleriniz, giriş IP adresiniz ve cihaz bilgileriniz mevzuat gereği resmi kayıt altına alınmaktadır. Lütfen eğitimi bizzat ve dikkatlice tamamlayınız.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #777;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
            </div>
          `,
        };

        if (transporter) {
          try {
            await transporter.sendMail(mailOptions);
            basarili++;
          } catch (err) {
            console.error("Mail gönderim hatası:", err);
            basarisiz++;
          }
        } else {
          // SMTP tanımlı değilse sadece simülasyon olarak logla
          console.log(`[SIMULATION] Mail gönderildi: ${aliciEposta} -> ${egitimBaslik}`);
          basarili++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Mail işlemi tamamlandı. Başarılı: ${basarili}, Başarısız: ${basarisiz}. (E-posta adresi olmayan personeller atlanmıştır)`,
    });
  } catch (error) {
    console.error("E-posta API hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}
