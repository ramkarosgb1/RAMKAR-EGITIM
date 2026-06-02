"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, getDocs, query, collection, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StrictVideoPlayer from "@/components/StrictVideoPlayer";

export default function EgitimIzlePage() {
  const params = useParams();
  const router = useRouter();
  const [videoBitti, setVideoBitti] = useState(false);
  const [sinavBasladi, setSinavBasladi] = useState(false);
  const [sinavBitti, setSinavBitti] = useState(false);
  const [sinavPuan, setSinavPuan] = useState(0);
  const [egitim, setEgitim] = useState<{id: string; baslik?: string; videoUrl?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [tcNo, setTcNo] = useState("");

  useEffect(() => {
    // SessionStorage'dan aktif kullanıcıyı al
    const storedTc = sessionStorage.getItem("active_tcNo");
    if (!storedTc) {
      router.push("/portal/login");
      return;
    }
    setTcNo(storedTc);

    const fetchEgitim = async () => {
      try {
        const docRef = doc(db, "egitimler", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEgitim({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Eğitim bulunamadı!");
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEgitim();
  }, [params.id, router]);

  if (loading) {
    return <div className="p-8 text-center text-white bg-slate-900 min-h-[calc(100vh-64px)]">Eğitim yükleniyor...</div>;
  }

  if (!egitim) {
    return <div className="p-8 text-center text-white bg-slate-900 min-h-[calc(100vh-64px)]">Eğitim bulunamadı.</div>;
  }

  return (
    <div className="p-4 sm:p-8 bg-slate-900 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/portal/egitimler" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Eğitimlere Dön
          </Link>
          <h1 className="text-white font-semibold text-lg sm:text-xl truncate ml-4">{egitim.baslik}</h1>
        </div>

        {!sinavBasladi ? (
          <div className="space-y-4">
            
            {egitim.videoUrl?.includes("youtube.com") || egitim.videoUrl?.includes("youtu.be") ? (
              <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl border border-slate-800 flex flex-col relative">
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-md z-20 p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-500 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-white mb-2">Desteklenmeyen Video Formatı</h3>
                  <p className="text-slate-300">
                    İSG Uzaktan Eğitim Yönetmeliği gereğince YouTube videoları izleme ve loglama takibine uygun değildir.
                    <br /> Lütfen yöneticiye başvurarak bu eğitimin MP4 formatında sisteme yüklenmesini talep edin.
                  </p>
                </div>
              </div>
            ) : (
              !videoBitti ? (
                <StrictVideoPlayer 
                  src={egitim.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                  egitimId={egitim.id}
                  tcNo={tcNo}
                  onComplete={() => setVideoBitti(true)}
                />
              ) : (
                <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl border border-slate-800 flex flex-col relative">
                  <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center backdrop-blur-sm z-10">
                    <div className="text-center p-8 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-md">
                      <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Tebrikler!</h3>
                      <p className="text-slate-300 mb-6">Eğitim videosunu yönetmeliklere uygun şekilde tamamladınız. Şimdi değerlendirme sınavına geçebilirsiniz.</p>
                      <button 
                        onClick={() => setSinavBasladi(true)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-600/30"
                      >
                        Sınava Başla
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Test amaçlı her zaman görünür sınava geçiş butonu */}
            {!videoBitti && (
              <div className="flex justify-end">
                <button 
                  onClick={() => setSinavBasladi(true)}
                  className="text-sm font-medium text-slate-400 hover:text-white underline decoration-slate-600 transition-colors"
                >
                  (Geliştirici Testi) Videoyu Atla ve Sınava Geç
                </button>
              </div>
            )}
          </div>
        ) : !sinavBitti ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
             <div className="bg-blue-600 p-6 sm:p-8 text-white">
               <h2 className="text-2xl font-bold mb-2">Değerlendirme Sınavı</h2>
               <p className="text-blue-100">Lütfen tüm soruları dikkatlice okuyup cevaplayın. Yönetmelik gereği sınav sonuçlarınız kayıt altına alınacaktır.</p>
             </div>
             <div className="p-6 sm:p-8 space-y-8">
               <form onSubmit={async (e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 let score = 0;
                 // Örnek: Sadece 1 soru var, doğru cevap "112 Acil Çağrı Merkezi"
                 if (formData.get("q1") === "112 Acil Çağrı Merkezi") {
                   score = 100;
                 }
                 
                 // Sınav sonucunu logla
                 const logDocId = `${egitim.id}_${tcNo}`;
                 try {
                   await setDoc(doc(db, "egitim_loglari", logDocId), {
                     egitimId: egitim.id,
                     tcNo: tcNo,
                     sinavTamamlandi: true,
                     sinavSkoru: score,
                     basariDurumu: score >= 70 ? "Başarılı" : "Başarısız",
                     sinavTarihi: new Date().toISOString()
                   }, { merge: true });
                   
                   setSinavBitti(true);
                   setSinavPuan(score);
                 } catch (err) {
                   console.error("Sınav sonucu kaydedilemedi:", err);
                   alert("Sonuç kaydedilirken bir hata oluştu.");
                 }
               }}>
                 <div className="space-y-4">
                   <h4 className="font-semibold text-lg text-slate-900">1. İş yerinde acil bir durumda aranması gereken ilk numara hangisidir?</h4>
                   <div className="space-y-2">
                     {['112 Acil Çağrı Merkezi', '155 Polis İmdat', '110 İtfaiye', 'Kendi doktorum'].map((secenek, i) => (
                       <label key={i} className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                         <input type="radio" name="q1" value={secenek} required className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                         <span className="text-slate-700">{secenek}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 <div className="pt-6 border-t border-slate-200 flex justify-end">
                   <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-sm">
                     Sınavı Bitir ve Sonucu Kaydet
                   </button>
                 </div>
               </form>
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-12 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${sinavPuan >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {sinavPuan >= 70 ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                </svg>
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {sinavPuan >= 70 ? "Tebrikler, Başarılı Oldunuz!" : "Maalesef Başarısız Oldunuz."}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Sınav Skoru: <span className="font-bold text-slate-900">{sinavPuan} / 100</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/portal/egitimler" className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
                Eğitimlerime Dön
              </Link>
              
              {sinavPuan >= 70 && (
                <button 
                  onClick={() => {
                    import("@/lib/pdfGenerator").then(({ generateCertificate }) => {
                      // Fetch user details for the certificate
                      const fetchUserAndPrint = async () => {
                        const pQuery = await getDocs(query(collection(db, "personeller"), where("tcNo", "==", tcNo)));
                        let adSoyad = "Sayın Personel";
                        if (!pQuery.empty) {
                           const pData = pQuery.docs[0].data();
                           adSoyad = `${pData.ad || ''} ${pData.soyad || ''}`.trim();
                        }
                        generateCertificate({
                          adSoyad,
                          tcNo: tcNo,
                          egitimAdi: egitim.baslik || "Eğitim",
                          tarih: new Date().toLocaleDateString("tr-TR"),
                          puan: sinavPuan
                        });
                      };
                      fetchUserAndPrint();
                    });
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Sertifikamı İndir
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
