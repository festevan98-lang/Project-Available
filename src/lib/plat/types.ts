export type PlatType =
  | 'recorded_plat'
  | 'preliminary_plat'
  | 'site_plan'
  | 'survey'
  | 'engineering_sheet'
  | 'unknown';

export interface PlatLotRow {
  lot_number: string;
  block?: string | null;
  size_sqft?: number | null;
  dimensions?: string | null;
  notes?: string | null;
}

export interface PlatFindings {
  platType: PlatType;
  summary: string;
  subdivisionName: string | null;
  totalLotsLabeled: number | null;
  totalAcreageLabel: string | null;
  scaleLabel: string | null;
  roadNames: string[];
  setbacks: string[];
  easements: string[];
  utilities: string[];
  recordedReference: string | null;
  engineerOfRecord: string | null;
  lotsSampled: PlatLotRow[];
  keyFindings: string[];
  verificationItems: string[];
  confidence: 'high' | 'medium' | 'low';
  confidenceNote: string | null;
}

export interface PlatStudioResponse {
  filename: string;
  pages: number;
  fileSize: number;
  findings: PlatFindings | null;
  errorDetail: string | null;
}
