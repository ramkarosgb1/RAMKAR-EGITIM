/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CanliTakipPage() {
  const [activeTab, setActiveTab] = useState<"egitim" | "giris">("egitim");
  const [loading, setLoading] = useState(true);
  
  const [egitimLogs, setEgitimLogs] = useState<any[]>([]);
  const [girisLogs, setGirisLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Personelleri ve Eğitimleri Çek (İsim eşleştirmesi için)
        const personellerSnap = await getDocs(collection(db, "personeller"));
        const personellerMap: Record<string, string> = {};
        personellerSnap.forEach((doc) => {
          const data = doc.data();
          if (data.tcNo) personellerMap[data.tcNo] = `${data.ad || ''} ${data.soyad || ''}`.trim();
        });

        const egitimlerSnap = await getDocs(collection(db, "egitimler"));
        const egitimlerMap: Record<string, string> = {};
        egitimlerSnap.forEach((doc) => {
          egitimlerMap[doc.id] = doc.data().baslik || "Bilinmeyen Eğitim";
        });

        // 2. Eğitim Loglarını Çek
        if (activeTab === "egitim" && egitimLogs.length === 0) {
          const eLogsSnap = await getDocs(collection(db, "egitim_loglari"));
          const tempELogs: any[] = [];
          eLogsSnap.forEach((doc) => {
            const data = doc.data();
            tempELogs.push({
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
          tempELogs.sort((a, b) => b.sonGiris.localeCompare(a.sonGiris));
          setEgitimLogs(tempELogs);
        }

        // 3. Giriş Loglarını Çek (Son 100 log)
        if (activeTab === "giris" && girisLogs.length === 0) {
          const gLogsQuery = query(collection(db, "sistem_giris_loglari"), orderBy("girisZamani", "desc"), limit(100));
          const gLogsSnap = await getDocs(gLogsQuery);
          const tempGLogs: any[] = [];
          gLogsSnap.forEach((doc) => {
            const data = doc.data();
            tempGLogs.push({
              id: doc.id,
              tcNo: data.tcNo,
              adSoyad: personellerMap[data.tcNo] || "Bilinmeyen Personel",
              girisZamani: data.girisZamani ? new Date(data.girisZamani).toLocaleString("tr-TR") : "-",
              platform: data.platform || "-",
              ipAdresi: data.ipAdresi || "Bilinmiyor",
              cihazTuru: data.cihazTuru || "Bilinmiyor"
            });
          });
          setGirisLogs(tempGLogs);
        }

      } catch (err) {
        console.error("Veri çekilirken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, egitimLogs.length, girisLogs.length]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Canlı Takip ve Log İzleme</h1>
          <p className="text-slate-500 mt-1">Personellerin sistemdeki işlemlerini anlık olarak buradan takip edebilirsiniz.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("egitim")}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "egitim" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Eğitim İlerleme Tablosu
        </button>
        <button
          onClick={() => setActiveTab("giris")}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "giris" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Sistem Giriş Logları (IP & Cihaz)
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">
            {activeTab === "egitim" ? "Canlı Eğitim Durum Tablosu" : "Sistem Giriş Logları (Son 100 Kayıt)"}
          </h3>
          <div className="text-sm text-slate-500">Son Güncelleme: {new Date().toLocaleTimeString('tr-TR')}</div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              Veriler yükleniyor...
            </div>
          ) : activeTab === "egitim" ? (
            egitimLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Sistemde henüz bir izleme kaydı bulunmuyor.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                    <th className="p-4 font-semibold">Personel</th>
                    <th className="p-4 font-semibold">TC Kimlik</th>
                    <th className="p-4 font-semibold">Eğitim Adı</th>
                    <th className="p-4 font-semibold">Video İlerlemesi</th>
                    <th className="p-4 font-semibold">Sınav Durumu</th>
                    <th className="p-4 font-semibold">Son Giriş</th>
                    <th className="p-4 font-semibold">Sertifika</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {egitimLogs.map((log) => (
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
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            İndir
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Bekleniyor</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            girisLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Sistemde henüz bir giriş kaydı bulunmuyor.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                    <th className="p-4 font-semibold">Tarih / Saat</th>
                    <th className="p-4 font-semibold">Personel</th>
                    <th className="p-4 font-semibold">TC Kimlik</th>
                    <th className="p-4 font-semibold">IP Adresi</th>
                    <th className="p-4 font-semibold max-w-xs">Cihaz Bilgisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {girisLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-700">{log.girisZamani}</td>
                      <td className="p-4 font-medium text-slate-900">{log.adSoyad}</td>
                      <td className="p-4 text-slate-500">{log.tcNo}</td>
                      <td className="p-4 text-slate-700 font-mono text-xs">{log.ipAdresi}</td>
                      <td className="p-4 text-slate-500 max-w-xs truncate" title={log.cihazTuru}>
                        {log.cihazTuru}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
