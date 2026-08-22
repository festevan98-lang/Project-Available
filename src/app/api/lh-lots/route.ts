import { NextResponse } from 'next/server';
import { fetchLagunaHeights } from '@/lib/clickplat';

export const revalidate = 600;

export async function GET() {
  const data = await fetchLagunaHeights();
  if (!data) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  // The grid views do not need polygons; strip them to keep the payload light.
  const { lots, ...rest } = data;
  return NextResponse.json({
    ok: true,
    ...rest,
    lots: lots.map(({ n, sqft, price, status }) => ({ n, sqft, price, status })),
  });
}
