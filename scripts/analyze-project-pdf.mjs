import { readFileSync, statSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';

const [, , pdfPath, projectLabel] = process.argv;
if (!pdfPath || !projectLabel) {
  console.error('usage: node analyze-project-pdf.mjs <pdf> "<project label>"');
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1); }

const stat = statSync(pdfPath);
console.log(`\n=== ${projectLabel} ===`);
console.log(`PDF: ${pdfPath.replace(/^.*\\/, '')} (${(stat.size / 1024).toFixed(0)} KB)`);

const buffer = readFileSync(pdfPath);
const anthropic = new Anthropic({ apiKey });

const systemPrompt = `You are extracting marketing-card info for a real estate / land development project from any PDF (boundary survey, design layout, marketing package, plat, etc.).

Return STRICT JSON ONLY (no preamble, no code fences) with this schema:
{
  "projectName": "string or null",
  "location": "intersection + city, or as labeled",
  "acreage": "string with units, e.g. '22.07 acres' or null",
  "lotCount": <int or null>,
  "unitCount": <int or null>,
  "unitType": "single-family / duplex / townhome / mixed / commercial / null",
  "stage": "Raw / Boundary surveyed / Feasibility / Design / Engineering / Entitled / Platted / Under Construction / For Sale / null",
  "zoning": "string or null",
  "askingPrice": "string with format, e.g. '$1.25M', '$X/sf', or null",
  "engineerOfRecord": "string or null",
  "ownerOrApplicant": "string or null",
  "platReference": "Vol/Pg or null",
  "keyFeatures": ["max 5 short bullets"],
  "twoSentencePitch": "marketing-grade 2-sentence pitch for a buyer or investor card",
  "confidence": "high | medium | low",
  "confidenceNote": "why this confidence level"
}

NEVER invent numbers not visible in the PDF. If a field isn't clear, return null.
Plain ASCII only. No fancy quotes.`;

const userMsg = `Extract marketing-card info for project "${projectLabel}". Return only the JSON.`;

console.log('Calling Claude Sonnet 4.6...');

const resp = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2000,
  system: systemPrompt,
  messages: [{
    role: 'user',
    content: [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') } },
      { type: 'text', text: userMsg },
    ],
  }],
});

const text = resp.content.find(c => c.type === 'text');
if (!text || text.type !== 'text') { console.error('no text response'); process.exit(1); }
let raw = text.text.trim();
raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

try {
  console.log(JSON.stringify(JSON.parse(raw), null, 2));
} catch {
  console.log('--- RAW ---');
  console.log(raw);
}
