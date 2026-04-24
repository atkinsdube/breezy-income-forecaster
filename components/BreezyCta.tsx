'use client';

const FEATURE_MAP = [
  { match: 'response speed', icon: '⚡', label: 'Instant response', desc: 'Answers every call & text in under 1 second — 24/7' },
  { match: 'after-hours',    icon: '🌙', label: 'After-hours AI',   desc: 'Never miss a lead again — Breezy works while you sleep' },
  { match: 'review',         icon: '⭐', label: 'Review requests',  desc: 'Auto-sends review requests after every completed job' },
  { match: 'cancellation',   icon: '📅', label: 'Smart scheduling', desc: 'Automated reminders cut no-shows and last-minute cancels' },
  { match: 'repeat',         icon: '🔄', label: 'Reactivation',     desc: 'Re-engages past customers with timely follow-up messages' },
  { match: 'follow-up',      icon: '💬', label: 'Lead follow-up',   desc: 'Follows up with every lead until they book or opt out' },
];

export function BreezyCta({ recommendations }: { recommendations: string[] }) {
  const combined = recommendations.join(' ').toLowerCase();
  const matched = FEATURE_MAP.filter((f) => combined.includes(f.match));
  const features = matched.length >= 2 ? matched.slice(0, 3) : FEATURE_MAP.slice(0, 3);

  return (
    <div className="breezy-cta">
      <div className="breezy-cta-header">
        <h3>Breezy fixes every one of these gaps — automatically.</h3>
        <p>
          The recommendations above aren&apos;t just suggestions. They&apos;re exactly what
          Breezy&apos;s AI front desk handles for hundreds of solo service pros every day —
          so you can focus on the work, not the phone.
        </p>
      </div>

      <div className="cta-features">
        {features.map((f) => (
          <div key={f.label} className="cta-feature">
            <div className="cta-feature-icon">{f.icon}</div>
            <div className="cta-feature-label">Breezy handles</div>
            <div className="cta-feature-name">{f.label}</div>
            <div className="cta-feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="cta-actions">
        <a href="https://www.usebreezy.com" target="_blank" rel="noopener noreferrer" className="btn btn-cta">
          Try Breezy free for 14 days
        </a>
        <button className="btn btn-ghost">Watch a 2-min demo</button>
        <span className="cta-fine-print">No credit card &middot; Setup in 5 minutes</span>
      </div>
    </div>
  );
}
