'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const BAR_COLORS = ['#94a3b8', '#2563eb', '#0f766e'];

export function ForecastChart({
  low,
  expected,
  high,
}: {
  low: number;
  expected: number;
  high: number;
}) {
  const data = [
    { name: 'Low (10th %)', value: Math.round(low) },
    { name: 'Expected', value: Math.round(expected) },
    { name: 'High (90th %)', value: Math.round(high) },
  ];

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monthly Revenue']} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
