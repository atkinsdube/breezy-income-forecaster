'use client';

import { useEffect, useMemo, useState } from 'react';

const stages = [
  'Pulling market benchmarks for your trade',
  'Estimating local demand and competition',
  'Scoring your digital presence signals',
  'Running 6,000 revenue simulations',
];

export function LoadingStage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % stages.length);
    }, 1300);
    return () => clearInterval(interval);
  }, []);

  const text = useMemo(() => stages[index], [index]);

  return (
    <div className="loading-wrap">
      <img src="/analyst.svg" alt="Analyzing" />
      <div>
        <div className="loading-title">Building your forecast</div>
        <div className="loading-stage-row">
          <div className="loading-spinner" />
          <span>{text}...</span>
        </div>
      </div>
    </div>
  );
}
