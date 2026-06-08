import type { Metadata, Viewport } from 'next';
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
  title: 'FEREST — Raw Land · Rooftops · Revenue',
  description:
    'Lots, build options, and financing in the Rio Grande Valley. Engineered, platted, and entitled in-house by FEREST.',
};

export const viewport: Viewport = {
  themeColor: '#0a0b09',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-ink-950 text-ink-50 antialiased min-h-[100dvh]">
        {children}
      </body>
    </html>
  );
}
