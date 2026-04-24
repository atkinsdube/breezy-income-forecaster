'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Select } from '@/components/ui/Select';
import { LoadingStage } from '@/components/LoadingStage';
import { EmailGate } from '@/components/EmailGate';
import type { ForecastInput } from '@/lib/types';

const initialState: ForecastInput = {
  serviceType: 'Plumber',
  city: '',
  state: '',
  soloOperator: true,
  businessName: '',
  websiteUrl: '',
  monthlyLeads: 40,
  bookingRate: 0.45,
  jobsCompletedPerMonth: 16,
  averageJobValue: 300,
  repeatCustomerRate: 0.2,
  cancellationRate: 0.08,
  responseTimeBucket: '15-60 min',
  afterHoursCoverage: false,
  reviewRating: 4.5,
  reviewCount: 35,
};

const totalSteps = 5;

type Phase = 'form' | 'email' | 'loading';

export function WizardForm() {
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<Phase>('form');
  const [form, setForm] = useState<ForecastInput>(initialState);
  const router = useRouter();

  const progress = useMemo(() => (step / totalSteps) * 100, [step]);

  function update<K extends keyof ForecastInput>(key: K, value: ForecastInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function runForecast(email: string) {
    setPhase('loading');

    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      // Store in sessionStorage to avoid URL length limits
      sessionStorage.setItem('breezy_forecast', JSON.stringify({ ...data, email }));
      router.push('/results');
    } catch {
      setPhase('form');
    }
  }

  if (phase === 'loading') {
    return (
      <Card>
        <LoadingStage />
      </Card>
    );
  }

  if (phase === 'email') {
    return (
      <Card>
        <EmailGate serviceType={form.serviceType} onSubmit={runForecast} />
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <strong>Step {step} of {totalSteps}</strong>
          <span style={{ color: '#475569' }}>About 60 seconds</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {step === 1 && (
        <div className="grid grid-2">
          <div>
            <label className="label">Service type</label>
            <Select value={form.serviceType} onChange={(e) => update('serviceType', e.target.value)}>
              <option>Plumber</option>
              <option>Electrician</option>
              <option>Cleaner</option>
              <option>HVAC Technician</option>
              <option>Handyman</option>
              <option>Landscaper</option>
              <option>Painter</option>
              <option>Roofer</option>
            </Select>
          </div>
          <div>
            <label className="label">Business name (optional)</label>
            <Input
              value={form.businessName ?? ''}
              onChange={(e) => update('businessName', e.target.value)}
            />
          </div>
          <div>
            <label className="label">City</label>
            <Input value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <div>
            <label className="label">State</label>
            <Input value={form.state} onChange={(e) => update('state', e.target.value)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-2">
          <div>
            <label className="label">Average leads per month</label>
            <Input
              type="number"
              value={form.monthlyLeads}
              onChange={(e) => update('monthlyLeads', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Booking rate (0 to 1)</label>
            <Input
              type="number"
              step="0.01"
              value={form.bookingRate}
              onChange={(e) => update('bookingRate', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Jobs completed per month</label>
            <Input
              type="number"
              value={form.jobsCompletedPerMonth}
              onChange={(e) => update('jobsCompletedPerMonth', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Average job value ($)</label>
            <Input
              type="number"
              value={form.averageJobValue}
              onChange={(e) => update('averageJobValue', Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-2">
          <div>
            <label className="label">Repeat customer rate (0 to 1)</label>
            <Input
              type="number"
              step="0.01"
              value={form.repeatCustomerRate}
              onChange={(e) => update('repeatCustomerRate', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Cancellation rate (0 to 1)</label>
            <Input
              type="number"
              step="0.01"
              value={form.cancellationRate}
              onChange={(e) => update('cancellationRate', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Average response time</label>
            <Select
              value={form.responseTimeBucket}
              onChange={(e) =>
                update('responseTimeBucket', e.target.value as ForecastInput['responseTimeBucket'])
              }
            >
              <option>Under 5 min</option>
              <option>5-15 min</option>
              <option>15-60 min</option>
              <option>1-4 hr</option>
              <option>Over 4 hr</option>
            </Select>
          </div>
          <div>
            <label className="label">After-hours coverage</label>
            <Select
              value={String(form.afterHoursCoverage)}
              onChange={(e) => update('afterHoursCoverage', e.target.value === 'true')}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Select>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid grid-2">
          <div>
            <label className="label">Website URL (optional)</label>
            <Input
              value={form.websiteUrl ?? ''}
              onChange={(e) => update('websiteUrl', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Review rating</label>
            <Input
              type="number"
              step="0.1"
              value={form.reviewRating}
              onChange={(e) => update('reviewRating', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Number of reviews</label>
            <Input
              type="number"
              value={form.reviewCount}
              onChange={(e) => update('reviewCount', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Solo operator?</label>
            <Select
              value={String(form.soloOperator)}
              onChange={(e) => update('soloOperator', e.target.value === 'true')}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="grid">
          <div className="card" style={{ background: '#f8fbff' }}>
            <h3 style={{ marginTop: 0 }}>Final review</h3>
            <p style={{ color: '#475569' }}>
              We&apos;ll combine your business inputs with market priors, digital presence signals,
              and Monte Carlo simulation to estimate your likely monthly revenue and opportunity
              upside.
            </p>
            <ul className="list">
              <li>
                {form.serviceType} in {form.city}, {form.state}
              </li>
              <li>
                {form.monthlyLeads} leads/month at {(form.bookingRate * 100).toFixed(0)}% booking
                rate
              </li>
              <li>${form.averageJobValue} average job value</li>
              <li>
                {form.reviewRating} stars across {form.reviewCount} reviews
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="button-row">
        <Button variant="secondary" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        {step < totalSteps ? (
          <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
        ) : (
          <Button onClick={() => setPhase('email')}>Generate forecast</Button>
        )}
      </div>
    </Card>
  );
}
