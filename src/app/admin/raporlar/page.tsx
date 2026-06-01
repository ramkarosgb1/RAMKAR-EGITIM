/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RaporlarPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"egitim" | "giris">("egitim");
  const [logsList, setLogsList] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Sayfa yüklendiğinde logları çek
  useEffect(() => {
    const fetchLiveLogs = async () => {
      setLoadingLogs(true);
      try {
        // 1. Personelleri Çek (TC'ye göre isim eşleştirmek için)
        const personellerSnap = await getDocs(collection(db, "personeller"));
        const personellerMap: Record<string, string> = {};
        personellerSnap.forEach((doc) => {
          const data = doc.data();
          if (data.tcNo) {
            personellerMap[data.tcNo] = `${data.ad || ''} ${data.soyad || ''}`.trim();
          }
        });

        // 2. Eğitimleri Çek (Eğitim adına erişmek için)
        const egitimlerSnap = await getDocs(collection(db, "egitimler"));
        const egitimlerMap: Record<string, string> = {};
        egitimlerSnap.forEach((doc) => {
          egitimlerMap[doc.id] = doc.data().baslik || "Bilinmeyen Eğitim";
        });

        // 3. Logları Çek
        const loglarSnap = await getDocs(collection(db, "egitim_loglari"));
        const tempLogs: any[] = [];
        loglarSnap.forEach((doc) => {
          const data = doc.data();
          tempLogs.push({
            id: doc.id,
            tcNo: data.tcNo,
            adSoyad: personellerMap[data.tcNo] || "Bilinmeyen Personel",
            egitimAdi: egitimlerMap[data.egitimId] || data.egitimId,
            tamamlamaOrani: Math.min(Math.round(data.tamamlamaOrani || 0), 100),
            sonGiris: data.sonGiris ? new Date(data.sonGiris).toLocaleString("tr-TR") : "-",
            sinavSkoru: data.sinavSkoru ?? "-",
            basariDurumu: data.basariDurumu || "Girmedi",
            tamamlandi: data.tamamlandi || false
          });
        });

        // Tarihe göre sırala (En yeni en üstte)
        tempLogs.sort((a, b) => {
          if (a.sonGiris === "-") return 1;
          if (b.sonGiris === "-") return -1;
          // basit string reverse sort
          return b.sonGiris.localeCompare(a.sonGiris);
        });

        setLogsList(tempLogs);
      } catch (err) {
        console.error("Canlı log çekilirken hata:", err);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLiveLogs();
  }, []);

  // CSV İndirme Yardımcı Fonksiyonu
  const downloadCSV = (csvContent: string, fileName: string) => {
    // Türkçe karakter (UTF-8 BOM) uyumluluğu için
    const BOM = "\uFEFF"; 
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportEgitimLoglari = async () => {
    setIsExporting(true);
    setExportType("egitim");
    try {
      const querySnapshot = await getDocs(collection(db, "egitim_loglari"));
      const logs: any[] = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });

      if (logs.length === 0) {
        alert("Henüz eğitim logu bulunmamaktadır.");
        return;
      }

      // CSV Başlıkları
      let csv = "Log ID,TC Kimlik No,Egitim ID,Tamamlama Orani (%),En Son Ilenen Saniye,Son Giris Tarihi,Sinav Tamamlandi,Sinav Skoru,Basari Durumu,Sinav Tarihi\n";

      logs.forEach(log => {
        const row = [
          log.id || "-",
          log.tcNo || "-",
          log.egitimId || "-",
          log.tamamlamaOrani ? Math.round(log.tamamlamaOrani) : "0",
          log.maxWatchedTime ? Math.round(log.maxWatchedTime) : "0",
          log.sonGiris ? new Date(log.sonGiris).toLocaleString("tr-TR") : "-",
          log.sinavTamamlandi ? "Evet" : "Hayir",
          log.sinavSkoru ?? "-",
          log.basariDurumu || "-",
          log.sinavTarihi ? new Date(log.sinavTarihi).toLocaleString("tr-TR") : "-"
        ];
        csv += row.join(",") + "\n";
      });

      downloadCSV(csv, `egitim_loglari_${new Date().toISOString().slice(0,10)}.csv`);
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      alert("Bir hata oluştu.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportGirisLoglari = async () => {
    setIsExporting(true);
    setExportType("giris");
    try {
      const querySnapshot = await getDocs(collection(db, "sistem_giris_loglari"));
      const logs: any[] = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });

      if (logs.length === 0) {
        alert("Henüz giriş logu bulunmamaktadır.");
        return;
      }

      let csv = "Log ID,TC Kimlik No,Giris Zamani,Platform\n";

      logs.forEach(log => {
        const row = [
          log.id || "-",
          log.tcNo || "-",
          log.girisZamani ? new Date(log.girisZamani).toLocaleString("tr-TR") : "-",
          log.platform || "-"
        ];
        csv += row.join(",") + "\n";
      });

      downloadCSV(csv, `sistem_giris_loglari_${new Date().toISOString().slice(0,10)}.csv`);
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      alert("Bir hata oluştu.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Raporlar & Uzman Takip Paneli</h1>
          <p className="text-slate-500 mt-1">Sistemdeki tüm denetim verilerini ve çalışanların durumlarını anlık takip edebilirsiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Eğitim İzleme ve Sınav Logları Kartı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Eğitim & Sınav Logları (Excel)</h3>
          <p className="text-sm text-slate-500 mb-6 flex-1">
            Personellerin videoları yüzde kaç izlediğini, ne zaman giriş yaptıklarını ve sınav sonuçlarını içerir.
          </p>
          <button 
            onClick={exportEgitimLoglari}
            disabled={isExporting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isExporting && exportType === "egitim" ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            Tüm Logları İndir (Excel/CSV)
          </button>
        </div>

        {/* Sistem Giriş Logları Kartı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Sisteme Giriş Logları (Excel)</h3>
          <p className="text-sm text-slate-500 mb-6 flex-1">
            Çalışanların sisteme giriş yaptıkları kesin tarih ve saat damgalarını (timestamp) içerir.
          </p>
          <button 
            onClick={exportGirisLoglari}
            disabled={isExporting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isExporting && exportType === "giris" ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            Tüm Logları İndir (Excel/CSV)
          </button>
        </div>
      </div>

      {/* Canlı Takip Tablosu */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Canlı Eğitim Durum Tablosu</h3>
          <div className="text-sm text-slate-500">Son İşlem Saati: {new Date().toLocaleTimeString('tr-TR')}</div>
        </div>
        
        <div className="overflow-x-auto">
          {loadingLogs ? (
            <div className="p-12 text-center text-slate-500">Veriler yükleniyor...</div>
          ) : logsList.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Sistemde henüz bir izleme kaydı bulunmuyor.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                  <th className="p-4 font-semibold">Personel</th>
                  <th className="p-4 font-semibold">TC Kimlik</th>
                  <th className="p-4 font-semibold">Eğitim Adı</th>
                  <th className="p-4 font-semibold">Video İlerlemesi</th>
                  <th className="p-4 font-semibold">Sınav / Başarı</th>
                  <th className="p-4 font-semibold">Son Giriş</th>
                  <th className="p-4 font-semibold">Sertifika</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logsList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{log.adSoyad}</td>
                    <td className="p-4 text-slate-500">{log.tcNo}</td>
                    <td className="p-4 text-slate-700">{log.egitimAdi}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${log.tamamlandi || log.tamamlamaOrani >= 99 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${log.tamamlamaOrani}%` }}
                          />
                        </div>
                        <span className={`font-semibold ${log.tamamlandi || log.tamamlamaOrani >= 99 ? 'text-green-600' : 'text-slate-700'}`}>
                          %{log.tamamlamaOrani}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {log.sinavSkoru !== "-" ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.basariDurumu === "Basarili" || log.basariDurumu === "Başarılı" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          Skor: {log.sinavSkoru}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Sınava Girmedi
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">{log.sonGiris}</td>
                    <td className="p-4">
                      {(log.tamamlandi || log.tamamlamaOrani >= 99) ? (
                        <button 
                          onClick={() => {
                            import("@/lib/pdfGenerator").then(({ generateCertificate }) => {
                              generateCertificate({
                                adSoyad: log.adSoyad,
                                tcNo: log.tcNo,
                                egitimAdi: log.egitimAdi,
                                tarih: new Date().toLocaleDateString("tr-TR"),
                                puan: log.sinavSkoru
                              });
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
                          Sertifika
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Tamamlanmadı</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
  );
}
