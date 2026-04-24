import { Suspense } from 'react';
import { ResultsCards } from '@/components/ResultsCards';

export default function ResultsPage() {
  return (
    <main className="page-shell">
      <div className="container">
        <section className="hero">
          <span className="badge">Your Forecast is Ready</span>
          <h1>Your projected revenue outlook</h1>
          <p>
            This forecast blends your inputs with market benchmarks and simulation-based uncertainty.
          </p>
        </section>
        <Suspense fallback={<div className="card">Loading forecast...</div>}>
          <ResultsCards />
        </Suspense>
      </div>
    </main>
  );
}
