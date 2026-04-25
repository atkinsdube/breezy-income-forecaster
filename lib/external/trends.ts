// Market trend signals per service type.
//
// Short-term (3-month): BLS specialty-trade contractor employment series
//   (CEU2023830001) via the public BLS API v1 — no key required.
//   Cached for 24 h to respect BLS rate limits.
//
// Long-term (10-year): Static data from BLS Occupational Outlook Handbook
//   2022–2032 projections. Updated manually from OOH when a new edition ships.

export type TrendDirection = 'rising' | 'stable' | 'declining';

export interface MarketTrend {
  shortTermDirection: TrendDirection;
  shortTermPct: number;      // 3-month employment change %
  shortTermLabel: string;
  longTermPct: number;       // 10-year projected employment change %
  longTermLabel: string;
  longTermDesc: string;
  dataFresh: boolean;        // false = API unavailable, fell back to static
}

// ── BLS series correlation per service ───────────────────────────────────────
// Weight (0–1) of how much the specialty-trade-contractor series predicts
// demand for this service. Services closer to residential construction = higher.
const CONSTRUCTION_CORRELATION: Record<string, number> = {
  Plumber: 0.85, Electrician: 0.80, 'HVAC Technician': 0.75,
  Roofer: 0.92, Carpenter: 0.90, Painter: 0.75,
  'Tile & Stone': 0.85, 'Flooring Installer': 0.80,
  'Drywall & Plaster': 0.88, Handyman: 0.60,
  Landscaper: 0.45, 'Tree Service': 0.40,
  'Irrigation Specialist': 0.50, 'Pool Service': 0.40,
  Cleaner: 0.25, 'Window Cleaner': 0.30, 'Pressure Washer': 0.35,
  Mover: 0.50, 'Junk Removal': 0.45, 'Auto Detailer': 0.15,
  'Dog Groomer': 0.10, 'Personal Trainer': 0.10,
  Locksmith: 0.40, 'Appliance Repair': 0.30,
  'Pest Control': 0.35, 'Snow Removal': 0.20,
};

// ── Static 10-year outlook (BLS OOH 2022–2032) ───────────────────────────────
const OOH_OUTLOOK: Record<string, { pct: number; label: string; desc: string }> = {
  Electrician:          { pct: 11, label: 'Faster than average', desc: 'EV charging infrastructure, solar installations, and data-centre demand are driving strong growth.' },
  'HVAC Technician':    { pct:  6, label: 'Faster than average', desc: 'Energy-efficiency mandates and an aging housing stock are increasing HVAC replacement cycles.' },
  'Pest Control':       { pct:  8, label: 'Faster than average', desc: 'Climate change is expanding pest populations and lengthening seasons.' },
  Locksmith:            { pct:  8, label: 'Faster than average', desc: 'Smart-lock adoption and commercial security upgrades are creating new service lines.' },
  'Dog Groomer':        { pct: 19, label: 'Much faster than average', desc: 'Pet ownership has risen sharply post-pandemic; premium grooming spend is growing.' },
  'Personal Trainer':   { pct: 14, label: 'Much faster than average', desc: 'Renewed focus on preventive health and in-home training services is accelerating demand.' },
  Plumber:              { pct:  2, label: 'About average', desc: 'Steady replacement demand in the residential sector balances slower new construction growth.' },
  Roofer:               { pct:  3, label: 'About average', desc: 'Storm damage and ageing roof stock provide steady work despite modest new-build activity.' },
  Painter:              { pct: -1, label: 'Little or no change', desc: 'New-build slowdowns are partially offset by renovation and commercial repainting work.' },
  Carpenter:            { pct:  2, label: 'About average', desc: 'Renovation and remodelling activity sustains steady demand.' },
  'Flooring Installer': { pct:  3, label: 'About average', desc: 'Stable renovation demand driven by housing turnover.' },
  'Drywall & Plaster':  { pct:  2, label: 'About average', desc: 'Closely tied to residential construction and remodelling activity.' },
  Handyman:             { pct:  4, label: 'About average', desc: 'DIY decline among ageing homeowners is sustaining demand for general maintenance.' },
  Landscaper:           { pct:  5, label: 'About average', desc: 'Consistent residential demand with growing commercial landscaping contracts.' },
  Cleaner:              { pct:  5, label: 'About average', desc: 'Household income growth and time constraints sustain demand for residential cleaning.' },
  Mover:                { pct:  4, label: 'About average', desc: 'Tied to housing mobility; remote-work trends have modestly increased relocation demand.' },
  'Pool Service':       { pct:  6, label: 'Faster than average', desc: 'Growing pool ownership in the Sun Belt and increasing pool complexity drive service demand.' },
  'Junk Removal':       { pct:  8, label: 'Faster than average', desc: 'E-commerce returns, estate clearances, and renovation waste are expanding the category.' },
  'Tree Service':       { pct:  5, label: 'About average', desc: 'Storm damage response and municipal tree maintenance provide consistent baseline demand.' },
  'Auto Detailer':      { pct:  5, label: 'About average', desc: 'Premium vehicle care and fleet maintenance sustain steady growth.' },
  'Pressure Washer':    { pct:  5, label: 'About average', desc: 'Curb-appeal focus among homeowners and growing commercial contracts.' },
  'Window Cleaner':     { pct:  3, label: 'About average', desc: 'Commercial high-rise contracts provide stable base; residential adds variability.' },
  'Appliance Repair':   { pct:  2, label: 'About average', desc: 'Sustainability trends favouring repair over replacement are modestly positive.' },
  'Snow Removal':       { pct:  3, label: 'About average', desc: 'Climate volatility (more intense winter events) offsets mild-season declines in some regions.' },
  'Irrigation Specialist': { pct: 7, label: 'Faster than average', desc: 'Water-efficiency regulations and smart-irrigation adoption are creating upgrade cycles.' },
  'Tile & Stone':       { pct:  4, label: 'About average', desc: 'Kitchen and bath renovation demand is the primary driver.' },
};

