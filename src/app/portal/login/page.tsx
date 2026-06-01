"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PortalLogin() {
  const [tcNo, setTcNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sadece tcNo ile personeli bul
      const q = query(
        collection(db, "personeller"),
        where("tcNo", "==", tcNo)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Oturum bilgisini kaydet
        sessionStorage.setItem("active_tcNo", tcNo);

        // IP Adresi ve Cihaz Bilgisini Al (Mevzuat Uyumu İçin)
        let ipAdresi = "Bilinmiyor";
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          const data = await res.json();
          ipAdresi = data.ip;
        } catch (ipErr) {
          console.error("IP alınamadı:", ipErr);
        }
        
        const cihazTuru = typeof window !== "undefined" ? window.navigator.userAgent : "Bilinmiyor";

        // Sisteme giriş logu oluştur (Yönetmelik gereği)
        try {
          await addDoc(collection(db, "sistem_giris_loglari"), {
            tcNo,
            girisZamani: new Date().toISOString(),
            platform: "Calisan Portali",
            ipAdresi,
            cihazTuru
          });
        } catch (logErr) {
          console.error("Log yazılamadı:", logErr);
        }

        router.push("/portal/egitimler");
      } else {
        setError("Bu TC Kimlik numarasına kayıtlı bir personel bulunamadı.");
      }
    } catch (err) {
      console.error(err);
      setError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Çalışan Girişi</h2>
            <p className="text-slate-500">Sisteme kayıtlı TC Kimlik numaranızı girin</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="tcNo">
                TC Kimlik Numarası
              </label>
              <input
                id="tcNo"
                type="text"
                required
                maxLength={11}
                value={tcNo}
                onChange={(e) => setTcNo(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="11 Haneli TC No"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Ana sayfaya dönmek için <Link href="/" className="font-semibold text-blue-600 hover:text-blue-500">tıklayın</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
