import { clamp, responseFactor, reviewFactor, websiteFactor } from '@/lib/scoring';
import type { BenchmarkProfile, ForecastInput, ForecastResult } from '@/lib/types';

function randomNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function sampleLogNormal(mean: number, sigma: number): number {
  const mu = Math.log(mean) - (sigma * sigma) / 2;
  return Math.exp(mu + sigma * randomNormal());
}

function sampleApproxBeta(mean: number, concentration: number): number {
  const variance = (mean * (1 - mean)) / (concentration + 1);
  const draw = mean + randomNormal() * Math.sqrt(Math.max(variance, 1e-6));
  return clamp(draw, 0.01, 0.99);
}

function sampleApproxCount(mean: number): number {
  const sd = Math.max(2, mean * 0.2);
  return Math.max(0, Math.round(mean + randomNormal() * sd));
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((sorted.length - 1) * p);
  return sorted[idx];
}

export function runForecast(input: ForecastInput, benchmark: BenchmarkProfile): ForecastResult {
  const responseAdj = responseFactor(input.responseTimeBucket);
  const reviewAdj = reviewFactor(benchmark.reviewRatingUsed, benchmark.reviewCountUsed);
  const websiteAdj = websiteFactor(benchmark.pagespeedScore);
  const afterHoursAdj = input.afterHoursCoverage ? 1.04 : 0.97;

  const marketLeadAdj = 1 + 0.15 * benchmark.marketStrength - 0.12 * benchmark.competitionIndex;
  const digitalLeadAdj = clamp(reviewAdj * websiteAdj * afterHoursAdj * responseAdj, 0.8, 1.3);

  const priorLeads = Math.max(8, benchmark.marketMonthlyPrior / Math.max(input.averageJobValue, 1));
  const leadMean = 0.7 * input.monthlyLeads + 0.3 * priorLeads * marketLeadAdj * digitalLeadAdj;

  const bookingMean = clamp(
    input.bookingRate * responseAdj * reviewAdj * websiteAdj * afterHoursAdj,
    0.08,
    0.95,
  );

  const completionMean = clamp(
    1 - input.cancellationRate + 0.05 * input.repeatCustomerRate,
    0.5,
    0.99,
  );
  const jobValueMean = Math.max(50, input.averageJobValue * (1 + 0.08 * benchmark.marketStrength));

  const samples: number[] = [];

  for (let i = 0; i < 6000; i++) {
    const leads = sampleApproxCount(leadMean);
    const bookingRate = sampleApproxBeta(bookingMean, 80);
    const completionRate = sampleApproxBeta(completionMean, 120);
    const jobValue = sampleLogNormal(jobValueMean, 0.22);
    samples.push(leads * bookingRate * completionRate * jobValue);
  }

  const expectedRevenue = samples.reduce((sum, v) => sum + v, 0) / samples.length;
  const medianRevenue = percentile(samples, 0.5);
  const lowRevenue = percentile(samples, 0.1);
  const highRevenue = percentile(samples, 0.9);

  const spreadRatio = (highRevenue - lowRevenue) / Math.max(expectedRevenue, 1);
  const confidenceLabel = spreadRatio < 0.6 ? 'Higher' : spreadRatio < 1.0 ? 'Moderate' : 'Lower';

  const recommendations: string[] = [];

  if (responseAdj < 1) {
    recommendations.push('Improve response speed to lift booking conversion from inbound leads.');
  }
  if (!input.afterHoursCoverage) {
    recommendations.push('Capture after-hours inquiries to reduce missed revenue opportunities.');
  }
  if (benchmark.reviewRatingUsed < 4.5 || benchmark.reviewCountUsed < 25) {
    recommendations.push('Strengthen your review profile to improve trust and local conversion.');
  }
  if (input.cancellationRate > 0.1) {
    recommendations.push('Reduce cancellations with automated reminders and tighter scheduling.');
  }
  if (recommendations.length < 3) {
    recommendations.push('Increase repeat-customer reactivation to stabilize monthly revenue.');
  }
  if (recommendations.length < 3) {
    recommendations.push('Use faster follow-up to convert a larger share of high-intent leads.');
  }

  return {
    expectedRevenue,
    medianRevenue,
    lowRevenue,
    highRevenue,
    confidenceLabel,
    recommendations: recommendations.slice(0, 4),
  };
}
