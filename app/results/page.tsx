import { Suspense } from 'react';
import { ResultsCards } from '@/components/ResultsCards';

export default function ResultsPage() {
  return (
    <main className="page-shell">
      <div className="container">

        <nav className="topbar" style={{ marginBottom: 32 }}>
          <a href="/" className="wordmark">breezy<span>.</span></a>
          <a href="/" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>← Run another forecast</a>
        </nav>

        <div className="results-hero">
          <span style={{ display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid #F5C9D3', borderRadius: 'var(--r-full)', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: 12 }}>
            Your forecast is ready
          </span>
          <h1>Your projected revenue outlook</h1>
          <p>Blending your inputs with market benchmarks, digital presence signals, and Monte Carlo simulation.</p>
        </div>

        <Suspense fallback={<div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>}>
          <ResultsCards />
        </Suspense>
      </div>
    </main>
  );
}
