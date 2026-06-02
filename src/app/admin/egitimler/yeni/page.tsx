/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export default function YeniEgitimPage() {
  const [baslik, setBaslik] = useState("");
  const [sure, setSure] = useState("");
  
  // Yükleme Tipi: 'dosya' veya 'url'
  const [yuklemeTipi, setYuklemeTipi] = useState<"dosya" | "url">("dosya");
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [epostaBildirim, setEpostaBildirim] = useState(true);
  const router = useRouter();

  const handleEpostaGonderim = async (egitimBaslik: string) => {
    try {
      const personellerSnap = await getDocs(collection(db, "personeller"));
      const personeller: any[] = [];
      personellerSnap.forEach(doc => {
        const data = doc.data();
        // Sadece TC'si olan personelleri alıyoruz (E-postası olmayanları API filtreleyecek)
        if (data.tcNo) {
          personeller.push({
            ad: data.ad || "",
            soyad: data.soyad || "",
            tcNo: data.tcNo,
            eposta: data.eposta || data.email || ""
          });
        }
      });

      if (personeller.length > 0) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ egitimBaslik, personeller })
        });
      }
    } catch (err) {
      console.error("E-posta gönderim hatası:", err);
    }
  };

  const handleKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (yuklemeTipi === "dosya" && !videoFile) {
      alert("Lütfen bir MP4 dosyası seçin.");
      return;
    }
    if (yuklemeTipi === "url" && !videoUrlInput) {
      alert("Lütfen MP4 video bağlantısını girin.");
      return;
    }

    setLoading(true);

    try {
      if (yuklemeTipi === "dosya" && videoFile) {
        // 1. Videoyu Storage'a Yükle
        const fileName = `egitim_videolari/${Date.now()}_${videoFile.name}`;
        const storageRef = ref(storage, fileName);
        
        const uploadTask = uploadBytesResumable(storageRef, videoFile);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          }, 
          (error) => {
            console.error("Yükleme hatası:", error);
            alert("Video yüklenirken bir hata oluştu. Firebase Storage kuralları (Rules) veya CORS ayarları eksik olabilir. Lütfen URL ile ekleme yöntemini deneyin.");
            setLoading(false);
          }, 
          async () => {
            // 2. Yükleme tamamlanınca Download URL'i al
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // 3. Veritabanına kaydet
            await addDoc(collection(db, "egitimler"), {
              baslik,
              sure,
              videoUrl: downloadURL,
              izlenme: 0,
              olusturulmaTarihi: serverTimestamp()
            });
            
            // 4. E-posta Gönderimi
            if (epostaBildirim) {
              await handleEpostaGonderim(baslik);
            }

            alert("Eğitim başarıyla yüklendi, eklendi ve bildirimler gönderildi!");
            router.push("/admin/egitimler");
          }
        );
      } else {
        // Doğrudan URL ile kaydet
        await addDoc(collection(db, "egitimler"), {
          baslik,
          sure,
          videoUrl: videoUrlInput,
          izlenme: 0,
          olusturulmaTarihi: serverTimestamp()
        });
        
        // E-posta Gönderimi
        if (epostaBildirim) {
          await handleEpostaGonderim(baslik);
        }

        alert("Eğitim başarıyla eklendi ve bildirimler gönderildi!");
        router.push("/admin/egitimler");
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Eğitim eklenirken bir hata oluştu.");
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

            {/* Yükleme Tipi Seçimi */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Video Yükleme Yöntemi</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setYuklemeTipi("dosya")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${yuklemeTipi === "dosya" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Bilgisayardan Dosya Yükle
                </button>
                <button
                  type="button"
                  onClick={() => setYuklemeTipi("url")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${yuklemeTipi === "url" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Doğrudan Link (URL) Gir
                </button>
              </div>
            </div>

            {/* Dosya Yükleme Alanı */}
            {yuklemeTipi === "dosya" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    required={yuklemeTipi === "dosya"}
                    accept="video/mp4"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVideoFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  {videoFile ? (
                    <p className="text-sm font-medium text-indigo-600">{videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                  ) : (
                    <p className="text-sm text-slate-500">Tıklayın veya bilgisayarınızdan MP4 dosyasını buraya sürükleyin</p>
                  )}
                </div>
                {loading && (
                  <div className="pt-4">
                    <div className="flex justify-between text-xs font-semibold text-indigo-600 mb-1">
                      <span>Sunucuya Yükleniyor... Lütfen sayfayı kapatmayın.</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* URL Giriş Alanı */}
            {yuklemeTipi === "url" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Video Bağlantısı (MP4 URL)</label>
                <input
                  type="url"
                  required={yuklemeTipi === "url"}
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://firebasestorage.googleapis.com/.../video.mp4"
                />
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  İpucu: Videonuzu doğrudan <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Firebase Console</a> üzerinden Storage bölümüne yükleyip, oradan kopyaladığınız indirme linkini (Download URL) buraya yapıştırabilirsiniz.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="epostaBildirim"
                checked={epostaBildirim}
                onChange={(e) => setEpostaBildirim(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="epostaBildirim" className="text-sm font-medium text-slate-700">
                Tüm personellere eğitim atandığına dair otomatik e-posta gönder
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  "Eğitimi Kaydet"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
