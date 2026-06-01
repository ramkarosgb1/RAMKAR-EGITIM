import { jsPDF } from "jspdf";

interface CertificateData {
  adSoyad: string;
  tcNo: string;
  egitimAdi: string;
  tarih: string;
  puan?: string | number;
}

export const generateCertificate = (data: CertificateData) => {
  // Create an A4 landscape PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Draw background border
  doc.setDrawColor(30, 58, 138); // Tailwind blue-900
  doc.setLineWidth(5);
  doc.rect(10, 10, width - 20, height - 20);
  
  // Inner border
  doc.setDrawColor(59, 130, 246); // Tailwind blue-500
  doc.setLineWidth(1);
  doc.rect(15, 15, width - 30, height - 30);

  // Logo / Header Placeholder (We can draw shapes or text)
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(28);
  // jsPDF default font doesn't support Turkish chars perfectly, 
  // so we should replace some chars or stick to basic ASCII if no custom font is loaded.
  // We will replace basic turkish chars just in case, or use standard.
  const title = "Egitim Katilim Sertifikasi";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (width - titleWidth) / 2, 40);

  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139); // slate-500
  const subTitle = "6331 Sayili Is Sagligi ve Guvenligi Kanunu Kapsaminda";
  const subTitleWidth = doc.getTextWidth(subTitle);
  doc.text(subTitle, (width - subTitleWidth) / 2, 50);

  // Main Text
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  const text1 = "Bu sertifika,";
  doc.text(text1, width / 2, 80, { align: "center" });

  doc.setFontSize(24);
  doc.setTextColor(30, 58, 138);
  doc.text(data.adSoyad.toUpperCase(), width / 2, 95, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105);
  doc.text(`TC Kimlik: ${data.tcNo}`, width / 2, 105, { align: "center" });

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const text2 = "tarafindan basariyla tamamlanan asagidaki egitim icin duzenlenmistir:";
  doc.text(text2, width / 2, 120, { align: "center" });

  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  // Handle long training names by wrapping or truncating (here we just center)
  doc.text(data.egitimAdi, width / 2, 140, { align: "center" });

  if (data.puan && data.puan !== "-") {
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74); // green-600
    doc.text(`Sinav Basari Skoru: ${data.puan} / 100`, width / 2, 155, { align: "center" });
  }

  // Footer / Signatures
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  
  doc.text(`Duzenlenme Tarihi: ${data.tarih}`, 30, height - 30);
  
  doc.text("Egitim Kurumu Yetkilisi", width - 30, height - 40, { align: "right" });
  doc.text("RAMKAR OSGB", width - 30, height - 30, { align: "right" });

  // Download the PDF
  doc.save(`Sertifika_${data.tcNo}_${data.tarih.replace(/\./g, '')}.pdf`);
};
