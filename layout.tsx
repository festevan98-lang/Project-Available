import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ferest Development — Active Projects',
  description:
    'Engineered, platted, and entitled in-house. Active subdivisions and lots in the Rio Grande Valley.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-ink-950 text-ink-50 font-sans antialiased min-h-screen">
        <header className="border-b border-ink-700/40">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <a href="/" className="font-display text-xl tracking-tight">
              FEREST
              <span className="text-brass-400">.</span>
            </a>
            <nav className="text-sm text-ink-200 flex gap-6">
              <a href="/projects" className="hover:text-brass-400 transition">
                Projects
              </a>
              <a
                href="https://www.ferest.dev"
                className="hover:text-brass-400 transition"
              >
                Main site
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-ink-700/40">
          <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-ink-300 flex flex-col sm:flex-row justify-between gap-4">
            <span>
              FEREST Development Services · Rio Grande Valley, TX
            </span>
            <span className="text-ink-400">
              Engineered in-house. Built in the field.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
