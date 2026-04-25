'use client';

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine,
} from 'recharts';
import { getSeasonalMultiplier } from '@/lib/seasonality';
import { getGeoAnnualScale } from '@/lib/geography';
import type { BenchmarkProfile, ForecastResult, TrendDirection } from '@/lib/types';

interface Props {
  serviceType: string;
  state: string;
  city: string;
  forecast: ForecastResult;
  benchmark: BenchmarkProfile;
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TREND_COLOR: Record<TrendDirection, string>   = { rising: '#065F46', stable: '#1D4ED8', declining: '#B91C1C' };
const TREND_BG:    Record<TrendDirection, string>   = { rising: '#ECFDF5', stable: '#EFF6FF', declining: '#FEF2F2' };
const TREND_ICON:  Record<TrendDirection, string>   = { rising: '↑', stable: '→', declining: '↓' };
const TREND_LABEL: Record<TrendDirection, string>   = { rising: 'Rising', stable: 'Stable', declining: 'Declining' };

export function MarketTrends({ serviceType, state, city, forecast, benchmark }: Props) {
  const { trend, forecastMonth, totalSeasonalFactor } = benchmark;

  // Build 12-month forward projection from today
  const projection = Array.from({ length: 12 }, (_, i) => {
    const month = (forecastMonth + i) % 12;
    const factor = getSeasonalMultiplier(serviceType, month, state) * getGeoAnnualScale(serviceType, state);
    const revenue = totalSeasonalFactor > 0
      ? Math.round(forecast.expectedRevenue * (factor / totalSeasonalFactor))
      : 0;
    return {
      month: MONTH_SHORT[month],
      revenue,
      isCurrent: i === 0,
    };
  });

  const maxRevenue = Math.max(...projection.map((p) => p.revenue), 1);

  return (
    <div style={{ display: 'grid', gap: 20 }}>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 3, height: 24, background: '#1D4ED8', borderRadius: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            Market Intelligence
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            12-month seasonal forecast · BLS employment trend · 10-year outlook
          </div>
        </div>
      </div>

      <div className="results-grid">

        {/* ── 12-month chart ── */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
            12-month revenue projection
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 16 }}>
            {serviceType} in {city || state || 'your market'} · seasonal &amp; geographic adjustment applied
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={projection} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  axisLine={false} tickLine={false}
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
                  y={forecast.expectedRevenue}
                  stroke="var(--muted-light)" strokeDasharray="4 3"
                  label={{ value: 'Current', position: 'right', fontSize: 9, fill: 'var(--muted)' }}
                />
                <Bar dataKey="revenue" radius={[5, 5, 0, 0]}>
                  {projection.map((p, i) => (
                    <Cell
                      key={i}
                      fill={p.isCurrent ? 'var(--primary)' : p.revenue >= forecast.expectedRevenue ? '#BF2D4D' : 'var(--border)'}
                      opacity={p.revenue === 0 ? 0.3 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} />
              This month
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#BF2D4D', display: 'inline-block' }} />
              Above average
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--border)', display: 'inline-block' }} />
              Below average
            </span>
          </div>
        </div>

        {/* ── Trend cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Short-term */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: 10 }}>
              Short-term demand · 3-month
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: TREND_BG[trend.shortTermDirection],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 800,
                color: TREND_COLOR[trend.shortTermDirection],
              }}>
                {TREND_ICON[trend.shortTermDirection]}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: TREND_COLOR[trend.shortTermDirection] }}>
                  {TREND_LABEL[trend.shortTermDirection]}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {trend.shortTermLabel}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              Based on BLS specialty-trade contractor employment
              {trend.dataFresh
                ? ` (live data, correlated ${Math.round((maxRevenue / Math.max(forecast.expectedRevenue, 1)) * 10) / 10}× for ${serviceType}).`
                : ' (static fallback — BLS API unavailable).'}
            </div>
          </div>

          {/* 10-year outlook */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: 10 }}>
              10-year outlook · BLS OOH 2022–2032
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: trend.longTermPct >= 8 ? '#ECFDF5' : trend.longTermPct >= 4 ? '#EFF6FF' : trend.longTermPct >= 0 ? '#FEF9C3' : '#FEF2F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800,
                color: trend.longTermPct >= 8 ? '#065F46' : trend.longTermPct >= 4 ? '#1D4ED8' : trend.longTermPct >= 0 ? '#78350F' : '#B91C1C',
              }}>
                {trend.longTermPct > 0 ? '+' : ''}{trend.longTermPct}%
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{trend.longTermLabel}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Projected employment change</div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {trend.longTermDesc}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
