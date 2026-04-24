import { NextRequest, NextResponse } from 'next/server';
import { fetchGooglePlaceSignals } from '@/lib/external/googlePlaces';

export async function POST(req: NextRequest) {
  try {
    const { businessName, city } = await req.json();
    const data = await fetchGooglePlaceSignals(businessName, city);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to fetch place signals.' }, { status: 400 });
  }
}
