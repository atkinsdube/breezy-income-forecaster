'use client';

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ReferenceDot, BarChart, Bar, Cell, LabelList,
} from 'recharts';
import {
  optimizePrice, analyzeSensitivity, analyzeCapacity, computeClv, computeBreakEven,
} from '@/lib/optimize';
import type { BenchmarkProfile, ForecastInput, ForecastResult } from '@/lib/types';

interface Props {
  input: ForecastInput;
  benchmark: BenchmarkProfile;
  forecast: ForecastResult;
}

// ── Capacity status colours ──────────────────────────────────────────────────

const CAPACITY_COLOR: Record<string, string> = {
  underutilized: '#065F46',
  healthy: '#065F46',
  'near-limit': '#92400E',
  'over-limit': '#DC2626',
};

const CAPACITY_LABEL: Record<string, string> = {
  underutilized: 'Under-utilised — room to grow',
  healthy: 'Healthy utilisation',
  'near-limit': 'Near capacity — consider systemising',
  'over-limit': 'Over capacity — risk of burnout',
};

// ── Tiny section header ──────────────────────────────────────────────────────

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{sub}</div>
    </div>
  );
}

// ── Pill badge ───────────────────────────────────────────────────────────────

function Pill({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', background: bg, color,
      borderRadius: 'var(--r-full)', padding: '3px 10px',
      fontSize: '0.78rem', fontWeight: 700,
    }}>{children}</span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function OptimizationInsights({ input, benchmark, forecast }: Props) {
  const price    = optimizePrice(input);
  const tornado  = analyzeSensitivity(input, benchmark);
  const capacity = analyzeCapacity(input);
  const clv      = computeClv(input);
  const breakEven = computeBreakEven(forecast.expectedRevenue);

  const isPriceSuboptimal = price.upliftPct >= 3;

  return (
    <div style={{ display: 'grid', gap: 20 }}>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 3, height: 24, background: 'var(--primary)', borderRadius: 2, flexShrink: 0,
        }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            Optimisation Analysis
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            Price elasticity modelling · Sensitivity analysis · Capacity utilisation · CLV
          </div>
        </div>
      </div>

      {/* Row 1: Price curve + Tornado */}
      <div className="results-grid">

        {/* ── Price Optimisation ── */}
        <div className="card">
          <SectionHead
            title="Price optimisation"
            sub={`Revenue-maximising price for ${input.serviceType} (demand-elasticity model)`}
          />

          {isPriceSuboptimal ? (
            <div style={{
              background: 'var(--upside-bg)', border: '1px solid #FDE68A',
              borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: 14,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--upside-text)', fontWeight: 600 }}>
                Optimal price: <strong>${price.optimalPrice.toLocaleString()}</strong>
                <span style={{ fontWeight: 400 }}> vs your current ${price.currentPrice.toLocaleString()}</span>
              </span>
              <Pill color="#78350F" bg="#FEF3C7">+{price.upliftPct}% rev</Pill>
            </div>
          ) : (
            <div style={{
              background: 'var(--success-light)', border: '1px solid #6EE7B7',
              borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: 14,
              fontSize: '0.88rem', color: '#065F46', fontWeight: 600,
            }}>
              You&apos;re near the revenue-maximising price for your trade.
            </div>
          )}

          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={price.curve} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                <XAxis
                  dataKey="price"
                  tickFormatter={(v: number) => `$${v}`}
                  tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Est. monthly revenue']}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }}
                />
                <ReferenceLine
                  x={price.currentPrice}
                  stroke="var(--muted-light)" strokeDasharray="4 3"
                  label={{ value: 'Now', position: 'top', fontSize: 10, fill: 'var(--muted)' }}
                />
                {isPriceSuboptimal && (
                  <ReferenceLine
                    x={price.optimalPrice}
                    stroke="var(--primary)" strokeDasharray="4 3"
                    label={{ value: 'Optimal', position: 'top', fontSize: 10, fill: 'var(--primary)' }}
                  />
                )}
                <Line
                  type="monotone" dataKey="revenue"
                  stroke="var(--primary)" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 4 }}
                />
                <ReferenceDot
                  x={price.optimalPrice} y={price.optimalRevenue}
                  r={5} fill="var(--primary)" stroke="white" strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
            Modelled using price-demand elasticity (s = {price.sensitivity.toFixed(2)}) for {input.serviceType}
          </div>
        </div>

        {/* ── Sensitivity Tornado ── */}
        <div className="card">
          <SectionHead
            title="Revenue sensitivity"
            sub="Which lever moves your revenue the most? (±15% change per variable)"
          />

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart
                data={tornado}
                layout="vertical"
                margin={{ top: 4, right: 48, left: 4, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  type="category" dataKey="label" width={110}
                  tick={{ fontSize: 11, fill: 'var(--text)' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [`+$${v.toLocaleString()}/mo`, '15% improvement']}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }}
                />
                <Bar dataKey="revenueGain" radius={[0, 6, 6, 0]}>
                  {tornado.map((item, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? 'var(--primary)' : i === 1 ? '#BF2D4D' : '#D4899A'}
                    />
                  ))}
                  <LabelList
                    dataKey="revenueGainPct"
                    position="right"
                    formatter={(v: number) => `+${v}%`}
                    style={{ fontSize: 10, fill: 'var(--muted)', fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4, textAlign: 'center' }}>
            Top lever: <strong style={{ color: 'var(--text)' }}>{tornado[0]?.label}</strong>
            {' '}(+{tornado[0]?.revenueGainPct}% revenue from 15% improvement)
          </div>
        </div>
      </div>

      {/* Row 2: Capacity + CLV + Break-even */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>

        {/* ── Capacity ── */}
        <div className="card">
          <SectionHead
            title="Capacity utilisation"
            sub={`~${capacity.avgJobHours}h avg job · 22 working days`}
          />

          {/* Gauge bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>
                {capacity.utilizationPct}%
              </span>
              <Pill
                color={CAPACITY_COLOR[capacity.status]}
                bg={capacity.status === 'over-limit' ? '#FEE2E2' : capacity.status === 'near-limit' ? '#FEF3C7' : '#ECFDF5'}
              >
                {capacity.status.replace('-', ' ')}
              </Pill>
            </div>

            <div style={{ width: '100%', height: 8, background: 'var(--border)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
              <div style={{
                width: `${capacity.utilizationPct}%`,
                height: '100%',
                background: CAPACITY_COLOR[capacity.status],
                borderRadius: 'var(--r-full)',
                transition: 'width 0.6s ease',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.78rem', color: 'var(--muted)' }}>
              <span>{capacity.currentJobs} jobs/mo</span>
              <span>Max: {capacity.maxCapacity}</span>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            {CAPACITY_LABEL[capacity.status]}.
            {capacity.headroomJobs > 0 && (
              <> Headroom:{' '}
                <strong style={{ color: 'var(--text)' }}>
                  {capacity.headroomJobs} more jobs (${capacity.headroomRevenue.toLocaleString()}/mo)
                </strong>
              </>
            )}
          </div>
        </div>

        {/* ── CLV ── */}
        <div className="card">
          <SectionHead
            title="Customer lifetime value"
            sub="Geometric series · current retention rate"
          />

          <div style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: 6 }}>
            ${clv.clv.toLocaleString()}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Each customer is worth ~${clv.clv.toLocaleString()} in lifetime revenue at your current
            {' '}{(input.repeatCustomerRate * 100).toFixed(0)}% repeat rate.
          </div>

          {clv.repeatImpactMonthly > 0 && (
            <div style={{
              background: 'var(--primary-light)', border: '1px solid #F5C9D3',
              borderRadius: 'var(--r-sm)', padding: '10px 12px',
              fontSize: '0.83rem', color: 'var(--primary)', fontWeight: 600,
            }}>
              Improving repeat rate by 5 pp could add ~${clv.repeatImpactMonthly.toLocaleString()}/mo
            </div>
          )}
        </div>

        {/* ── Break-even ── */}
        <div className="card">
          <SectionHead
            title="Breezy break-even"
            sub="Based on a conservative 15% booking lift"
          />

          <div style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', color: 'var(--primary)', marginBottom: 6 }}>
            {breakEven.roi12Month}% ROI
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
            At ${breakEven.breezyMonthlyCost}/mo, Breezy would need to generate just{' '}
            <strong style={{ color: 'var(--text)' }}>
              {breakEven.extraJobsNeeded} extra job{breakEven.extraJobsNeeded !== 1 ? 's' : ''}
            </strong>{' '}
            per month to pay for itself — then every job after is pure upside.
          </div>

          <a
            href="https://www.usebreezy.com"
            target="_blank" rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '10px 16px', display: 'inline-flex' }}
          >
            Start free trial →
          </a>
        </div>

      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--muted-light)', textAlign: 'center', paddingTop: 4 }}>
        Price model uses demand-elasticity curves calibrated per trade. Sensitivity uses analytical approximation.
        Capacity assumes {input.soloOperator ? 'solo operator' : 'operator'}, 22 working days × 8h.
      </div>
    </div>
  );
}
