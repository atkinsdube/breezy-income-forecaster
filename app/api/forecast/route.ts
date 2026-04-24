import { NextRequest, NextResponse } from 'next/server';
import { forecastInputSchema } from '@/lib/schema';
import { buildBenchmarkProfile } from '@/lib/benchmark';
import { runForecast } from '@/lib/forecast';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = forecastInputSchema.parse(body);

    const benchmark = await buildBenchmarkProfile(input);
    const forecast = runForecast(input, benchmark);

    return NextResponse.json({ benchmark, forecast });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to generate forecast.' }, { status: 400 });
  }
}
