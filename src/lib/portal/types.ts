// Investor portal data shapes. The data itself lives in the private Vercel Blob
// store (portal/...), never in this repo.

export interface InvestorPosition {
  invested: number | null;
  status: string;
}

export interface Investor {
  id: string;
  name: string;
  role: 'owner' | 'investor';
  codeHash: string;
  projects: Record<string, InvestorPosition>;
}

export interface PortalFile {
  file: string;
  caption: string;
}

export interface PortalProject {
  slug: string;
  name: string;
  unit: string;
  subtitle: string;
  address: string;
  stage: string;
  updatedAt: string;
  hero: PortalFile;
  glance: { label: string; value: string }[];
  terms: {
    dealSize: number;
    prefRate: number;
    investorSplit: number;
    projectedInvestorProfit: number;
    summary: string;
    waterfall: string[];
  };
  budget: { item: string; budget: number; spent: number }[];
  projection: { label: string; value: number; strong?: boolean }[];
  milestones: { label: string; status: 'done' | 'current' | 'next'; date?: string }[];
  updates: { date: string; title: string; body: string }[];
  home: {
    plan: string;
    specs: [string, string][];
    features: string[];
    nearby: string;
    gallery: PortalFile[];
  };
  docs: { label: string; file: string | null; note?: string }[];
  risks: string[];
}
