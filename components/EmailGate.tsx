'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';

interface EmailGateProps {
  serviceType: string;
  teaserRange?: { low: number; high: number };
  onSubmit: (email: string) => void;
}

export function EmailGate({ serviceType, teaserRange, onSubmit }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onSubmit(trimmed);
  }

  return (
    <div className="email-gate">
      {teaserRange && (
        <div className="email-gate-teaser" style={{ width: '100%' }}>
          <div className="email-gate-teaser-label">Your {serviceType} forecast is ready</div>
          <div className="email-gate-teaser-value">
            ${Math.round(teaserRange.low).toLocaleString()} – ${Math.round(teaserRange.high).toLocaleString()}
            <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--primary-mid)', marginLeft: 6 }}>/mo likely range</span>
          </div>
        </div>
      )}

      <h3>Unlock your full results</h3>
      <p>
        Enter your email to see your expected revenue, market benchmark, upside opportunity,
        and personalized improvement plan — free.
      </p>

      <div className="email-row">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <button className="btn btn-primary" onClick={handleSubmit} style={{ whiteSpace: 'nowrap' }}>
          See results →
        </button>
      </div>

      {error && <div className="email-error">{error}</div>}
      <div className="email-fine-print">No spam &middot; Unsubscribe anytime &middot; Takes 2 seconds</div>
    </div>
  );
}

