import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const projectId = process.argv[3];
const out = process.argv[4];
if (!projectId || !out) {
  console.error('usage: generate-lots-sql.mjs <lots.json> <projectId> <out.sql>');
  process.exit(1);
}

const escape = (s) => s.replace(/'/g, "''");

const inserts = data.lots.map((l) =>
  `('${projectId}', '${escape(l.lot_number)}', 'available', ${l.size_sqft || 'NULL'}, '${escape(l.polygon_points)}')`
).join(',\n');

const sql = `-- Replace placeholder lots for Laguna Heights with extracted polygons from DXF
DELETE FROM public.lots WHERE project_id = '${projectId}';

INSERT INTO public.lots (project_id, lot_number, status, size_sqft, polygon_points) VALUES
${inserts};

UPDATE public.projects
SET plat_image_url = '/plats/laguna-heights-plat.svg',
    plat_image_width = ${data.viewport.width},
    plat_image_height = ${data.viewport.height},
    total_lots = ${data.lots.length}
WHERE id = '${projectId}';
`;

writeFileSync(out, sql);
console.log(`Wrote ${out} with ${data.lots.length} lot inserts`);
