// Monthly demand weights [Jan..Dec] per service type.
// Normalized so mean = 1.0, meaning the annual average is preserved.
// Services not listed are treated as year-round (multiplier = 1.0).

const rawWeights: Record<string, number[]> = {
  // ── Strongly seasonal ───────────────────────────────────────────────────
  'Snow Removal':          [3.0, 2.8, 1.2, 0.1, 0.0, 0.0, 0.0, 0.0, 0.1, 0.7, 1.7, 2.8],
  'Landscaper':            [0.1, 0.2, 0.8, 1.8, 2.0, 1.8, 1.5, 1.5, 1.5, 1.0, 0.5, 0.3],
  'Pool Service':          [0.1, 0.1, 0.3, 0.9, 2.0, 2.5, 2.5, 2.2, 1.6, 0.5, 0.2, 0.1],
  'Irrigation Specialist': [0.0, 0.0, 0.4, 1.5, 2.2, 2.2, 2.2, 2.0, 1.5, 0.7, 0.2, 0.0],
  'Tree Service':          [0.5, 0.5, 1.0, 1.3, 1.4, 1.2, 1.1, 1.1, 1.3, 1.3, 1.0, 0.4],
  'Painter':               [0.4, 0.4, 0.7, 1.2, 1.5, 1.6, 1.5, 1.5, 1.3, 0.9, 0.6, 0.4],
  'Roofer':                [0.4, 0.4, 0.8, 1.3, 1.5, 1.5, 1.4, 1.4, 1.3, 1.1, 0.7, 0.4],
  'Pressure Washer':       [0.2, 0.3, 0.7, 1.4, 1.6, 1.6, 1.5, 1.5, 1.3, 0.9, 0.6, 0.4],

  // ── Moderately seasonal ─────────────────────────────────────────────────
  'HVAC Technician':       [1.4, 1.2, 0.8, 0.7, 1.0, 1.8, 2.1, 1.9, 1.2, 0.6, 0.7, 1.3],
  'Pest Control':          [0.5, 0.5, 0.8, 1.3, 1.5, 1.6, 1.5, 1.5, 1.2, 0.9, 0.6, 0.5],
  'Mover':                 [0.6, 0.6, 0.8, 1.1, 1.5, 1.6, 1.6, 1.5, 1.3, 0.9, 0.6, 0.5],
  'Junk Removal':          [0.6, 0.6, 0.9, 1.2, 1.4, 1.4, 1.3, 1.3, 1.2, 1.1, 0.7, 0.5],
  'Auto Detailer':         [0.5, 0.5, 0.9, 1.3, 1.5, 1.5, 1.4, 1.4, 1.2, 1.0, 0.7, 0.5],
  'Window Cleaner':        [0.6, 0.6, 0.9, 1.2, 1.3, 1.3, 1.2, 1.2, 1.2, 1.1, 0.8, 0.6],
  'Dog Groomer':           [0.8, 0.8, 0.9, 1.1, 1.2, 1.2, 1.2, 1.2, 1.1, 1.0, 0.9, 0.8],
  'Flooring Installer':    [0.6, 0.7, 0.9, 1.1, 1.2, 1.2, 1.1, 1.1, 1.1, 1.1, 0.9, 0.8],
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function normalize(weights: number[]): number[] {
  const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
  if (mean === 0) return weights.map(() => 0);
  return weights.map((w) => w / mean);
}

const normalizedWeights: Record<string, number[]> = {};
for (const [key, weights] of Object.entries(rawWeights)) {
  normalizedWeights[key] = normalize(weights);
}

export function getSeasonalMultiplier(serviceType: string, month: number): number {
  return normalizedWeights[serviceType]?.[month] ?? 1.0;
}

export function getPeakMonth(serviceType: string): number {
  const weights = normalizedWeights[serviceType];
  if (!weights) return -1;
  return weights.indexOf(Math.max(...weights));
}

export function getPeakMonthName(serviceType: string): string | null {
  const peak = getPeakMonth(serviceType);
  return peak >= 0 ? MONTH_NAMES[peak] : null;
}

export function getMonthName(month: number): string {
  return MONTH_NAMES[month];
}
