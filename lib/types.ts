export type ResponseTimeBucket = 'Under 5 min' | '5-15 min' | '15-60 min' | '1-4 hr' | 'Over 4 hr';

export interface ForecastInput {
  serviceType: string;
  city: string;
  state: string;
  soloOperator: boolean;
  businessName?: string;
  websiteUrl?: string;
  monthlyLeads: number;
  bookingRate: number;
  jobsCompletedPerMonth: number;
  averageJobValue: number;
  repeatCustomerRate: number;
  cancellationRate: number;
  responseTimeBucket: ResponseTimeBucket;
  afterHoursCoverage: boolean;
  reviewRating: number;
  reviewCount: number;
}

export interface BenchmarkProfile {
  marketMonthlyPrior: number;
  competitionIndex: number;
  digitalStrength: number;
  marketStrength: number;
  reviewRatingUsed: number;
  reviewCountUsed: number;
  pagespeedScore: number | null;
}

export interface ForecastResult {
  expectedRevenue: number;
  medianRevenue: number;
  lowRevenue: number;
  highRevenue: number;
  confidenceLabel: string;
  recommendations: string[];
  upsidePotential: number;
}
