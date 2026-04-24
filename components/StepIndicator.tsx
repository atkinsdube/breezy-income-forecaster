interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  const items = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="step-indicator">
      {items.map((n) => {
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} style={{ display: 'contents' }}>
            <div className={`step-dot${done ? ' done' : active ? ' active' : ''}`}>
              {done ? (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : n}
            </div>
            {n < total && (
              <div className={`step-line${done ? ' done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
