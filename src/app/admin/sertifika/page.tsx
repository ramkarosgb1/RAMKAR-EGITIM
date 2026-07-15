"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SertifikaAyarlariPage() {
  const [uzmanAd, setUzmanAd] = useState("");
  const [doktorAd, setDoktorAd] = useState("");
  const [isverenAd, setIsverenAd] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "sertifika");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUzmanAd(data.uzmanAd || "");
          setDoktorAd(data.doktorAd || "");
          setIsverenAd(data.isverenAd || "");
        }
      } catch (error) {
        console.error("Ayarlar çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await setDoc(doc(db, "settings", "sertifika"), {
        uzmanAd,
        doktorAd,
        isverenAd,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setMessage("Ayarlar başarıyla kaydedildi.");
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      setMessage("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sertifika İmza Ayarları</h1>
          <p className="text-slate-500 mt-2">
            Çalışanların eğitim sonunda alacağı PDF sertifikalardaki e-İmza isimlerini buradan belirleyebilirsiniz. 
            Belirlediğiniz isimler, sertifikanın altında otomatik olarak &quot;(e-İmzalıdır)&quot; ibaresiyle birlikte çıkacaktır.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-4">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                İş Güvenliği Uzmanı (Ad Soyad)
              </label>
              <input
                type="text"
                required
                value={uzmanAd}
                onChange={(e) => setUzmanAd(e.target.value)}
                placeholder="Örn: Ramazan Kar"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                İşyeri Hekimi (Ad Soyad)
              </label>
              <input
                type="text"
                required
                value={doktorAd}
                onChange={(e) => setDoktorAd(e.target.value)}
                placeholder="Örn: Dr. Ahmet Yılmaz"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                İşveren / İşveren Vekili (Ad Soyad)
              </label>
              <input
                type="text"
                required
                value={isverenAd}
                onChange={(e) => setIsverenAd(e.target.value)}
                placeholder="Örn: Mehmet Şahin"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
            
            {message && (
              <span className={`text-sm font-medium ${message.includes('hata') ? 'text-red-600' : 'text-emerald-600'}`}>
                {message}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
