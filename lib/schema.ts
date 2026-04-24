import { z } from 'zod';

export const forecastInputSchema = z.object({
  serviceType: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  soloOperator: z.boolean(),
  businessName: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().optional().or(z.literal('')),
  monthlyLeads: z.number().positive(),
  bookingRate: z.number().min(0).max(1),
  jobsCompletedPerMonth: z.number().nonnegative(),
  averageJobValue: z.number().positive(),
  repeatCustomerRate: z.number().min(0).max(1),
  cancellationRate: z.number().min(0).max(1),
  responseTimeBucket: z.enum(['Under 5 min', '5-15 min', '15-60 min', '1-4 hr', 'Over 4 hr']),
  afterHoursCoverage: z.boolean(),
  reviewRating: z.number().min(0).max(5),
  reviewCount: z.number().nonnegative(),
});
