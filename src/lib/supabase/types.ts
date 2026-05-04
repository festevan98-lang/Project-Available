export type ProjectTier = 'teaser' | 'lot_inventory' | 'spec_home';

export type PipelineStage =
  | 'entitled'
  | 'bidding'
  | 'under_construction'
  | 'lots_available'
  | 'sold_out';

export type LotStatus = 'available' | 'reserved' | 'under_contract' | 'sold';

export type LeadIntent = 'buyer' | 'builder' | 'investor' | 'unspecified';

export interface Project {
  id: string;
  slug: string;
  name: string;
  tier: ProjectTier;
  city: string;
  state: string;
  hero_image_url: string | null;
  plat_image_url: string | null;
  plat_image_width: number | null;
  plat_image_height: number | null;
  headline: string | null;
  description: string | null;
  pipeline_stage: PipelineStage;
  total_lots: number | null;
  phase: string | null;
  price_range_low: number | null;
  price_range_high: number | null;
  amenities: string[];
  engineering_highlights: string[];
  interest_form_enabled: boolean;
  display_order: number;
  is_published: boolean;
}

export interface Lot {
  id: string;
  project_id: string;
  lot_number: string;
  phase: string | null;
  status: LotStatus;
  size_sqft: number | null;
  price: number | null;
  polygon_points: string;
  notes: string | null;
}

export interface ProjectWithLots extends Project {
  lots: Lot[];
}
