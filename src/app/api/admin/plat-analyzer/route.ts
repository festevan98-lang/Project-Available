import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const MAX_BYTES = 30 * 1024 * 1024;

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a senior land development engineer reviewing a plat PDF for a Texas Licensed Professional Engineer (PE).

You receive a multi-page PDF of a plat, survey, or engineering drawing as input. Analyze the actual drawing content - the geometry, dimensions, labels, notes, title block.

Your job: extract structured information that helps a developer or PE evaluate the parcel quickly.

STRICT RULES:
- NEVER invent dimensions, lot counts, setbacks, or measurements not visible in the drawing.
- If a value is not clearly labeled in the plat, return null or an empty array.
- Plain ASCII only. No fancy quotes or non-ASCII characters.
- Engineering voice: direct, conservative. No marketing language.
- This output is informational. The Texas PE confirms everything on the consult.

Return STRICT JSON matching exactly this schema, no extra fields, no commentary:
{
  "platType": "recorded_plat" | "preliminary_plat" | "site_plan" | "survey" | "engineering_sheet" | "unknown",
  "summary": "2-3 sentence engineer's read",
  "subdivisionName": "string or null",
  "totalLotsLabeled": <integer or null>,
  "totalAcreageLabel": "string with units, e.g. '27.07 acres' or null",
  "scaleLabel": "string like '1\" = 60'' or null",
  "roadNames": ["array of road names as labeled, max 12"],
  "setbacks": ["e.g. 'Front: 25 ft', max 8"],
  "easements": ["e.g. '10 ft utility easement, both sides', max 8"],
  "utilities": ["e.g. 'PUE shown along rear lot lines', max 6"],
  "recordedReference": "e.g. 'Vol. 33, Pg. 14' or null",
  "engineerOfRecord": "engineering firm name from title block, or null",
  "lotsSampled": [
    { "lot_number": "string", "block": "string or null", "size_sqft": <integer or null>, "dimensions": "string or null", "notes": "string or null" }
  ],
  "keyFindings": ["max 6 short bullets - what stands out for a developer"],
  "verificationItems": ["max 4 bullets - things the PE should verify on the consult"],
  "confidence": "high" | "medium" | "low",
  "confidenceNote": "string or null - why confidence is what it is"
}

For lotsSampled: include up to 12 representative lots if labeled, otherwise empty. Do not invent lot numbers.

Return ONLY the JSON object. No code fences. No preamble.`;

function extractJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  return s;
}

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not read upload', errorDetail: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Attach a PDF under the "file" field' }, { status: 400 });
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith('.pdf')) {
    return NextResponse.json({ error: 'Expected a .pdf file' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      { error: `PDF is ${mb} MB. Trim it below 30 MB or export only the plat sheet.` },
      { status: 413 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      filename: file.name,
      fileSize: file.size,
      pages: 0,
      findings: null,
      errorDetail: 'ANTHROPIC_API_KEY is not set on the server. Add it to .env.local (and Vercel env vars) and retry.',
    });
  }

  let buffer: Buffer;
  try {
    const arr = await file.arrayBuffer();
    buffer = Buffer.from(arr);
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not read file body', errorDetail: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
  const base64 = buffer.toString('base64');

  let findings = null;
  let errorDetail: string | null = null;
  try {
    const anthropic = new Anthropic({ apiKey });
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            { type: 'text', text: 'Analyze this plat per the instructions. Return only the JSON.' },
          ],
        },
      ],
    });
    const block = resp.content.find((c) => c.type === 'text');
    if (block && block.type === 'text') {
      const json = extractJson(block.text);
      findings = JSON.parse(json);
    } else {
      errorDetail = 'Model returned no text block.';
    }
  } catch (err: unknown) {
    const e = err as {
      status?: number;
      message?: string;
      error?: { error?: { message?: string; type?: string }; message?: string };
    };
    const parts: string[] = [];
    if (e.status) parts.push(`HTTP ${e.status}`);
    const innerType = e.error?.error?.type;
    if (innerType) parts.push(innerType);
    const innerMsg = e.error?.error?.message ?? e.error?.message ?? e.message ?? String(err);
    parts.push(innerMsg);
    errorDetail = parts.filter(Boolean).join(' - ');
  }

  return NextResponse.json({
    filename: file.name,
    fileSize: file.size,
    pages: 0,
    findings,
    errorDetail,
  });
}
