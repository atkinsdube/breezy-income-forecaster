// Climate zone mapping and geographic demand adjustment per service type.
//
// Each US state maps to one of 6 climate zones. For climate-sensitive services,
// the base national seasonal curve is replaced with a zone-specific curve.
// An annual demand scale adjusts the total market size for the zone
// (e.g. snow removal in Arizona = 0, pool service in Arizona = 2×).

export type ClimateZone =
  | 'hot-dry'      // AZ, NV, NM, west TX, southern CA interior
  | 'hot-humid'    // FL, south LA, HI, southeast coast
  | 'warm-mixed'   // CA coast, OR, WA, VA, NC, TN, AR, most of south
  | 'cold-humid'   // Northeast, Great Lakes
  | 'continental'  // Plains, upper Midwest (MN, IA, ND, SD, NE, KS)
  | 'mountain';    // Rockies, AK (CO, UT, WY, MT, ID, AK)

export const STATE_CLIMATE: Record<string, ClimateZone> = {
  // Hot & dry
  AZ: 'hot-dry', NV: 'hot-dry', NM: 'hot-dry',
  // Hot & humid
  FL: 'hot-humid', HI: 'hot-humid',
  // Warm & mixed
  CA: 'warm-mixed', OR: 'warm-mixed', WA: 'warm-mixed',
  VA: 'warm-mixed', NC: 'warm-mixed', TN: 'warm-mixed',
  AR: 'warm-mixed', OK: 'warm-mixed', SC: 'warm-mixed',
  GA: 'warm-mixed', AL: 'warm-mixed', MS: 'warm-mixed',
  TX: 'warm-mixed', LA: 'warm-mixed', KY: 'warm-mixed',
  DE: 'warm-mixed', MD: 'warm-mixed', WV: 'warm-mixed',
  // Cold & humid (Northeast + Great Lakes)
  ME: 'cold-humid', NH: 'cold-humid', VT: 'cold-humid', MA: 'cold-humid',
  RI: 'cold-humid', CT: 'cold-humid', NY: 'cold-humid', NJ: 'cold-humid',
  PA: 'cold-humid', OH: 'cold-humid', IN: 'cold-humid', IL: 'cold-humid',
  MI: 'cold-humid', WI: 'cold-humid',
  // Continental (Plains)
  MN: 'continental', IA: 'continental', MO: 'continental',
  ND: 'continental', SD: 'continental', NE: 'continental', KS: 'continental',
  // Mountain
  CO: 'mountain', UT: 'mountain', WY: 'mountain', MT: 'mountain',
  ID: 'mountain', AK: 'mountain',
};

// ── Zone-specific annual demand scale ───────────────────────────────────────
// 1.0 = national average, 0.0 = no market

const ZONE_ANNUAL_SCALE: Record<string, Partial<Record<ClimateZone, number>>> = {
  'Snow Removal':          { 'hot-dry': 0.00, 'hot-humid': 0.01, 'warm-mixed': 0.12, 'cold-humid': 1.00, 'continental': 1.55, 'mountain': 2.10 },
  'Pool Service':          { 'hot-dry': 2.10, 'hot-humid': 1.70, 'warm-mixed': 1.10, 'cold-humid': 0.90, 'continental': 0.55, 'mountain': 0.40 },
  'Irrigation Specialist': { 'hot-dry': 2.30, 'hot-humid': 1.10, 'warm-mixed': 1.00, 'cold-humid': 0.75, 'continental': 0.65, 'mountain': 0.70 },
  'HVAC Technician':       { 'hot-dry': 1.45, 'hot-humid': 1.30, 'warm-mixed': 1.00, 'cold-humid': 1.10, 'continental': 1.15, 'mountain': 0.90 },
  'Landscaper':            { 'hot-dry': 0.90, 'hot-humid': 1.35, 'warm-mixed': 1.10, 'cold-humid': 1.00, 'continental': 0.80, 'mountain': 0.60 },
  'Pressure Washer':       { 'hot-dry': 1.05, 'hot-humid': 1.20, 'warm-mixed': 1.00, 'cold-humid': 0.90, 'continental': 0.80, 'mountain': 0.70 },
  'Tree Service':          { 'hot-dry': 0.85, 'hot-humid': 1.10, 'warm-mixed': 1.00, 'cold-humid': 1.00, 'continental': 0.90, 'mountain': 0.80 },
  'Window Cleaner':        { 'hot-dry': 1.10, 'hot-humid': 1.10, 'warm-mixed': 1.00, 'cold-humid': 0.95, 'continental': 0.85, 'mountain': 0.80 },
};

