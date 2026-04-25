// Monthly demand weights [Jan..Dec] per service type — national baseline.
// Normalized to mean=1.0 so the annual-average prior is preserved.
// When a state is passed, geography.ts zone curves take priority.

import { getZoneCurve } from '@/lib/geography';

const rawWeights: Record<string, number[]> = {
  'Snow Removal':          [3.0, 2.8, 1.2, 0.1, 0.0, 0.0, 0.0, 0.0, 0.1, 0.7, 1.7, 2.8],
  'Landscaper':            [0.1, 0.2, 0.8, 1.8, 2.0, 1.8, 1.5, 1.5, 1.5, 1.0, 0.5, 0.3],
  'Pool Service':          [0.1, 0.1, 0.3, 0.9, 2.0, 2.5, 2.5, 2.2, 1.6, 0.5, 0.2, 0.1],
  'Irrigation Specialist': [0.0, 0.0, 0.4, 1.5, 2.2, 2.2, 2.2, 2.0, 1.5, 0.7, 0.2, 0.0],
  'Tree Service':          [0.5, 0.5, 1.0, 1.3, 1.4, 1.2, 1.1, 1.1, 1.3, 1.3, 1.0, 0.4],
  'Painter':               [0.4, 0.4, 0.7, 1.2, 1.5, 1.6, 1.5, 1.5, 1.3, 0.9, 0.6, 0.4],
  'Roofer':                [0.4, 0.4, 0.8, 1.3, 1.5, 1.5, 1.4, 1.4, 1.3, 1.1, 0.7, 0.4],
  'Pressure Washer':       [0.2, 0.3, 0.7, 1.4, 1.6, 1.6, 1.5, 1.5, 1.3, 0.9, 0.6, 0.4],
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

function normalize(w: number[]): number[] {
  const mean = w.reduce((a, b) => a + b, 0) / w.length;
  if (mean <= 0) return w.map(() => 0);
  return w.map((v) => v / mean);
}

const nationalWeights: Record<string, number[]> = {};
for (const [k, w] of Object.entries(rawWeights)) {
  nationalWeights[k] = normalize(w);
}

export function getSeasonalWeights(serviceType: string, state?: string): number[] {
  if (state) {
    const zoneCurve = getZoneCurve(serviceType, state);
    if (zoneCurve) return zoneCurve;
  }
  return nationalWeights[serviceType] ?? Array(12).fill(1.0);
}

export function getSeasonalMultiplier(serviceType: string, month: number, state?: string): number {
  return getSeasonalWeights(serviceType, state)[month] ?? 1.0;
}

export function getPeakMonth(serviceType: string, state?: string): number {
  const w = getSeasonalWeights(serviceType, state);
  return w.indexOf(Math.max(...w));
}

export function getPeakMonthName(serviceType: string, state?: string): string | null {
  const peak = getPeakMonth(serviceType, state);
  return peak >= 0 ? MONTH_NAMES[peak] : null;
}

export function getMonthName(month: number): string {
  return MONTH_NAMES[month];
}
