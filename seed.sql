-- Seed projects. Replace plat images and polygon coordinates with real plats post-launch.

-- Laguna Oaks
insert into projects (
  slug, name, tier, city, state,
  hero_image_url, plat_image_url, plat_image_width, plat_image_height,
  headline, description, pipeline_stage,
  total_lots, phase, price_range_low, price_range_high,
  amenities, engineering_highlights,
  is_published, display_order
) values (
  'laguna-oaks',
  'Laguna Oaks',
  'lot_inventory',
  'Mission',
  'TX',
  '/plats/laguna-oaks-hero.jpg',
  '/plats/laguna-oaks-plat.jpg',
  1600,
  1200,
  'Established lots in Mission. Model home complete.',
  'Mission, TX subdivision with infrastructure in place and a model home on site. Lots platted, drainage approved, utilities stubbed.',
  'lots_available',
  12,
  'Phase 1',
  85000,
  120000,
  array['Paved streets', 'Curb and gutter', 'Underground utilities', 'Model home on site'],
  array[
    'Drainage designed and approved per Hidalgo County standards',
    'Water service confirmed via Agua SUD CCN',
    'FEMA flood zone X — outside the 100-year floodplain',
    'Plat recorded with Hidalgo County'
  ],
  true,
  1
);

-- Laguna Heights
insert into projects (
  slug, name, tier, city, state,
  hero_image_url, plat_image_url, plat_image_width, plat_image_height,
  headline, description, pipeline_stage,
  total_lots, phase, price_range_low, price_range_high,
  amenities, engineering_highlights,
  is_published, display_order
) values (
  'laguna-heights',
  'Laguna Heights',
  'lot_inventory',
  'Mission',
  'TX',
  '/plats/laguna-heights-hero.jpg',
  '/plats/laguna-heights-plat.jpg',
  1600,
  1200,
  '142 gated lots under construction. Pre-sale open.',
  '142-lot gated community in Mission, TX. Horizontal construction underway. Priority list open for buyers, builders, and investors.',
  'under_construction',
  142,
  'Phase 1',
  95000,
  145000,
  array['Gated entry', 'Paved streets', 'Curb and gutter', 'Underground utilities', 'Sidewalks'],
  array[
    'Master drainage plan engineered to Hidalgo County and TCEQ standards',
    'Water and sewer service via municipal extension',
    'Plat approved and recorded',
    'Entitlement complete — no zoning or permitting risk for buyers'
  ],
  true,
  2
);

-- Procedurally generate placeholder lots. Replace with real plat coordinates.
do $$
declare
  proj_id uuid;
  i int;
  row_n int;
  col_n int;
  x1 int; y1 int; x2 int; y2 int;
  cell_w int := 110;
  cell_h int := 90;
  margin int := 80;
  status_val lot_status;
begin
  -- Laguna Heights: 142 lots in a 12-wide grid
  select id into proj_id from projects where slug = 'laguna-heights';
  for i in 1..142 loop
    row_n := (i - 1) / 12;
    col_n := (i - 1) % 12;
    x1 := margin + col_n * cell_w;
    y1 := margin + row_n * cell_h;
    x2 := x1 + cell_w - 8;
    y2 := y1 + cell_h - 8;

    if i in (17, 34) then
      status_val := 'reserved';
    else
      status_val := 'available';
    end if;

    insert into lots (project_id, lot_number, phase, status, size_sqft, price, polygon_points)
    values (
      proj_id,
      'L' || lpad(i::text, 3, '0'),
      'Phase 1',
      status_val,
      6500 + (i % 7) * 250,
      95000 + (i % 11) * 4500,
      x1 || ',' || y1 || ' ' || x2 || ',' || y1 || ' ' || x2 || ',' || y2 || ' ' || x1 || ',' || y2
    );
  end loop;

  -- Laguna Oaks: 12 lots in a 4-wide grid
  select id into proj_id from projects where slug = 'laguna-oaks';
  for i in 1..12 loop
    row_n := (i - 1) / 4;
    col_n := (i - 1) % 4;
    x1 := 200 + col_n * 280;
    y1 := 200 + row_n * 240;
    x2 := x1 + 260;
    y2 := y1 + 220;

    insert into lots (project_id, lot_number, phase, status, size_sqft, price, polygon_points)
    values (
      proj_id,
      'L' || lpad(i::text, 2, '0'),
      'Phase 1',
      'available',
      8000 + (i % 5) * 400,
      85000 + (i % 8) * 4000,
      x1 || ',' || y1 || ' ' || x2 || ',' || y1 || ' ' || x2 || ',' || y2 || ' ' || x1 || ',' || y2
    );
  end loop;
end $$;
