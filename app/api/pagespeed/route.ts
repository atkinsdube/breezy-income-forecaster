import { NextRequest, NextResponse } from 'next/server';
import { fetchPageSpeedSignals } from '@/lib/external/pagespeed';

export async function POST(req: NextRequest) {
  try {
    const { websiteUrl } = await req.json();
    const data = await fetchPageSpeedSignals(websiteUrl);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to fetch PageSpeed signals.' }, { status: 400 });
  }
}
