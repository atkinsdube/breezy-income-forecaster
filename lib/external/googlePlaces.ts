export async function fetchGooglePlaceSignals(businessName?: string, city?: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || !businessName || !city) {
    return { rating: null, reviewCount: null };
  }

  try {
    const textQuery = encodeURIComponent(`${businessName} ${city}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${textQuery}&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const first = data.results?.[0];

    if (!first) return { rating: null, reviewCount: null };

    return {
      rating: first.rating ?? null,
      reviewCount: first.user_ratings_total ?? null,
    };
  } catch {
    return { rating: null, reviewCount: null };
  }
}
