import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';

const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '600'], variable: '--lab-serif', display: 'swap' });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--lab-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Acceso privado',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${sans.variable}`}>{children}</div>;
}
