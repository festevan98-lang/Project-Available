import type { Metadata } from 'next';
import { fetchLagunaHeights } from '@/lib/clickplat';
import LagunaClient from './LagunaClient';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Laguna Heights - Live Lot Availability | FEREST Development',
  description:
    'Live availability for Laguna Heights in Mission, TX. See which lots are open today, then buy the lot or have FEREST build the home.',
};

export default async function LagunaHeightsPage() {
  const data = await fetchLagunaHeights();
  return <LagunaClient initial={data} />;
}
