import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { parseDxf, buildAnalysisDigest } from '@/lib/dxf/parser';

const MAX_BYTES = 25 * 1024 * 1024;

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a senior land development engineer reviewing a CAD drawing for a Texas Licensed Professional Engineer (PE).

The user uploaded a DXF and you receive a STRUCTURE DIGEST: entity counts, layer breakdown, bounding box, and sampled text labels. You do NOT see raw coordinates.

Your job: classify what the drawing represents and give the engineer's read of it.

STRICT RULES:
- NEVER invent dimensions, lot counts, or measurements absent from the digest. If the digest does not state a number, you do not know it.
- Plain ASCII only. No fancy quotes, em-dashes, smart punctuation, or non-ASCII characters.
- Engineering voice: direct, conservative, precise. No marketing language. No verdicts ("good deal", "best case", "kills the deal", "great opportunity").
- This output is informational only. The Texas PE confirms everything on the consult.
- If the layers/labels suggest a specific drawing type, classify confidently. If they do not, return "unknown" and say why in summary.
- Flag anything that could not be rendered (splines, hatches, dimension blocks, inserts) as a verification item.
- For unitsConfidence: "high" only when the DXF $INSUNITS value is set (1, 2, 4, 5, or 6) AND labels are consistent with that scale. Otherwise "low".

Return STRICT JSON matching exactly this schema, no extra fields, no commentary:
{
  "drawingType": "subdivision_plat" | "topographic_survey" | "boundary_survey" | "site_plan" | "engineering_design" | "unknown",
  "summary": "2-3 sentence engineer's read",
  "lotCount": <integer or null>,
  "totalAreaLabel": "string with units, e.g. '12.4 acres' or null",
  "boundingBoxNotes": "sanity check on labeled vs computed area, or short note if not enough info",
  "keyFindings": ["max 6 short bullets"],
  "verificationItems": ["max 4 bullets, things to verify on the consult"],
  "unitsConfidence": "high" | "low",
  "unitsNote": "string or null"
}

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
    return NextResponse.json(
      { error: 'Attach a .dxf file under the "file" field' },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      {
        error: `File is ${mb} MB. Slim the DXF below 25 MB before upload (purge unused blocks/layers, or export only the layers you need).`,
      },
      { status: 413 }
    );
  }

  let text: string;
  try {
    text = await file.text();
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not read file body', errorDetail: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  let parsed;
  try {
    parsed = parseDxf(text);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'DXF parse failed. Confirm this is a valid DXF (R12 through R2018 supported).',
        errorDetail: err instanceof Error ? err.message : String(err),
      },
      { status: 422 }
    );
  }

  const digest = buildAnalysisDigest(parsed);
  const filename = file.name;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      parsed,
      findings: null,
      filename,
      errorDetail: 'ANTHROPIC_API_KEY is not set on the server. Geometry rendered, AI analysis skipped. Add ANTHROPIC_API_KEY to .env.local and restart.',
    });
  }

  let findings = null;
  let errorDetail: string | null = null;
  try {
    const anthropic = new Anthropic({ apiKey });
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: digest }],
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
    parsed,
    findings,
    filename,
    errorDetail,
  });
}
