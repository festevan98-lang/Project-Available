export type DxfPoint = { x: number; y: number };

export type DxfLine = {
  type: 'line';
  layer: string;
  a: DxfPoint;
  b: DxfPoint;
};

export type DxfPolyline = {
  type: 'polyline';
  layer: string;
  points: DxfPoint[];
  closed: boolean;
};

export type DxfArc = {
  type: 'arc';
  layer: string;
  cx: number;
  cy: number;
  r: number;
  startRad: number;
  endRad: number;
};

export type DxfCircle = {
  type: 'circle';
  layer: string;
  cx: number;
  cy: number;
  r: number;
};

export type DxfText = {
  type: 'text';
  layer: string;
  pos: DxfPoint;
  text: string;
  height: number;
};

export type DxfEntity = DxfLine | DxfPolyline | DxfArc | DxfCircle | DxfText;

export interface LayerSummary {
  name: string;
  count: number;
  color: string;
}

export interface DxfBBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ParsedDxf {
  entities: DxfEntity[];
  layers: LayerSummary[];
  bbox: DxfBBox;
  units: number;
  unitsLabel: string;
  unsupportedCounts: Record<string, number>;
  totalEntities: number;
}

export interface DxfFindings {
  drawingType:
    | 'subdivision_plat'
    | 'topographic_survey'
    | 'boundary_survey'
    | 'site_plan'
    | 'engineering_design'
    | 'unknown';
  summary: string;
  lotCount: number | null;
  totalAreaLabel: string | null;
  boundingBoxNotes: string;
  keyFindings: string[];
  verificationItems: string[];
  unitsConfidence: 'high' | 'low';
  unitsNote: string | null;
}

export interface DxfStudioResponse {
  parsed: ParsedDxf;
  findings: DxfFindings | null;
  errorDetail: string | null;
  filename: string;
}
