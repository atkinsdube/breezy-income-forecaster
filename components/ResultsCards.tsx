'use client';

import { useEffect, useState } from 'react';
import { ForecastChart } from '@/components/ForecastChart';
import { BreezyCta } from '@/components/BreezyCta';
import type { BenchmarkProfile, ForecastResult } from '@/lib/types';

interface StoredForecast {
  forecast: ForecastResult;
  benchmark: BenchmarkProfile;
  email: string;
  serviceType: string;
  city: string;
  state: string;
}

export function ResultsCards() {
  const [data, setData] = useState<StoredForecast | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('breezy_forecast');
      if (raw) setData(JSON.parse(raw) as StoredForecast);
    } catch {
      // ignore
    }
  }, []);

  if (!data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
        No forecast found. <a href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Run the forecast again →</a>
      </div>
    );
  }

  const { forecast, benchmark } = data;
  const location = [data.city, data.state].filter(Boolean).join(', ');
  const upsidePct = forecast.expectedRevenue > 0
    ? Math.round((forecast.upsidePotential / forecast.expectedRevenue) * 100)
    : 0;

  const isLowSeason = benchmark.seasonalMultiplier < 0.5;
  const isOffSeason = benchmark.seasonalMultiplier < 0.1;
  const peakRevenue = isLowSeason && benchmark.peakMonthName
    ? Math.round(forecast.expectedRevenue / benchmark.seasonalMultiplier)
    : null;

  return (
    <div style={{ display: 'grid', gap: 20 }}>

      {/* Seasonal warning */}
      {isLowSeason && benchmark.peakMonthName && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: '#EFF6FF', border: '1px solid #BFDBFE',
          borderRadius: 'var(--r-md)', padding: '16px 20px',
        }}>
          <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>❄️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#1E40AF', marginBottom: 3 }}>
              {isOffSeason ? 'Off-season' : 'Low season'} forecast — {benchmark.forecastMonthName}
            </div>
            <div style={{ fontSize: '0.87rem', color: '#1D4ED8', lineHeight: 1.5 }}>
              {data.serviceType} demand is{' '}
              {Math.round((1 - benchmark.seasonalMultiplier) * 100)}% below the annual average in{' '}
              {benchmark.forecastMonthName}.{peakRevenue !== null && (
                <> At peak season ({benchmark.peakMonthName}), a comparable business could expect
                  around <strong>${peakRevenue.toLocaleString()}/mo</strong>.</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero revenue */}
      <div className="result-hero">
        <div className="result-hero-eyebrow">Expected monthly revenue</div>
        <div className="result-hero-value">${Math.round(forecast.expectedRevenue).toLocaleString()}</div>
        <div className="result-hero-meta">
          Based on 6,000 simulated scenarios for a {data.serviceType}{location ? ` in ${location}` : ''} &middot; {benchmark.forecastMonthName} forecast
          {isLowSeason && benchmark.peakMonthName && (
            <span style={{ color: '#1D4ED8', marginLeft: 6 }}>
              (low season — peak in {benchmark.peakMonthName})
            </span>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Likely range</div>
          <div className="kpi-value">
            ${Math.round(forecast.lowRevenue).toLocaleString()} &ndash; ${Math.round(forecast.highRevenue).toLocaleString()}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Forecast confidence</div>
          <div className={`kpi-value${forecast.confidenceLabel === 'Higher' ? ' good' : forecast.confidenceLabel === 'Lower' ? ' warn' : ''}`}>
            {forecast.confidenceLabel}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Market benchmark</div>
          <div className="kpi-value">${Math.round(benchmark.marketMonthlyPrior).toLocaleString()}</div>
        </div>
      </div>

      {/* Upside banner */}
      {forecast.upsidePotential > 200 && (
        <div className="upside-banner">
          <div className="upside-icon">💡</div>
          <div>
            <div className="upside-title">
              ~${Math.round(forecast.upsidePotential).toLocaleString()}/mo left on the table
            </div>
            <div className="upside-desc">
              Businesses like yours can earn roughly {upsidePct}% more by improving response speed,
              after-hours coverage, and review count. The gaps are listed below.
            </div>
          </div>
        </div>
      )}

      {/* Chart + recommendations */}
      <div className="results-grid">
        <div className="card">
          <div className="section-title">Revenue scenarios</div>
          <ForecastChart
            low={forecast.lowRevenue}
            expected={forecast.expectedRevenue}
            high={forecast.highRevenue}
          />
        </div>

        <div className="card">
          <div className="section-title">Top improvement levers</div>
          <ul className="rec-list">
            {forecast.recommendations.map((item, i) => (
              <li key={item} className="rec-item">
                <span className="rec-bullet">{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="section-title" style={{ marginTop: 24 }}>Market signals</div>
          <div className="signals-list">
            {[
              { label: 'Competition', val: benchmark.competitionIndex, pct: benchmark.competitionIndex },
              { label: 'Market strength', val: benchmark.marketStrength, pct: benchmark.marketStrength },
              { label: 'Digital strength', val: benchmark.digitalStrength, pct: Math.min(1, (benchmark.digitalStrength - 0.75) / 0.6) },
            ].map(({ label, val, pct }) => (
              <div key={label} className="signal-row">
                <span className="signal-label">{label}</span>
                <div className="signal-bar-wrap">
                  <div className="signal-bar-track">
                    <div className="signal-bar-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
                  </div>
                  <span className="signal-val">{val.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breezy CTA */}
      <BreezyCta recommendations={forecast.recommendations} />

    </div>
  );
}