// ── BLS API fetch ─────────────────────────────────────────────────────────────

interface BlsObservation { year: string; period: string; periodName: string; value: string; }
interface BlsResponse { Results?: { series?: [{ data?: BlsObservation[] }] } }

async function fetchBlsEmploymentTrend(): Promise<{ trendPct: number; label: string } | null> {
  try {
    const res = await fetch(
      'https://api.bls.gov/publicAPI/v1/timeseries/data/CEU2023830001',
      { next: { revalidate: 86400 } },          // cache 24 h server-side
    );
    if (!res.ok) return null;

    const json = await res.json() as BlsResponse;
    const data = json.Results?.series?.[0]?.data ?? [];

    if (data.length < 6) return null;

    const latest3  = data.slice(0, 3).map((d) => parseFloat(d.value));
    const prior3   = data.slice(3, 6).map((d) => parseFloat(d.value));
    const latestAvg = latest3.reduce((a, b) => a + b, 0) / 3;
    const priorAvg  = prior3.reduce((a, b) => a + b, 0) / 3;
    const trendPct  = ((latestAvg - priorAvg) / priorAvg) * 100;

    const label = trendPct > 0.5
      ? `Up ${trendPct.toFixed(1)}% (3-month)`
      : trendPct < -0.5
        ? `Down ${Math.abs(trendPct).toFixed(1)}% (3-month)`
        : 'Flat (3-month)';

    return { trendPct, label };
  } catch {
    return null;
  }
}

// ── Public function ───────────────────────────────────────────────────────────

export async function fetchMarketTrend(serviceType: string): Promise<MarketTrend> {
  const [blsTrend, ooh] = await Promise.all([
    fetchBlsEmploymentTrend(),
    Promise.resolve(OOH_OUTLOOK[serviceType] ?? { pct: 5, label: 'About average', desc: 'Steady demand expected in line with overall home-services market growth.' }),
  ]);

  const correlation = CONSTRUCTION_CORRELATION[serviceType] ?? 0.50;

  let shortTermPct   = 0;
  let shortTermLabel = 'Stable';
  let dataFresh      = false;

  if (blsTrend) {
    // Scale the construction employment signal by service correlation
    shortTermPct   = blsTrend.trendPct * correlation;
    shortTermLabel = blsTrend.label;
    dataFresh      = true;
  }

  const shortTermDirection: TrendDirection =
    shortTermPct > 0.4 ? 'rising' : shortTermPct < -0.4 ? 'declining' : 'stable';

  return {
    shortTermDirection,
    shortTermPct: Math.round(shortTermPct * 10) / 10,
    shortTermLabel,
    longTermPct: ooh.pct,
    longTermLabel: ooh.label,
    longTermDesc: ooh.desc,
    dataFresh,
  };
}
