import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1); }
const anthropic = new Anthropic({ apiKey });

const DIR = 'C:/Users/Fernando/Desktop/DESKTOP CLAUDE WORK/FEREST Project Website/SUBDIVISION PROJECTS';
const FILES = [
  ['Las Cumbres', 'Las Cumbres Subdivision Plat.pdf'],
  ['Laguna Oaks Phase 1', 'Laguna Oaks Phase 1 - 3456633.pdf'],
  ['Laguna Oaks Phase 2', 'Laguna Oaks Phase 2 Sub. - 3457817.pdf'],
  ['Garden Path', 'Garden Path Subdivision Plat.pdf'],
  ['One Place Pecan', 'One Place Pecan Subdivision - Plat Sheet.pdf'],
];

const system = `You extract marketing-card facts from a recorded subdivision plat PDF.
Return STRICT JSON ONLY (no code fences) with schema:
{
  "subdivisionName": "string as printed on the plat, or null",
  "city": "city + state if shown, or county, or null",
  "totalLots": <int or null>,
  "acreage": "string with units e.g. '9.37 acres', or null",
  "unitCount": <int or null>,
  "unitType": "single-family / duplex / townhome / commercial / mixed / null",
  "platReference": "Volume/Page or document no. if shown, or null",
  "engineerOrSurveyor": "firm name + registration no. if shown, or null",
  "ownerOrDeveloper": "string or null",
  "confidence": "high | medium | low",
  "note": "one short sentence on what is or isn't legible"
}
NEVER invent numbers. If a field is not clearly legible, return null. Plain ASCII only.`;

async function analyze(label, file) {
  const buffer = readFileSync(`${DIR}/${file}`);
  const resp = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system,
    messages: [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') } },
        { type: 'text', text: `Extract facts for "${label}". Return only the JSON.` },
      ],
    }],
  });
  const t = resp.content.find((c) => c.type === 'text');
  let raw = (t && t.type === 'text' ? t.text : '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  let parsed;
  try { parsed = JSON.parse(raw); } catch { parsed = { RAW: raw }; }
  return { label, file, sizeKB: Math.round(buffer.length / 1024), ...parsed };
}

const results = await Promise.all(FILES.map(([l, f]) => analyze(l, f).catch((e) => ({ label: l, file: f, ERROR: String(e) }))));
console.log(JSON.stringify(results, null, 2));
