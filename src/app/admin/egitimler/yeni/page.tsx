"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function YeniEgitimPage() {
  const [baslik, setBaslik] = useState("");
  const [sure, setSure] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "egitimler"), {
        baslik,
        sure,
        videoUrl,
        izlenme: 0,
        olusturulmaTarihi: serverTimestamp()
      });
      
      alert("Eğitim başarıyla eklendi!");
      router.push("/admin/egitimler");
    } catch (error) {
      console.error("Hata:", error);
      alert("Eğitim eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/egitimler" className="text-slate-500 hover:text-slate-700">
            &larr; Geri
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Yeni Eğitim Ekle</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleKaydet} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Eğitim Başlığı</label>
              <input
                type="text"
                required
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: Temel İSG Eğitimi"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tahmini Süre</label>
              <input
                type="text"
                required
                value={sure}
                onChange={(e) => setSure(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: 45 dk"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Video Bağlantısı (MP4 URL)</label>
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="https://.../video.mp4"
              />
              <p className="text-sm text-red-500 mt-2 font-medium">
                Önemli: İSG Yönetmeliği gereği YouTube linkleri kullanılamaz. Mutlaka doğrudan bir .mp4 video bağlantısı girmelisiniz.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Kaydediliyor..." : "Eğitimi Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
