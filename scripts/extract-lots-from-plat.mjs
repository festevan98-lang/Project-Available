import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';

const [, , pdfPath, ...lotNumbers] = process.argv;
if (!pdfPath || !lotNumbers.length) {
  console.error('usage: node extract-lots-from-plat.mjs <pdf> <lot1> <lot2> ...');
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY not set');
  process.exit(1);
}

const buffer = readFileSync(pdfPath);
console.log(`PDF: ${pdfPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
console.log(`Lots requested: ${lotNumbers.join(', ')}`);

const anthropic = new Anthropic({ apiKey });

const systemPrompt = `You are reading a recorded subdivision plat. Extract dimensions and any visible info for specific lot numbers the user names. Return STRICT JSON ONLY with no preamble or code fences.

Schema:
{
  "subdivisionName": "string",
  "totalLots": <int or null>,
  "lots": [
    { "lot_number": "string", "sqft": <int or null>, "dimensions": "string or null", "block": "string or null", "phase": "string or null", "notes": "string or null" }
  ],
  "platReference": "Vol/Pg or null",
  "engineerOfRecord": "string or null"
}

If you cannot find a specific lot, include it with sqft=null and notes='not found'.`;

const userMsg = `Find these lots in this plat and report their sqft, dimensions, block, and phase: ${lotNumbers.join(', ')}.`;

console.log('\nSending PDF to Claude Sonnet 4.6...\n');

const resp = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 3000,
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
if (!text || text.type !== 'text') {
  console.error('No text response');
  process.exit(1);
}

let raw = text.text.trim();
raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

try {
  const parsed = JSON.parse(raw);
  console.log(JSON.stringify(parsed, null, 2));
} catch {
  console.log('--- RAW ---');
  console.log(raw);
}
