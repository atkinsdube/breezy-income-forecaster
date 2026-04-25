import { fetchBlsMarketPrior } from '@/lib/external/bls';
import { fetchCompetitionIndex, fetchLocalMarketStrength } from '@/lib/external/census';
import { fetchGooglePlaceSignals } from '@/lib/external/googlePlaces';
import { fetchPageSpeedSignals } from '@/lib/external/pagespeed';
import { fetchMarketTrend } from '@/lib/external/trends';
import { clamp, reviewFactor, websiteFactor } from '@/lib/scoring';
import { getSeasonalMultiplier, getPeakMonthName, getMonthName } from '@/lib/seasonality';
import { getGeoAnnualScale } from '@/lib/geography';
import type { BenchmarkProfile, ForecastInput } from '@/lib/types';

export async function buildBenchmarkProfile(input: ForecastInput): Promise<BenchmarkProfile> {
  const [
    baseMarketPrior,
    competitionIndexRaw,
    marketStrengthRaw,
    placeSignals,
    pageSignals,
    trend,
  ] = await Promise.all([
    fetchBlsMarketPrior(input.serviceType, input.state),
    fetchCompetitionIndex(input.serviceType, input.city, input.state),
    fetchLocalMarketStrength(input.city, input.state),
    fetchGooglePlaceSignals(input.businessName, input.city),
    fetchPageSpeedSignals(input.websiteUrl),
    fetchMarketTrend(input.serviceType),
  ]);

  const currentMonth      = new Date().getMonth();
  const seasonalMultiplier = getSeasonalMultiplier(input.serviceType, currentMonth, input.state);
  const geoScale           = getGeoAnnualScale(input.serviceType, input.state);
  const totalSeasonalFactor = seasonalMultiplier * geoScale;

  // Adjust the annual-average prior for this month and this location
  const marketMonthlyPrior = baseMarketPrior * totalSeasonalFactor;

  const reviewRatingUsed = placeSignals.rating  ?? input.reviewRating;
  const reviewCountUsed  = placeSignals.reviewCount ?? input.reviewCount;
  const pagespeedScore   = pageSignals.pagespeedScore ?? null;

  const competitionIndex = clamp(competitionIndexRaw, 0, 1);
  const marketStrength   = clamp(marketStrengthRaw, 0, 1);
  const digitalStrength  = clamp(
    (reviewFactor(reviewRatingUsed, reviewCountUsed) - 0.9) * websiteFactor(pagespeedScore),
    0.75,
    1.35,
  );

  return {
    marketMonthlyPrior,
    competitionIndex,
    digitalStrength,
    marketStrength,
    reviewRatingUsed,
    reviewCountUsed,
    pagespeedScore,
    seasonalMultiplier,
    geoScale,
    totalSeasonalFactor,
    peakMonthName: getPeakMonthName(input.serviceType, input.state),
    forecastMonthName: getMonthName(currentMonth),
    forecastMonth: currentMonth,
    trend,
  };
}
