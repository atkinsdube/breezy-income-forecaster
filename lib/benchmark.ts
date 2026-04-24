import { fetchBlsMarketPrior } from '@/lib/external/bls';
import { fetchCompetitionIndex, fetchLocalMarketStrength } from '@/lib/external/census';
import { fetchGooglePlaceSignals } from '@/lib/external/googlePlaces';
import { fetchPageSpeedSignals } from '@/lib/external/pagespeed';
import { clamp, reviewFactor, websiteFactor } from '@/lib/scoring';
import type { BenchmarkProfile, ForecastInput } from '@/lib/types';

export async function buildBenchmarkProfile(input: ForecastInput): Promise<BenchmarkProfile> {
  const [marketMonthlyPrior, competitionIndexRaw, marketStrengthRaw, placeSignals, pageSignals] =
    await Promise.all([
      fetchBlsMarketPrior(input.serviceType, input.state),
      fetchCompetitionIndex(input.serviceType, input.city, input.state),
      fetchLocalMarketStrength(input.city, input.state),
      fetchGooglePlaceSignals(input.businessName, input.city),
      fetchPageSpeedSignals(input.websiteUrl),
    ]);

  const reviewRatingUsed = placeSignals.rating ?? input.reviewRating;
  const reviewCountUsed = placeSignals.reviewCount ?? input.reviewCount;
  const pagespeedScore = pageSignals.pagespeedScore ?? null;

  const competitionIndex = clamp(competitionIndexRaw, 0, 1);
  const marketStrength = clamp(marketStrengthRaw, 0, 1);
  const digitalStrength = clamp(
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
  };
}
