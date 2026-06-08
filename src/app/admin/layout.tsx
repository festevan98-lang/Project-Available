import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-ink-700/40 [padding-top:env(safe-area-inset-top)] bg-ink-950">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <a
            href="/"
            aria-label="FEREST Development home"
            className="-m-2 p-2 inline-flex items-center rounded-sm"
          >
            <Image
              src="/ferest-logo.png"
              alt="FEREST Development"
              width={64}
              height={64}
              priority
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
            />
          </a>
          <nav className="flex items-center gap-1 text-sm sm:text-base">
            <a
              href="/projects"
              className="px-3 py-2 min-h-[44px] inline-flex items-center text-ink-200 hover:text-brass-400 transition rounded-sm"
            >
              Public site
            </a>
            <a
              href="/admin/lots/laguna-heights"
              className="px-3 py-2 min-h-[44px] inline-flex items-center text-ink-200 hover:text-brass-400 transition rounded-sm"
            >
              Lots
            </a>
            <a
              href="/admin/dxf-studio"
              className="px-3 py-2 min-h-[44px] inline-flex items-center text-ink-200 hover:text-brass-400 transition rounded-sm"
            >
              DXF Studio
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-16 sm:mt-24 border-t border-ink-700/40 [padding-bottom:env(safe-area-inset-bottom)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-6 sm:py-8 text-sm text-ink-300 flex flex-col sm:flex-row sm:justify-between gap-3">
          <span>FEREST Development Services · Admin</span>
          <span className="text-ink-400">Engineered in-house. Built in the field.</span>
        </div>
      </footer>
    </>
  );
}
