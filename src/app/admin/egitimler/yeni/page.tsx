"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export default function YeniEgitimPage() {
  const [baslik, setBaslik] = useState("");
  const [sure, setSure] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const handleKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      alert("Lütfen bir MP4 dosyası seçin.");
      return;
    }

    setLoading(true);

    try {
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
          alert("Video yüklenirken bir hata oluştu.");
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
          
          alert("Eğitim başarıyla yüklendi ve eklendi!");
          router.push("/admin/egitimler");
        }
      );
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Video Dosyası Seç (.mp4)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input
                  type="file"
                  required
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
            </div>

            {loading && (
              <div className="pt-2">
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

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? "Video Yükleniyor..." : "Eğitimi Kaydet ve Yükle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
