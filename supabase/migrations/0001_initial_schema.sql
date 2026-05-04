-- Ferest Active Projects — initial schema

create type project_tier as enum ('teaser', 'lot_inventory', 'spec_home');

create type pipeline_stage as enum (
  'entitled',
  'bidding',
  'under_construction',
  'lots_available',
  'sold_out'
);

create type lot_status as enum (
  'available',
  'reserved',
  'under_contract',
  'sold'
);

create type lead_intent as enum (
  'buyer',
  'builder',
  'investor',
  'unspecified'
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tier project_tier not null default 'lot_inventory',
  city text not null,
  state text not null default 'TX',
  hero_image_url text,
  plat_image_url text,
  plat_image_width integer,
  plat_image_height integer,
  headline text,
  description text,
  pipeline_stage pipeline_stage not null default 'entitled',
  total_lots integer,
  phase text,
  price_range_low integer,
  price_range_high integer,
  amenities text[] default '{}',
  engineering_highlights text[] default '{}',
  interest_form_enabled boolean default true,
  display_order integer default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table lots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  lot_number text not null,
  phase text,
  status lot_status not null default 'available',
  size_sqft integer,
  price integer,
  -- SVG polygon points relative to plat_image_width/height.
  -- Format: "x1,y1 x2,y2 x3,y3 ..."
  polygon_points text not null,
  notes text,
  updated_at timestamptz default now(),
  unique (project_id, lot_number)
);

create index lots_project_status_idx on lots (project_id, status);

create table lot_interest (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  lot_id uuid references lots(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  intent lead_intent default 'unspecified',
  notes text,
  source text default 'web',
  created_at timestamptz default now()
);

create index lot_interest_project_created_idx on lot_interest (project_id, created_at desc);

-- RLS
alter table projects enable row level security;
alter table lots enable row level security;
alter table lot_interest enable row level security;

create policy "Public can read published projects"
  on projects for select using (is_published = true);

create policy "Public can read lots of published projects"
  on lots for select using (
    exists (
      select 1 from projects
      where projects.id = lots.project_id and projects.is_published = true
    )
  );

create policy "Public can submit interest"
  on lot_interest for insert with check (true);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger lots_updated_at
  before update on lots
  for each row execute function set_updated_at();
