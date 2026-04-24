'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const COLORS = ['#C4A8B2', '#8B1A2F', '#065F46'];

export function ForecastChart({ low, expected, high }: { low: number; expected: number; high: number }) {
  const data = [
    { name: 'Low (10th %)', value: Math.round(low) },
    { name: 'Expected', value: Math.round(expected) },
    { name: 'High (90th %)', value: Math.round(high) },
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7C5C67' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#7C5C67' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monthly Revenue']}
            contentStyle={{ borderRadius: 10, border: '1px solid #EAE0E3', fontSize: 13 }}
            cursor={{ fill: 'rgba(139,26,47,0.04)' }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
