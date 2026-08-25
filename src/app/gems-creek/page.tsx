import type { Metadata } from 'next';
import GemsClient from './GemsClient';

export const metadata: Metadata = {
  title: 'Gems Creek - Lots From $65,000 | FEREST Development',
  description:
    'Gems Creek Subdivision in Alton, TX. 84 single-family lots and 3 commercial pads, under construction now. Lots from $65,000 - reserve with $1,000.',
};

export default function GemsCreekPage() {
  return <GemsClient />;
}
