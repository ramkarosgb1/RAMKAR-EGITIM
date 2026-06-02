"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const handleVisibilityChange = () => {
      const activeLogId = sessionStorage.getItem("active_log_id");
      if (!activeLogId) return;

      if (document.visibilityState === "hidden") {
        // Kullanıcı sekmeyi kapattı, sayfayı yeniledi veya arka plana aldı
        const payload = JSON.stringify({ logId: activeLogId, action: "exit" });
        navigator.sendBeacon("/api/log-exit", payload);
      } else if (document.visibilityState === "visible") {
        // Kullanıcı sekmeye geri döndü
        fetch("/api/log-exit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logId: activeLogId, action: "return" }),
          keepalive: true
        }).catch(err => console.error("Return log err:", err));
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    // Safari ve iOS için pagehide ek önlemi
    window.addEventListener("pagehide", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleVisibilityChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const activeLogId = sessionStorage.getItem("active_log_id");
      if (activeLogId) {
        // Çıkış zamanını kaydet
        await updateDoc(doc(db, "sistem_giris_loglari", activeLogId), {
          cikisZamani: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Çıkış logu yazılamadı:", err);
    } finally {
      // Temizlik ve yönlendirme
      sessionStorage.removeItem("active_tcNo");
      sessionStorage.removeItem("active_log_id");
      router.push("/portal/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">OSGB Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500 hidden sm:block mr-2">Çalışan Ekranı</span>
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Ana Sayfa
              </Link>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
