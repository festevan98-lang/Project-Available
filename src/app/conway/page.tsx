import type { Metadata } from 'next';
import ConwayClient from './ConwayClient';

export const metadata: Metadata = {
  title: 'Conway Duplex Site - 48 Lots, $1.35M | FEREST Development',
  description:
    '9.15 acres on N Conway Avenue in Mission, TX. 48-lot duplex concept, feasibility complete, city sewer, no rezoning required. Asking $1,350,000 with short-term owner financing available.',
};

export default function ConwayPage() {
  return <ConwayClient />;
}
