"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { azTehlikeliCurriculum } from "@/lib/isgCurriculum";
import { sampleQuestions } from "@/lib/isgContent";

export default function DenemeSinavi() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = useMemo(() => sampleQuestions.reduce((total, question) =>
    total + (answers[question.id] === question.correctIndex ? 1 : 0), 0), [answers]);
  const completed = sampleQuestions.every(q => answers[q.id] !== undefined);

  return <main className="mx-auto max-w-3xl px-5 py-10 space-y-7">
    <header className="space-y-3">
      <Link href="/icerik-onizleme" className="text-blue-700 underline">İçerik önizlemesine dön</Link>
      <h1 className="text-3xl font-bold">İSG Deneme Sınavı</h1>
      <p className="text-slate-700">Az tehlikeli sınıf için {azTehlikeliCurriculum.length} dersin her birinden bir örnek soru. Sonuç yalnızca bu tarayıcı ekranında hesaplanır; hiçbir kişisel bilgi veya puan kaydedilmez.</p>
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950"><strong>Deneme sürümü:</strong> Resmî sınav, eğitim tamamlama kanıtı veya sertifika hakkı oluşturmaz.</p>
    </header>
    {sampleQuestions.map((q, index) => <fieldset key={q.id} disabled={submitted} className="rounded-xl border bg-white p-5 space-y-3">
      <legend className="px-2 font-semibold">{index + 1}. {q.question}</legend>
      {q.options.map((option, i) => <label key={i} className="flex gap-3 items-start cursor-pointer rounded-md p-2 hover:bg-slate-50">
        <input type="radio" name={q.id} value={i} checked={answers[q.id] === i} onChange={() => setAnswers(previous => ({...previous, [q.id]: i}))} className="mt-1" />
        <span>{String.fromCharCode(65 + i)}) {option}</span>
      </label>)}
      {submitted && <div className="rounded-lg bg-slate-100 p-3 text-sm">
        <strong>{answers[q.id] === q.correctIndex ? "Doğru" : "Yanlış"} — Doğru cevap: {String.fromCharCode(65 + q.correctIndex)}</strong>
        <p>{q.explanation}</p>
      </div>}
    </fieldset>)}
    {!submitted ? <button type="button" disabled={!completed} onClick={() => setSubmitted(true)} className="rounded-lg bg-indigo-700 px-6 py-3 text-white font-semibold disabled:opacity-40">Yanıtları değerlendir</button> :
    <div className="rounded-xl border bg-white p-6 space-y-3" role="status">
      <h2 className="text-2xl font-bold">Deneme sonucu: {score}/{sampleQuestions.length} (%{Math.round(score / sampleQuestions.length * 100)})</h2>
      <p>Bu puan sertifika veya resmî başarı sonucu değildir.</p>
      <button type="button" onClick={() => { setAnswers({}); setSubmitted(false); }} className="rounded-lg bg-slate-900 px-5 py-2 text-white">Yeniden dene</button>
    </div>}
  </main>;
}
