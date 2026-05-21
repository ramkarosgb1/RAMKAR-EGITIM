"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Egitim {
  id: string;
  baslik: string;
  sure: string;
  videoUrl: string;
  durum?: string; // "tamamlandi", "devam-ediyor", "baslamadi"
}

export default function CalisanEgitimleriPage() {
  const [egitimler, setEgitimler] = useState<Egitim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEgitimler = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "egitimler"));
        const egitimlerData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          durum: "baslamadi", // Varsayılan durum
          ...doc.data()
        })) as Egitim[];
        setEgitimler(egitimlerData);
      } catch (error) {
        console.error("Eğitimler çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEgitimler();
  }, []);

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
                <Link 
                  href={`/portal/egitim/${egitim.id}`}
                  className={`w-full py-2 px-4 rounded-lg text-center text-sm font-semibold transition-colors ${
                    egitim.durum === "tamamlandi" 
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  }`}
                >
                  {egitim.durum === "tamamlandi" ? "Tekrar İzle" : egitim.durum === "devam-ediyor" ? "Kaldığın Yerden Devam Et" : "Eğitime Başla"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