// ── Zone-specific seasonal curves (replace national defaults) ────────────────
// Only defined for service+zone combos where the SHAPE meaningfully differs.
// These raw weights are normalized to mean=1.0 before use.

const RAW_ZONE_CURVES: Record<string, Partial<Record<ClimateZone, number[]>>> = {
  'Snow Removal': {
    'hot-dry':     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'hot-humid':   [0.05, 0.02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05],
    'warm-mixed':  [1.8, 1.4, 0.5, 0, 0, 0, 0, 0, 0, 0.1, 0.6, 1.5],
    'continental': [3.5, 3.2, 1.5, 0.1, 0, 0, 0, 0, 0, 0.6, 2.0, 3.3],
    'mountain':    [3.8, 3.5, 2.2, 0.4, 0.0, 0, 0, 0, 0.1, 0.7, 2.2, 3.6],
  },
  'Pool Service': {
    'hot-dry':     [0.7, 0.8, 1.0, 1.4, 1.7, 1.8, 1.8, 1.7, 1.5, 1.2, 0.9, 0.7],
    'hot-humid':   [0.5, 0.6, 0.9, 1.3, 1.8, 2.1, 2.1, 2.0, 1.7, 1.1, 0.6, 0.5],
    'continental': [0, 0, 0.1, 0.5, 1.6, 2.5, 2.8, 2.4, 1.5, 0.4, 0.1, 0],
    'mountain':    [0, 0, 0.1, 0.5, 1.4, 2.4, 2.8, 2.4, 1.4, 0.4, 0.1, 0],
  },
  'Landscaper': {
    'hot-dry':     [0.7, 0.8, 1.0, 1.1, 1.0, 0.7, 0.6, 0.6, 0.9, 1.1, 1.1, 0.8], // summer slows — too hot to work outdoors
    'hot-humid':   [0.8, 0.9, 1.1, 1.3, 1.4, 1.3, 1.2, 1.1, 1.2, 1.2, 1.0, 0.8],
    'continental': [0, 0, 0.3, 1.5, 2.3, 2.2, 1.9, 1.9, 1.7, 0.8, 0.2, 0],
  },
  'HVAC Technician': {
    'hot-dry':     [0.8, 0.7, 0.8, 0.9, 1.3, 2.2, 2.6, 2.4, 1.6, 0.9, 0.5, 0.6],
    'hot-humid':   [0.9, 0.8, 0.7, 0.9, 1.3, 2.1, 2.5, 2.3, 1.5, 0.8, 0.6, 0.7],
    'continental': [1.9, 1.6, 0.8, 0.5, 0.8, 1.4, 1.8, 1.6, 1.0, 0.5, 0.9, 1.7],
  },
  'Irrigation Specialist': {
    'hot-dry':     [0.3, 0.4, 0.8, 1.3, 1.8, 2.1, 2.1, 1.9, 1.6, 1.0, 0.5, 0.3],
    'hot-humid':   [0.3, 0.4, 0.7, 1.2, 1.7, 1.9, 1.9, 1.8, 1.6, 1.0, 0.6, 0.3],
  },
};

function normalize(w: number[]): number[] {
  const mean = w.reduce((a, b) => a + b, 0) / w.length;
  if (mean <= 0) return w.map(() => 0);
  return w.map((v) => v / mean);
}

const ZONE_CURVES: Record<string, Partial<Record<ClimateZone, number[]>>> = {};
for (const [svc, zones] of Object.entries(RAW_ZONE_CURVES)) {
  ZONE_CURVES[svc] = {};
  for (const [zone, weights] of Object.entries(zones)) {
    (ZONE_CURVES[svc] as Record<string, number[]>)[zone] = normalize(weights);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export function getClimateZone(state: string): ClimateZone | null {
  return STATE_CLIMATE[state.trim().toUpperCase()] ?? null;
}

export function getGeoAnnualScale(serviceType: string, state: string): number {
  const zone = getClimateZone(state);
  if (!zone) return 1.0;
  return ZONE_ANNUAL_SCALE[serviceType]?.[zone] ?? 1.0;
}

/** Returns zone-adjusted monthly weights or null if no zone override exists. */
export function getZoneCurve(serviceType: string, state: string): number[] | null {
  const zone = getClimateZone(state);
  if (!zone) return null;
  return ZONE_CURVES[serviceType]?.[zone] ?? null;
}
