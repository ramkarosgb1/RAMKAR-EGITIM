import { azTehlikeliCurriculum, curriculumMinutes } from "@/lib/isgCurriculum";
export default function MufredatPage() {
  return <main className="mx-auto max-w-5xl p-8 space-y-6">
    <header><h1 className="text-3xl font-bold">Az Tehlikeli İSG – Müfredat Taslağı</h1>
    <p className="mt-2 text-slate-600">Toplam {curriculumMinutes} dakika / 8 saat. Ders süreleri ve konu kapsamı mevzuat ve onaylı çizelgeyle doğrulanmadan yayınlanmamalıdır.</p></header>
    <div className="grid gap-4">{azTehlikeliCurriculum.map((lesson, index) =>
      <section key={lesson.id} className="rounded-xl border bg-white p-5">
        <div className="flex justify-between gap-4"><h2 className="font-semibold">{index + 1}. {lesson.title}</h2><span className="shrink-0">{lesson.minutes} dk</span></div>
        <p className="mt-2 text-sm text-slate-600">Hedef: {lesson.objectives.join("; ")}</p>
      </section>)}</div>
    <p className="text-sm text-amber-800">Bu sayfa içerik planıdır; video, sınav, devam kaydı veya geçerli sertifika oluşturmaz.</p>
  </main>;
}
