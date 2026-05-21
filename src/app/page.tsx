import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            OSGB Uzaktan Eğitim
          </h1>
          <p className="text-lg text-slate-600">
            Personel eğitimlerinizi tek bir merkezden yönetin, izleyin ve sertifikalandırın.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
          <Link 
            href="/portal"
            className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-500 transition-all group"
          >
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Çalışan Portali</h2>
            <p className="text-slate-500 text-sm">
              Eğitim videolarınızı izlemek ve sınavlara katılmak için giriş yapın.
            </p>
          </Link>

          <Link 
            href="/admin"
            className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:indigo-500 transition-all group"
          >
            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Uzman Girişi</h2>
            <p className="text-slate-500 text-sm">
              Eğitim modüllerini yönetmek ve raporlara erişmek için giriş yapın.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
