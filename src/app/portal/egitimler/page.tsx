/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface Egitim {
  id: string;
  baslik: string;
  sure: string;
  videoUrl: string;
  durum?: string; // "tamamlandi", "devam-ediyor", "baslamadi"
  sinavSkoru?: string | number;
}

export default function CalisanEgitimleriPage() {
  const [egitimler, setEgitimler] = useState<Egitim[]>([]);
  const [loading, setLoading] = useState(true);
  const [adSoyad, setAdSoyad] = useState("");
  const [tcNo, setTcNo] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchVeriler = async () => {
      try {
        const storedTc = sessionStorage.getItem("active_tcNo");
        if (!storedTc) {
          router.push("/portal/login");
          return;
        }
        setTcNo(storedTc);

        // 1. Personel bilgisini al
        const pQuery = query(collection(db, "personeller"), where("tcNo", "==", storedTc));
        const pSnap = await getDocs(pQuery);
        if (!pSnap.empty) {
           const pData = pSnap.docs[0].data();
           setAdSoyad(`${pData.ad || ''} ${pData.soyad || ''}`.trim());
        }

        // 2. Eğitim Loglarını al
        const logQuery = query(collection(db, "egitim_loglari"), where("tcNo", "==", storedTc));
        const logSnap = await getDocs(logQuery);
        const userLogs: Record<string, any> = {};
        logSnap.forEach(doc => {
           userLogs[doc.data().egitimId] = doc.data();
        });

        // 3. Eğitimleri al
        const querySnapshot = await getDocs(collection(db, "egitimler"));
        const egitimlerData = querySnapshot.docs.map(doc => {
          const log = userLogs[doc.id];
          let durum = "baslamadi";
          
          if (log) {
            if (log.tamamlandi || log.tamamlamaOrani >= 99) {
               durum = "tamamlandi";
            } else if (log.maxWatchedTime > 0) {
               durum = "devam-ediyor";
            }
          }

          return {
            id: doc.id,
            durum,
            sinavSkoru: log?.sinavSkoru,
            ...doc.data()
          };
        }) as Egitim[];
        
        setEgitimler(egitimlerData);
      } catch (error) {
        console.error("Eğitimler çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVeriler();
  }, [router]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Eğitimlerim</h1>
          <p className="text-slate-500 mt-2">Firmanız tarafından size atanan eğitimleri aşağıdan izleyebilirsiniz.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Eğitimler yükleniyor...</div>
        ) : egitimler.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500">
            Şu anda size atanmış bir eğitim bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {egitimler.map((egitim) => (
              <div key={egitim.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{egitim.baslik}</h3>
                    {egitim.durum === "tamamlandi" && (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Tamamlandı</span>
                    )}
                    {egitim.durum === "devam-ediyor" && (
                      <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Devam Ediyor</span>
                    )}
                    {egitim.durum === "baslamadi" && (
                      <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">Başlamadı</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {egitim.sure}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Link 
                    href={`/portal/egitim/${egitim.id}`}
                    className={`block w-full py-2 px-4 rounded-lg text-center text-sm font-semibold transition-colors ${
                      egitim.durum === "tamamlandi" 
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    }`}
                  >
                    {egitim.durum === "tamamlandi" ? "Tekrar İzle" : egitim.durum === "devam-ediyor" ? "Kaldığın Yerden Devam Et" : "Eğitime Başla"}
                  </Link>

                  {egitim.durum === "tamamlandi" && (
                    <button 
                      onClick={() => {
                        import("@/lib/pdfGenerator").then(({ generateCertificate }) => {
                          generateCertificate({
                            adSoyad: adSoyad || "Sayın Personel",
                            tcNo: tcNo,
                            egitimAdi: egitim.baslik,
                            tarih: new Date().toLocaleDateString("tr-TR"),
                            puan: egitim.sinavSkoru
                          });
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-semibold transition-colors border border-green-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      Sertifikamı İndir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
