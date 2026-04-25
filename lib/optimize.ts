import { responseFactor, reviewFactor, websiteFactor, clamp } from '@/lib/scoring';
import type { BenchmarkProfile, ForecastInput } from '@/lib/types';

// ── Price optimization ───────────────────────────────────────────────────────
//
// Model: booking_rate(p) = b₀ × max(0, 1 − s × (p/p₀ − 1))
// Revenue(p) = leads × booking_rate(p) × completion × p
// Analytical optimum: p* = p₀ × (1 + s) / (2s)
//
// s is the "sensitivity" — the fractional drop in booking rate per 100% price
// increase. Emergency/specialist trades have low s (inelastic); commodity
// services have high s (elastic).

const PRICE_SENSITIVITY: Record<string, number> = {
  Plumber: 0.40, Electrician: 0.40, Locksmith: 0.38,
  'HVAC Technician': 0.48, 'Appliance Repair': 0.52,
  Roofer: 0.52, Carpenter: 0.58, 'Tile & Stone': 0.58,
  'Drywall & Plaster': 0.58, 'Flooring Installer': 0.60,
  Painter: 0.62, 'Tree Service': 0.60, Handyman: 0.65,
  'Pest Control': 0.60, 'Pool Service': 0.62,
  'Irrigation Specialist': 0.62, Landscaper: 0.70,
  Mover: 0.65, 'Junk Removal': 0.68, 'Snow Removal': 0.58,
  'Auto Detailer': 0.68, 'Pressure Washer': 0.72,
  'Window Cleaner': 0.72, Cleaner: 0.80,
  'Dog Groomer': 0.78, 'Personal Trainer': 0.68,
};

export interface PriceOptResult {
  currentPrice: number;
  optimalPrice: number;
  currentRevenue: number;
  optimalRevenue: number;
  uplift: number;
  upliftPct: number;
  sensitivity: number;
  curve: { price: number; revenue: number }[];
}

export function optimizePrice(input: ForecastInput): PriceOptResult {
  const s = PRICE_SENSITIVITY[input.serviceType] ?? 0.65;
  const { averageJobValue: p0, monthlyLeads, bookingRate, cancellationRate, repeatCustomerRate } = input;
  const completion = clamp(1 - cancellationRate + 0.05 * repeatCustomerRate, 0.5, 0.99);

  function rev(p: number): number {
    const x = p / p0;
    const b = bookingRate * Math.max(0, 1 - s * (x - 1));
    return monthlyLeads * b * completion * p;
  }

  const curve: { price: number; revenue: number }[] = [];
  let maxRevenue = 0;
  let optimalPrice = p0;

  for (let m = 0.5; m <= 2.8; m += 0.05) {
    const p = p0 * m;
    const r = rev(p);
    if (r > 0) curve.push({ price: Math.round(p), revenue: Math.round(r) });
    if (r > maxRevenue) { maxRevenue = r; optimalPrice = p; }
  }

  const currentRevenue = rev(p0);
  const uplift = Math.max(0, maxRevenue - currentRevenue);

  return {
    currentPrice: Math.round(p0),
    optimalPrice: Math.round(optimalPrice),
    currentRevenue: Math.round(currentRevenue),
    optimalRevenue: Math.round(maxRevenue),
    uplift: Math.round(uplift),
    upliftPct: Math.round((uplift / Math.max(currentRevenue, 1)) * 100),
    sensitivity: s,
    curve,
  };
}

// ── Sensitivity / tornado analysis ──────────────────────────────────────────
//
// Analytical approximation for E[Revenue]:
//   E[R] ≈ leadMean × bookingMean × completionMean × jobValueMean
//
// For each input lever, compute the revenue gain from a +15% improvement.
// Sort descending — the tornado chart shows highest-leverage levers first.

function analyticalRevenue(inp: ForecastInput, bm: BenchmarkProfile): number {
  const responseAdj   = responseFactor(inp.responseTimeBucket);
  const reviewAdj     = reviewFactor(bm.reviewRatingUsed, bm.reviewCountUsed);
  const websiteAdj    = websiteFactor(bm.pagespeedScore);
  const afterHoursAdj = inp.afterHoursCoverage ? 1.04 : 0.97;

  const marketLeadAdj  = 1 + 0.15 * bm.marketStrength - 0.12 * bm.competitionIndex;
  const digitalLeadAdj = clamp(reviewAdj * websiteAdj * afterHoursAdj * responseAdj, 0.8, 1.3);
  const priorLeads     = Math.max(8, bm.marketMonthlyPrior / Math.max(inp.averageJobValue, 1));
  const leadMean       = 0.7 * inp.monthlyLeads + 0.3 * priorLeads * marketLeadAdj * digitalLeadAdj;
  const bookingMean    = clamp(inp.bookingRate * responseAdj * reviewAdj * websiteAdj * afterHoursAdj, 0.08, 0.95);
  const completionMean = clamp(1 - inp.cancellationRate + 0.05 * inp.repeatCustomerRate, 0.5, 0.99);
  const jobValueMean   = Math.max(50, inp.averageJobValue * (1 + 0.08 * bm.marketStrength));

  return leadMean * bookingMean * completionMean * jobValueMean;
}

export interface SensitivityItem {
  label: string;
  improvementDesc: string;
  revenueGain: number;
  revenueGainPct: number;
}

