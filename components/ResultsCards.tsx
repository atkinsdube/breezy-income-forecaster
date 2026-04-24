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

  return (
    <div style={{ display: 'grid', gap: 20 }}>

      {/* Hero revenue */}
      <div className="result-hero">
        <div className="result-hero-eyebrow">Expected monthly revenue</div>
        <div className="result-hero-value">${Math.round(forecast.expectedRevenue).toLocaleString()}</div>
        <div className="result-hero-meta">
          Based on 6,000 simulated scenarios for a {data.serviceType}{location ? ` in ${location}` : ''}
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
