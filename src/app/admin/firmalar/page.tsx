"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Firma {
  id: string;
  unvan: string;
  calisanSayisi: number;
}

export default function FirmalarPage() {
  const [firmalar, setFirmalar] = useState<Firma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFirmalar = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "firmalar"));
        const firmalarData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Firma[];
        setFirmalar(firmalarData);
      } catch (error) {
        console.error("Firmalar çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirmalar();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Firmalar ve Atamalar</h1>
          <p className="text-slate-500 text-sm">Veriler ortak Firebase veritabanından alınmaktadır.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Firma Adı</th>
                <th className="px-6 py-4 font-semibold">Personel Sayısı</th>
                <th className="px-6 py-4 font-semibold">Atanan Eğitim</th>
                <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : firmalar.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Kayıtlı firma bulunamadı.</td>
                </tr>
              ) : (
                firmalar.map((firma) => (
                  <tr key={firma.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{firma.unvan}</td>
                    <td className="px-6 py-4 text-slate-500">{firma.calisanSayisi || 0} Personel</td>
                    <td className="px-6 py-4 text-slate-500">0 Eğitim Modülü</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium">Eğitim Ata</button>
                      <button className="text-emerald-600 hover:text-emerald-800 font-medium">Raporlar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
