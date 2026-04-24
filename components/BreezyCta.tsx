'use client';

interface BreezyCtaProps {
  recommendations: string[];
}

// Maps each recommendation keyword to which Breezy feature solves it
const FEATURE_MAP: { match: string; icon: string; label: string; desc: string }[] = [
  {
    match: 'response speed',
    icon: '⚡',
    label: 'Instant response',
    desc: 'AI answers every call & text in under 1 second, 24/7',
  },
  {
    match: 'after-hours',
    icon: '🌙',
    label: 'After-hours AI',
    desc: 'Never miss a lead again — Breezy works while you sleep',
  },
  {
    match: 'review',
    icon: '⭐',
    label: 'Review requests',
    desc: 'Auto-sends review requests after every completed job',
  },
  {
    match: 'cancellation',
    icon: '📅',
    label: 'Smart scheduling',
    desc: 'Automated reminders cut no-shows and last-minute cancels',
  },
  {
    match: 'repeat',
    icon: '🔄',
    label: 'Customer reactivation',
    desc: 'Re-engages past customers with timely follow-up messages',
  },
  {
    match: 'follow-up',
    icon: '💬',
    label: 'Lead follow-up',
    desc: 'Follows up with every lead until they book or opt out',
  },
];

export function BreezyCta({ recommendations }: BreezyCtaProps) {
  const combined = recommendations.join(' ').toLowerCase();

  const matchedFeatures = FEATURE_MAP.filter((f) => combined.includes(f.match));
  const features = matchedFeatures.length >= 2
    ? matchedFeatures.slice(0, 3)
    : FEATURE_MAP.slice(0, 3);

  return (
    <div className="breezy-cta">
      <div>
        <h3>Breezy fixes every one of these gaps — automatically.</h3>
        <p>
          The recommendations above aren&apos;t just suggestions. They&apos;re exactly what Breezy&apos;s
          AI front desk handles for hundreds of solo service professionals every day.
        </p>
      </div>

      <div className="breezy-cta-features">
        {features.map((f) => (
          <div key={f.label} className="breezy-cta-feature">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-label">Breezy handles</div>
            <div className="feature-desc">{f.label}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="breezy-cta-actions">
        <a
          href="https://www.usebreezy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="button-cta"
        >
          Try Breezy free for 14 days
        </a>
        <span className="cta-subtext">No credit card required &middot; Setup in 5 minutes</span>
      </div>
    </div>
  );
}
