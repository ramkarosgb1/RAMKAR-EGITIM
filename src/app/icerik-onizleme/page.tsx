import { azTehlikeliCurriculum, curriculumMinutes } from "@/lib/isgCurriculum";
import { sampleQuestions, videoProductionBriefs } from "@/lib/isgContent";

export const metadata = { title: "İSG Eğitim İçerik Taslakları | RAMKAR" };

export default function IcerikOnizleme() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Az Tehlikeli İSG — İçerik Önizlemesi</h1>
        <p className="text-slate-700">Toplam {curriculumMinutes} dakika / 8 saatlik <strong>taslak</strong> ders planı, video üretim yönergeleri ve örnek değerlendirme soruları.</p>
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">Bu sayfa gerçek eğitim, video izleme kaydı, sınav veya sertifika yerine geçmez. Ders başlıkları ve süreler, resmi çizelge ve güncel mevzuatla uzman tarafından doğrulanmalıdır. Personel verisi kullanılmaz.</p>
      </header>
      {azTehlikeliCurriculum.map((lesson, index) => {
        const brief = videoProductionBriefs.find(item => item.lessonId === lesson.id);
        const questions = sampleQuestions.filter(item => item.lessonId === lesson.id);
        return <section key={lesson.id} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-xl font-semibold">{index + 1}. {lesson.title} <span className="text-sm font-normal text-slate-600">({lesson.minutes} dk)</span></h2>
          <p className="text-slate-700">Hedefler: {lesson.objectives.join("; ")}</p>
          <details className="rounded-lg bg-slate-50 p-4">
            <summary className="cursor-pointer font-medium">Video üretim promptu ve bölüm planı</summary>
            <p className="mt-3 text-sm text-slate-600">Bölümler: {brief?.segmentMinutes.join(" + ")} dakika</p>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-800 font-sans">{brief?.narrationPrompt}</pre>
          </details>
          {questions.map(q => <details key={q.id} className="rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">Örnek soru: {q.question}</summary>
            <ol className="mt-3 list-[upper-alpha] pl-6 space-y-1 text-sm">{q.options.map(option => <li key={option}>{option}</li>)}</ol>
            <p className="mt-3 text-sm font-semibold">Doğru cevap: {String.fromCharCode(65 + q.correctIndex)}</p>
            <p className="text-sm text-slate-600">{q.explanation}</p>
          </details>)}
        </section>;
      })}
    </main>
  );
}
