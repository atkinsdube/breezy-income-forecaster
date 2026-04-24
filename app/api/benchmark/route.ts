import { NextRequest, NextResponse } from 'next/server';
import { forecastInputSchema } from '@/lib/schema';
import { buildBenchmarkProfile } from '@/lib/benchmark';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = forecastInputSchema.parse(body);
    const benchmark = await buildBenchmarkProfile(input);
    return NextResponse.json(benchmark);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to build benchmark.' }, { status: 400 });
  }
}
