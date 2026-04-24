'use client';

import { useEffect, useMemo, useState } from 'react';

const stages = [
  'Finding similar businesses in your market',
  'Estimating local demand and competition',
  'Analyzing reviews and digital presence',
  'Running thousands of revenue simulations',
];

export function LoadingStage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % stages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const text = useMemo(() => stages[index], [index]);

  return (
    <div className="loading-wrap">
      <img src="/analyst.svg" alt="AI analyst illustration" />
      <div>
        <h3 style={{ marginBottom: 8 }}>Building your forecast</h3>
        <div className="loading-stage">{text}...</div>
      </div>
    </div>
  );
}
