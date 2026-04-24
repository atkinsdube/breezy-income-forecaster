import { WizardForm } from '@/components/WizardForm';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="container-narrow">

        <nav className="topbar">
          <div className="wordmark">breezy<span>.</span></div>
          <span className="topbar-tag">Free tool</span>
        </nav>

        <section className="hero">
          <div className="hero-badge">Revenue Forecaster</div>
          <h1>How much could your<br /><em>business make</em> next month?</h1>
          <p>
            Answer 5 quick questions. Get a personalized forecast built from market
            benchmarks, Monte Carlo simulation, and your actual operations.
          </p>
          <div className="trust-row">
            <span className="trust-item">Takes 60 seconds</span>
            <span className="trust-dot" />
            <span className="trust-item">No credit card</span>
            <span className="trust-dot" />
            <span className="trust-item">6,000 simulations run for you</span>
          </div>
        </section>

        <WizardForm />

      </div>
    </main>
  );
}
