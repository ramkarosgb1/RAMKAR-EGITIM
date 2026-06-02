/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CanliTakipPage() {
  const [activeTab, setActiveTab] = useState<"egitim" | "giris" | "ozet">("egitim");
  const [loading, setLoading] = useState(true);
  
  const [egitimLogs, setEgitimLogs] = useState<any[]>([]);
  const [girisLogs, setGirisLogs] = useState<any[]>([]);
  const [personellerList, setPersonellerList] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Personelleri ve Eğitimleri Çek
        const personellerSnap = await getDocs(collection(db, "personeller"));
        const personellerMap: Record<string, string> = {};
        const tempPersoneller: any[] = [];
        personellerSnap.forEach((doc) => {
          const data = doc.data();
          if (data.tcNo) {
            personellerMap[data.tcNo] = `${data.ad || ''} ${data.soyad || ''}`.trim();
            tempPersoneller.push({ id: doc.id, ...data, tamamlananEgitimSayisi: 0, sonDurum: "Bekliyor" });
          }
        });

        const egitimlerSnap = await getDocs(collection(db, "egitimler"));
        const egitimlerMap: Record<string, string> = {};
        egitimlerSnap.forEach((doc) => {
          egitimlerMap[doc.id] = doc.data().baslik || "Bilinmeyen Eğitim";
        });

        // 2. Tüm Eğitim Loglarını Çekip Özete Bağla
        const eLogsSnap = await getDocs(collection(db, "egitim_loglari"));
        const tempELogs: any[] = [];
        
        eLogsSnap.forEach((doc) => {
          const data = doc.data();
          const pTc = data.tcNo || "Hatalı_Kayıt";
          
          const isCompleted = data.tamamlandi || data.tamamlamaOrani >= 99 || data.sinavSkoru >= 70;
          
          if (isCompleted && pTc !== "Hatalı_Kayıt") {
            const pIndex = tempPersoneller.findIndex(p => p.tcNo === pTc);
            if (pIndex !== -1) {
              tempPersoneller[pIndex].tamamlananEgitimSayisi += 1;
              tempPersoneller[pIndex].sonDurum = "Eğitim Aldı";
            }
          }

          if (activeTab === "egitim" && egitimLogs.length === 0) {
            tempELogs.push({
              id: doc.id,
              tcNo: data.tcNo || "Hatalı Kayıt (TC Yok)",
              adSoyad: data.tcNo ? (personellerMap[data.tcNo] || "Bilinmeyen Personel") : "Eksik Kayıt",
              egitimAdi: egitimlerMap[data.egitimId] || data.egitimId || "Bilinmeyen Eğitim",
              tamamlamaOrani: Math.min(Math.round(data.tamamlamaOrani || 0), 100),
              sonGiris: data.sonGiris ? new Date(data.sonGiris).toLocaleString("tr-TR") : "-",
              sinavSkoru: data.sinavSkoru ?? "-",
              basariDurumu: data.basariDurumu || "Girmedi",
              tamamlandi: data.tamamlandi || false
            });
          }
        });

        setPersonellerList(tempPersoneller.sort((a, b) => b.tamamlananEgitimSayisi - a.tamamlananEgitimSayisi));

        if (activeTab === "egitim" && egitimLogs.length === 0) {
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
              tcNo: data.tcNo || "Bilinmiyor",
              adSoyad: data.tcNo ? (personellerMap[data.tcNo] || "Bilinmeyen Personel") : "Eksik Kayıt",
              girisZamani: data.girisZamani ? new Date(data.girisZamani).toLocaleString("tr-TR") : "-",
              cikisZamani: data.cikisZamani ? new Date(data.cikisZamani).toLocaleString("tr-TR") : "Sistemde",
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
          onClick={() => setActiveTab("ozet")}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "ozet" 
              ? "border-purple-600 text-purple-600" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          Eğitim Alanlar & Son Durumlar
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
            {activeTab === "egitim" && "Canlı Eğitim Durum Tablosu"}
            {activeTab === "giris" && "Sistem Giriş/Çıkış Logları (Son 100 Kayıt)"}
            {activeTab === "ozet" && "Tüm Personeller ve Eğitim Başarı Durumları"}
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
                    <th className="p-4 font-semibold">Son İşlem Saati</th>
                    <th className="p-4 font-semibold">Sertifika</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {egitimLogs.map((log) => (
                    <tr key={log.id} className={`transition-colors ${log.tcNo.includes('Hatalı') ? 'bg-red-50' : 'hover:bg-slate-50/50'}`}>
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
                        {(log.tamamlandi || log.tamamlamaOrani >= 99 || log.sinavSkoru >= 70) ? (
                          <button 
                            onClick={() => {
                              import("@/lib/pdfGenerator").then(({ generateCertificate }) => {
                                generateCertificate({
                                  adSoyad: log.adSoyad,
                                  tcNo: log.tcNo,
                                  egitimAdi: log.egitimAdi,
                                  tarih: new Date().toLocaleDateString("tr-TR"),
                                  puan: log.sinavSkoru !== "-" ? log.sinavSkoru : 100
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
          ) : activeTab === "ozet" ? (
            personellerList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Sistemde henüz kayıtlı personel bulunmuyor.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                    <th className="p-4 font-semibold">Personel Adı</th>
                    <th className="p-4 font-semibold">TC Kimlik</th>
                    <th className="p-4 font-semibold">Görev</th>
                    <th className="p-4 font-semibold text-center">Tamamlanan Eğitim</th>
                    <th className="p-4 font-semibold">Genel Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {personellerList.map((personel) => (
                    <tr key={personel.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{personel.ad} {personel.soyad}</td>
                      <td className="p-4 text-slate-500">{personel.tcNo}</td>
                      <td className="p-4 text-slate-500">{personel.gorevi || "-"}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          personel.tamamlananEgitimSayisi > 0 ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {personel.tamamlananEgitimSayisi}
                        </span>
                      </td>
                      <td className="p-4">
                        {personel.tamamlananEgitimSayisi > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Eğitim Aldı
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Eğitim Bekliyor
                          </span>
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
                    <th className="p-4 font-semibold">Giriş Saati</th>
                    <th className="p-4 font-semibold">Çıkış Saati</th>
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
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${log.cikisZamani === 'Sistemde' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {log.cikisZamani}
                        </span>
                      </td>
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
