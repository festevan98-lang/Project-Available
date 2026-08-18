import type { Metadata, Viewport } from 'next';
import { Anton, Oswald } from 'next/font/google';
import './globals.css';

// Display + all numbers: Anton, all-caps. Everything else: Oswald 400/600/700.
const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FEREST — Raw Land · Rooftops · Revenue',
  description:
    'Own the lot. Build the home. Lots and build packages in the Rio Grande Valley, platted, entitled, and engineered in-house by FEREST with M2 Engineering.',
};

export const viewport: Viewport = {
  themeColor: '#F4F1E8',
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
    <html lang="en" className={`${anton.variable} ${oswald.variable}`}>
      <body className="bg-paper text-ink font-sans antialiased min-h-[100dvh]">
        {children}
      </body>
    </html>
  );
}
