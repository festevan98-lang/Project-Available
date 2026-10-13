import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FEREST · Opciones en Texas',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export default function OfferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
