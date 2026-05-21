"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AdminLogin() {
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Hardcoded Admin kontrolü
      if (kullaniciAdi === "admin" && password === "admin123") {
        router.push("/admin/egitimler");
        return;
      }

      // Uzmanlar tablosunda kontrol et
      const q = query(
        collection(db, "uzmanlar"),
        where("kullaniciAdi", "==", kullaniciAdi),
        where("sifre", "==", password),
        where("aktifMi", "==", true)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Eşleşme bulundu, giriş başarılı
        router.push("/admin/egitimler");
      } else {
        setError("Kullanıcı adı veya şifre hatalı.");
      }
    } catch (err) {
      console.error(err);
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Uzman Girişi</h2>
            <p className="text-slate-400">Yönetim paneline erişmek için giriş yapın</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400 font-medium text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                required
                value={kullaniciAdi}
                onChange={(e) => setKullaniciAdi(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Kullanıcı Adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="password">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Ana sayfaya dönmek için <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-500">tıklayın</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
