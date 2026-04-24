import { WizardForm } from '@/components/WizardForm';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="container">
        <section className="hero">
          <span className="badge">Free Revenue Forecast</span>
          <h1>How much could your business make next month?</h1>
          <p>
            Answer 5 quick questions and get a personalized revenue forecast built from market
            benchmarks, your digital presence, and Monte Carlo simulation — in under 60 seconds.
          </p>
        </section>

        <WizardForm />
      </div>
    </main>
  );
}
