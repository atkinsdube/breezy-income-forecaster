'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EmailGateProps {
  serviceType: string;
  onSubmit: (email: string) => void;
}

export function EmailGate({ serviceType, onSubmit }: EmailGateProps) {
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
      <img src="/analyst.svg" alt="Forecast ready" style={{ width: 120, margin: '0 auto' }} />
      <h3>Your forecast is ready</h3>
      <p>
        Enter your email and we&apos;ll send you the full {serviceType} revenue breakdown — plus
        a free guide on the top levers to grow your monthly income.
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
        <Button onClick={handleSubmit}>See my forecast</Button>
      </div>
      {error && <div className="email-error">{error}</div>}
      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