export function analyzeSensitivity(input: ForecastInput, benchmark: BenchmarkProfile): SensitivityItem[] {
  const base = analyticalRevenue(input, benchmark);
  const d = 0.15;

  const scenarios: { key: keyof ForecastInput; label: string; desc: string; direction: 1 | -1 }[] = [
    { key: 'monthlyLeads',      label: 'More leads',            desc: '+15% monthly leads',       direction:  1 },
    { key: 'bookingRate',       label: 'Higher booking rate',   desc: '+15% booking rate',        direction:  1 },
    { key: 'averageJobValue',   label: 'Higher job value',      desc: '+15% average job value',   direction:  1 },
    { key: 'cancellationRate',  label: 'Fewer cancellations',   desc: '−15% cancellation rate',  direction: -1 },
    { key: 'repeatCustomerRate',label: 'More repeat customers', desc: '+15% repeat customer rate',direction:  1 },
    { key: 'reviewCount',       label: 'More reviews',          desc: '+15% review count',        direction:  1 },
  ];

  return scenarios
    .map(({ key, label, desc, direction }) => {
      const current = input[key] as number;
      const improved = current * (1 + direction * d);
      const gain = analyticalRevenue({ ...input, [key]: improved }, benchmark) - base;
      return {
        label,
        improvementDesc: desc,
        revenueGain: Math.round(gain),
        revenueGainPct: Math.round((gain / Math.max(base, 1)) * 100),
      };
    })
    .sort((a, b) => b.revenueGain - a.revenueGain);
}

// ── Capacity utilization ─────────────────────────────────────────────────────
//
// Estimates max monthly job capacity from average job duration and a standard
// solo-operator work schedule (22 days × 8 hours). Flags utilization zones.

const AVG_JOB_HOURS: Record<string, number> = {
  Plumber: 2.5, Electrician: 3.0, Cleaner: 2.5, 'HVAC Technician': 3.5,
  Handyman: 2.0, Landscaper: 3.0, Painter: 5.0, Roofer: 6.0,
  Carpenter: 4.0, 'Pest Control': 1.5, 'Pool Service': 1.5,
  'Flooring Installer': 5.0, 'Appliance Repair': 1.5, Locksmith: 1.0,
  'Auto Detailer': 2.5, 'Dog Groomer': 1.5, 'Personal Trainer': 1.0,
  'Pressure Washer': 2.5, 'Window Cleaner': 2.0, 'Junk Removal': 2.0,
  Mover: 5.0, 'Tile & Stone': 5.0, 'Snow Removal': 2.0,
  'Irrigation Specialist': 3.0, 'Tree Service': 4.0, 'Drywall & Plaster': 4.0,
};

export type CapacityStatus = 'underutilized' | 'healthy' | 'near-limit' | 'over-limit';

export interface CapacityResult {
  utilizationPct: number;
  maxCapacity: number;
  currentJobs: number;
  headroomJobs: number;
  headroomRevenue: number;
  avgJobHours: number;
  status: CapacityStatus;
}

export function analyzeCapacity(input: ForecastInput): CapacityResult {
  const avgJobHours  = AVG_JOB_HOURS[input.serviceType] ?? 2.5;
  const maxCapacity  = Math.floor((22 * 8) / avgJobHours);
  const utilization  = input.jobsCompletedPerMonth / maxCapacity;
  const headroomJobs = Math.max(0, maxCapacity - input.jobsCompletedPerMonth);

  return {
    utilizationPct: Math.min(100, Math.round(utilization * 100)),
    maxCapacity,
    currentJobs: input.jobsCompletedPerMonth,
    headroomJobs,
    headroomRevenue: Math.round(headroomJobs * input.averageJobValue),
    avgJobHours,
    status: utilization < 0.5 ? 'underutilized'
          : utilization < 0.75 ? 'healthy'
          : utilization < 0.92 ? 'near-limit'
          : 'over-limit',
  };
}

// ── Customer lifetime value ──────────────────────────────────────────────────
//
// CLV via geometric series: CLV = avg_job_value / (1 − retention)
// "Retention" here approximates the fraction of customers who return for
// another job, which maps to the user's repeat customer rate input.

export interface ClvResult {
  clv: number;
  repeatImpactMonthly: number;
}

export function computeClv(input: ForecastInput): ClvResult {
  const retention = clamp(input.repeatCustomerRate, 0.01, 0.85);
  const clv       = Math.round(input.averageJobValue / (1 - retention));

  const improvedRetention = clamp(retention + 0.05, 0.01, 0.85);
  const improvedClv       = input.averageJobValue / (1 - improvedRetention);
  const clvLift           = improvedClv - clv;

  // Monthly impact: fraction of jobs that become repeat customers × CLV lift
  const repeatImpactMonthly = Math.round(input.jobsCompletedPerMonth * retention * clvLift * 0.08);

  return { clv, repeatImpactMonthly };
}

// ── Breezy break-even ────────────────────────────────────────────────────────
//
// How many extra jobs does Breezy need to generate to pay for itself?
// Conservative 15% booking lift assumption based on faster response + after-hours.

export interface BreakEvenResult {
  breezyMonthlyCost: number;
  extraJobsNeeded: number;
  roi12Month: number;
}

const BREEZY_MONTHLY_COST = 99;
const BREEZY_BOOKING_LIFT = 0.15;

export function computeBreakEven(expectedRevenue: number): BreakEvenResult {
  const monthlyLift = expectedRevenue * BREEZY_BOOKING_LIFT;
  const annualLift  = monthlyLift * 12;
  const annualCost  = BREEZY_MONTHLY_COST * 12;
  const roi         = Math.round(((annualLift - annualCost) / annualCost) * 100);
  const extraJobs   = BREEZY_MONTHLY_COST / Math.max(1, expectedRevenue / Math.max(1, 16));

  return {
    breezyMonthlyCost: BREEZY_MONTHLY_COST,
    extraJobsNeeded: Math.round(extraJobs * 10) / 10,
    roi12Month: roi,
  };
}
