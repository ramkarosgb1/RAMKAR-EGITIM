"use client";

import React, { useState, useRef, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface StrictVideoPlayerProps {
  src: string;
  egitimId: string;
  tcNo: string; // To track user progress
  onComplete: () => void;
}

export default function StrictVideoPlayer({ src, egitimId, tcNo, onComplete }: StrictVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Firebase Log Key
  const logDocId = `${egitimId}_${tcNo}`;

  // 1. Firebase'den önceki kayıtları getir
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const docRef = doc(db, "egitim_loglari", logDocId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.maxWatchedTime) {
            setMaxWatchedTime(data.maxWatchedTime);
            // Videoyu kullanıcının kaldığı yere sarıyoruz
            if (videoRef.current) {
              videoRef.current.currentTime = data.maxWatchedTime;
            }
          }
        }
      } catch (error) {
        console.error("Progress çekilemedi", error);
      } finally {
        setIsReady(true);
      }
    };
    if (tcNo) fetchProgress();
    else setIsReady(true);
  }, [egitimId, tcNo, logDocId]);

  // 2. Sekme Odağı Kontrolü (Anti-Cheat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        setIsBlurred(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 3. Progress Kaydetme (Her 10 saniyede bir Firebase'e yaz)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPlaying && maxWatchedTime > 0) {
        try {
          await setDoc(doc(db, "egitim_loglari", logDocId), {
            egitimId,
            tcNo,
            maxWatchedTime,
            tamamlamaOrani: duration > 0 ? (maxWatchedTime / duration) * 100 : 0,
            sonGiris: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error("Log kaydedilemedi", err);
        }
      }
    }, 10000); // 10 saniyede bir

    return () => clearInterval(interval);
  }, [isPlaying, maxWatchedTime, duration, egitimId, tcNo, logDocId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // İleri sarmayı engelle
    if (current > maxWatchedTime + 2) { // 2 saniyelik tolerans
      videoRef.current.currentTime = maxWatchedTime;
    } else {
      setMaxWatchedTime(Math.max(current, maxWatchedTime));
    }

    // Checkpoint (Örn: Videonun tam ortasında (%50))
    if (duration > 0 && current > duration * 0.5 && current < (duration * 0.5) + 1 && !showCheckpoint) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowCheckpoint(true);
      // Bir kez gösterdikten sonra tekrar göstermemek için checkpoint süresini geçirtiyoruz
      videoRef.current.currentTime = current + 1; 
      setMaxWatchedTime(current + 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    // Sadece izlenmiş kısımlara dönmeye izin ver
    if (targetTime <= maxWatchedTime) {
      if (videoRef.current) {
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isReady) {
    return <div className="aspect-video bg-black flex items-center justify-center text-white">Yükleniyor...</div>;
  }

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-video flex flex-col">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          // Tamamlandığını logla
          setDoc(doc(db, "egitim_loglari", logDocId), {
            tamamlandi: true,
            tamamlamaTarihi: new Date().toISOString()
          }, { merge: true });
          onComplete();
        }}
        // Standard controls DİSABLED
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      />

      {/* Özel Kontrol Çubuğu */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex flex-col gap-2 transition-opacity duration-300">
        <div className="flex items-center gap-4 text-white">
          <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-medium w-10 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-2 bg-slate-700 rounded-full overflow-hidden group cursor-pointer">
              {/* Max Watched Progress (Kullanıcının gidebileceği sınır) */}
              <div 
                className="absolute top-0 left-0 h-full bg-slate-500 opacity-50 pointer-events-none"
                style={{ width: `${(maxWatchedTime / duration) * 100}%` }}
              />
              {/* Current Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 pointer-events-none"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              {/* Seek Input (Gizli, sadece event yakalamak için) */}
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={currentTime}
                onChange={handleSeek}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs font-medium w-10">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Blur Uyarısı Overlay */}
      {isBlurred && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-yellow-500 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
          </svg>
          <h3 className="text-2xl font-bold text-white mb-2">Eğitim Duraklatıldı</h3>
          <p className="text-slate-300">
            Yönetmelik gereği eğitim arka planda veya başka bir sekmede devam edemez.
            <br /> Lütfen izlemeye devam etmek için ekrana dönün ve Oynat butonuna basın.
          </p>
        </div>
      )}

      {/* Ara Soru / Pop-up Overlay */}
      {showCheckpoint && !isBlurred && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-2xl border border-blue-500/30 shadow-2xl text-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Burada mısınız?</h3>
            <p className="text-slate-400 text-sm mb-6">Eğitimin sayılması için aktif olarak ekranda olmanız gerekmektedir.</p>
            <button 
              onClick={() => {
                setShowCheckpoint(false);
                videoRef.current?.play();
                setIsPlaying(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Dinlemeye Devam Et
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
