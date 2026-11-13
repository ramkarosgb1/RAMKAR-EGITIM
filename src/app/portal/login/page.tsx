import Link from "next/link";

export default function PortalLogin() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-sm p-8 space-y-5">
        <h1 className="text-3xl font-bold text-slate-900">Çalışan Girişi</h1>
        <p className="text-slate-700">Güvenli kimlik doğrulama yapılandırılana kadar çalışan girişi geçici olarak kapalıdır.</p>
        <p className="text-sm text-slate-600">TC kimlik numarası tek başına bir kimlik doğrulama yöntemi değildir. Personel verilerinin korunması için doğrulanmış oturum ve yetki kontrolleri gereklidir.</p>
        <Link href="/" className="inline-block text-blue-700 underline">Ana sayfaya dön</Link>
      </section>
    </main>
  );
}
