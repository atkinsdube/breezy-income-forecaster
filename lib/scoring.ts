import type { ResponseTimeBucket } from '@/lib/types';

export function responseFactor(bucket: ResponseTimeBucket): number {
  switch (bucket) {
    case 'Under 5 min':  return 1.08;
    case '5-15 min':     return 1.03;
    case '15-60 min':    return 1.0;
    case '1-4 hr':       return 0.93;
    case 'Over 4 hr':    return 0.85;
    default:             return 1.0;
  }
}

export function reviewFactor(rating: number, count: number): number {
  const boundedRating = Math.max(0, Math.min(5, rating));
  const countTerm = Math.log1p(Math.max(0, count));
  return 1 + 0.04 * (boundedRating - 4.2) + 0.02 * countTerm;
}

export function websiteFactor(pagespeedScore: number | null): number {
  if (pagespeedScore === null) return 1.0;
  if (pagespeedScore >= 85) return 1.03;
  if (pagespeedScore >= 60) return 1.0;
  return 0.95;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
