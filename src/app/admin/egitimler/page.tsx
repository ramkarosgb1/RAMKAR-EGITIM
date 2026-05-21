"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Egitim {
  id: string;
  baslik: string;
  sure: string;
  videoUrl: string;
  izlenme: number;
}

export default function EgitimlerPage() {
  const [egitimler, setEgitimler] = useState<Egitim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEgitimler = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "egitimler"));
      const egitimlerData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Egitim[];
      setEgitimler(egitimlerData);
    } catch (error) {
      console.error("Eğitimler çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEgitimler();
  }, []);

  const handleSil = async (id: string) => {
    if (confirm("Bu eğitimi silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "egitimler", id));
        fetchEgitimler(); // Listeyi yenile
      } catch (error) {
        console.error("Hata:", error);
        alert("Eğitim silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Eğitim Modülleri</h1>
          <Link href="/admin/egitimler/yeni" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            + Yeni Eğitim Ekle
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Eğitim Başlığı</th>
                <th className="px-6 py-4 font-semibold">Süre</th>
                <th className="px-6 py-4 font-semibold">İzlenme</th>
                <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : egitimler.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Henüz eğitim modülü eklenmemiş. Lütfen yeni eğitim ekleyin.
                  </td>
                </tr>
              ) : (
                egitimler.map((egitim) => (
                  <tr key={egitim.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{egitim.baslik}</td>
                    <td className="px-6 py-4 text-slate-500">{egitim.sure}</td>
                    <td className="px-6 py-4 text-slate-500">{egitim.izlenme || 0} kişi</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium">Düzenle</button>
                      <button onClick={() => handleSil(egitim.id)} className="text-red-600 hover:text-red-800 font-medium">Sil</button>
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
