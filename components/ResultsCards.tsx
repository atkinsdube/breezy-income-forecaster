'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ForecastChart } from '@/components/ForecastChart';
import { BreezyCta } from '@/components/BreezyCta';
import type { BenchmarkProfile, ForecastResult } from '@/lib/types';

interface StoredForecast {
  forecast: ForecastResult;
  benchmark: BenchmarkProfile;
  email: string;
}

export function ResultsCards() {
  const [data, setData] = useState<StoredForecast | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('breezy_forecast');
      if (raw) setData(JSON.parse(raw) as StoredForecast);
    } catch {
      // ignore parse errors
    }
  }, []);

  if (!data) {
    return (
      <Card>No forecast data found. Please go back and run the forecast again.</Card>
    );
  }

  const { forecast, benchmark } = data;

  return (
    <div className="grid">
      <div className="kpi-grid">
        <div className="kpi">
          <div className="eyebrow">Expected monthly revenue</div>
          <div className="value">${Math.round(forecast.expectedRevenue).toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="eyebrow">Likely range</div>
          <div className="value">
            ${Math.round(forecast.lowRevenue).toLocaleString()} &ndash; $
            {Math.round(forecast.highRevenue).toLocaleString()}
          </div>
        </div>
        <div className="kpi">
          <div className="eyebrow">Forecast confidence</div>
          <div className="value">{forecast.confidenceLabel}</div>
        </div>
        <div className="kpi">
          <div className="eyebrow">Market benchmark</div>
          <div className="value">${Math.round(benchmark.marketMonthlyPrior).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <Card>
          <h3>Revenue scenarios</h3>
          <ForecastChart
            low={forecast.lowRevenue}
            expected={forecast.expectedRevenue}
            high={forecast.highRevenue}
          />
        </Card>

        <Card>
          <h3>Top improvement levers</h3>
          <ul className="list">
            {forecast.recommendations.map((item: string) => (
              <li key={item} style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
          <h3 style={{ marginTop: 20 }}>Signals used</h3>
          <ul className="list">
            <li>Competition index: {benchmark.competitionIndex.toFixed(2)}</li>
            <li>Digital strength score: {benchmark.digitalStrength.toFixed(2)}</li>
            <li>Market strength score: {benchmark.marketStrength.toFixed(2)}</li>
          </ul>
        </Card>
      </div>

      <BreezyCta recommendations={forecast.recommendations} />
    </div>
  );
}
