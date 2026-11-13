import Link from "next/link";

export default function AdminLogin() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-900 flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl bg-slate-800 border border-slate-700 p-8 space-y-5">
        <h1 className="text-3xl font-bold text-white">Uzman Girişi</h1>
        <p className="text-slate-200">Yönetici erişimi, Firebase Authentication ve doğrulanmış yönetici yetkileri tamamlanana kadar geçici olarak kapalıdır.</p>
        <p className="text-sm text-slate-300">Önceki sabit şifre ve Firestore üzerinde düz metin şifre sorgulama yöntemi güvenli olmadığı için kaldırıldı.</p>
        <Link href="/" className="inline-block text-indigo-200 underline">Ana sayfaya dön</Link>
      </section>
    </main>
  );
}
