/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import React from "react";

export default function EgitimAtaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  
  const [egitimBaslik, setEgitimBaslik] = useState("");
  const [personeller, setPersoneller] = useState<any[]>([]);
  const [atananTcList, setAtananTcList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Eğitimi getir
        const egitimDoc = await getDoc(doc(db, "egitimler", id));
        if (egitimDoc.exists()) {
          setEgitimBaslik(egitimDoc.data().baslik || "İsimsiz Eğitim");
          setAtananTcList(egitimDoc.data().atananPersoneller || []);
        } else {
          alert("Eğitim bulunamadı!");
          router.push("/admin/egitimler");
          return;
        }

        // 2. Tüm personelleri getir
        const pSnap = await getDocs(collection(db, "personeller"));
        const pList: any[] = [];
        pSnap.forEach(doc => {
          const data = doc.data();
          if (data.tcNo) {
            pList.push({ id: doc.id, ...data });
          }
        });
        
        // İsme göre sırala
        pList.sort((a, b) => (a.ad || "").localeCompare(b.ad || ""));
        setPersoneller(pList);
        
      } catch (err) {
        console.error("Veri çekilirken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleCheckboxChange = (tcNo: string) => {
    setAtananTcList(prev => 
      prev.includes(tcNo) 
        ? prev.filter(tc => tc !== tcNo) 
        : [...prev, tcNo]
    );
  };

  const handleTumunuSec = () => {
    if (atananTcList.length === personeller.length) {
      setAtananTcList([]);
    } else {
      setAtananTcList(personeller.map(p => p.tcNo));
    }
  };

  const handleKaydet = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "egitimler", id), {
        atananPersoneller: atananTcList
      });
      alert("Atamalar başarıyla kaydedildi.");
      router.push("/admin/egitimler");
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      alert("Atamalar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;
  }

  const allSelected = atananTcList.length === personeller.length && personeller.length > 0;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Eğitim Ata: {egitimBaslik}</h1>
          <p className="text-slate-500 mt-1">Bu eğitimi almasını istediğiniz personelleri seçin.</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="text-slate-600 hover:text-slate-800 transition-colors px-4 py-2 border rounded-lg"
        >
          Geri Dön
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={allSelected}
              onChange={handleTumunuSec}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-700">Tümünü Seç ({atananTcList.length} / {personeller.length})</span>
          </div>
          <button 
            onClick={handleKaydet}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Kaydediliyor..." : "Atamaları Kaydet"}
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto p-4 space-y-2">
          {personeller.map(p => (
            <label key={p.tcNo} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-colors">
              <input 
                type="checkbox" 
                checked={atananTcList.includes(p.tcNo)}
                onChange={() => handleCheckboxChange(p.tcNo)}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-semibold text-slate-900">{p.ad} {p.soyad}</div>
                <div className="text-sm text-slate-500">TC: {p.tcNo} {p.gorevi ? `• Görev: ${p.gorevi}` : ''}</div>
              </div>
            </label>
          ))}
          {personeller.length === 0 && (
            <div className="text-center py-8 text-slate-500">Sistemde kayıtlı personel bulunmuyor.</div>
          )}
        </div>
      </div>
    </div>
  );
}
