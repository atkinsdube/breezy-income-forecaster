'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StepIndicator } from '@/components/StepIndicator';
import { LoadingStage } from '@/components/LoadingStage';
import { EmailGate } from '@/components/EmailGate';
import { ALL_SERVICE_TYPES } from '@/lib/external/bls';
import type { ForecastInput } from '@/lib/types';
import type { ForecastResult, BenchmarkProfile } from '@/lib/types';

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

const TOTAL_STEPS = 5;

const STEP_META = [
  { title: 'Your business', sub: 'What you do and where you operate.' },
  { title: 'Lead flow & pricing', sub: 'How leads become paying jobs.' },
  { title: 'Operations', sub: 'How you handle jobs and customers.' },
  { title: 'Online presence', sub: 'Your digital footprint and reviews.' },
  { title: 'Ready to forecast', sub: 'Review your inputs before we run the model.' },
];

type Phase = 'form' | 'loading' | 'email';

interface ForecastPayload {
  forecast: ForecastResult;
  benchmark: BenchmarkProfile;
}

export function WizardForm() {
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<Phase>('form');
  const [form, setForm] = useState<ForecastInput>(initialState);
  const [payload, setPayload] = useState<ForecastPayload | null>(null);
  const router = useRouter();

  const meta = useMemo(() => STEP_META[step - 1], [step]);

  function update<K extends keyof ForecastInput>(key: K, value: ForecastInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    setPhase('loading');
    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as ForecastPayload;
      setPayload(data);
      setPhase('email');
    } catch {
      setPhase('form');
    }
  }

  function handleEmailSubmit(email: string) {
    if (!payload) return;
    sessionStorage.setItem('breezy_forecast', JSON.stringify({ ...payload, email, serviceType: form.serviceType, city: form.city, state: form.state }));
    router.push('/results');
  }

  if (phase === 'loading') {
    return <Card><LoadingStage /></Card>;
  }

  if (phase === 'email') {
    return (
      <Card>
        <EmailGate
          serviceType={form.serviceType}
          teaserRange={payload ? { low: payload.forecast.lowRevenue, high: payload.forecast.highRevenue } : undefined}
          onSubmit={handleEmailSubmit}
        />
      </Card>
    );
  }

  return (
    <Card>
      <StepIndicator current={step} total={TOTAL_STEPS} />

      <div className="step-header">
        <h2>{meta.title}</h2>
        <p>{meta.sub}</p>
      </div>

      {step === 1 && (
        <div className="form-grid">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Service type</label>
            <Select value={form.serviceType} onChange={(e) => update('serviceType', e.target.value)}>
              {ALL_SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div className="field">
            <label className="label">City</label>
            <Input value={form.city} placeholder="e.g. Austin" onChange={(e) => update('city', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">State</label>
            <Input value={form.state} placeholder="e.g. TX" onChange={(e) => update('state', e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Business name <span className="label-hint">Optional — used to look up your Google reviews</span></label>
            <Input value={form.businessName ?? ''} placeholder="e.g. Joe's Plumbing" onChange={(e) => update('businessName', e.target.value)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-grid">
          <div className="field">
            <label className="label">Leads per month<span className="label-hint">Calls, texts, form fills, etc.</span></label>
            <Input type="number" value={form.monthlyLeads} onChange={(e) => update('monthlyLeads', Number(e.target.value))} />
          </div>
          <div className="field">
            <label className="label">Booking rate<span className="label-hint">Share of leads that book a job (0–1)</span></label>
            <Input type="number" step="0.01" min="0" max="1" value={form.bookingRate} onChange={(e) => update('bookingRate', Number(e.target.value))} />
          </div>
          <div className="field">
            <label className="label">Average job value<span className="label-hint">Revenue per completed job</span></label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">$</span>
              <Input type="number" value={form.averageJobValue} onChange={(e) => update('averageJobValue', Number(e.target.value))} />
            </div>
          </div>
          <div className="field">
            <label className="label">Jobs completed / month<span className="label-hint">Your current output</span></label>
            <Input type="number" value={form.jobsCompletedPerMonth} onChange={(e) => update('jobsCompletedPerMonth', Number(e.target.value))} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-grid">
          <div className="field">
            <label className="label">Average response time<span className="label-hint">How fast you reply to new inquiries</span></label>
            <Select value={form.responseTimeBucket} onChange={(e) => update('responseTimeBucket', e.target.value as ForecastInput['responseTimeBucket'])}>
              <option>Under 5 min</option>
              <option>5-15 min</option>
              <option>15-60 min</option>
              <option>1-4 hr</option>
              <option>Over 4 hr</option>
            </Select>
          </div>
          <div className="field">
            <label className="label">After-hours coverage<span className="label-hint">Do you take calls/texts outside business hours?</span></label>
            <Select value={String(form.afterHoursCoverage)} onChange={(e) => update('afterHoursCoverage', e.target.value === 'true')}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Select>
          </div>
          <div className="field">
            <label className="label">Cancellation rate<span className="label-hint">Share of booked jobs that cancel (0–1)</span></label>
            <Input type="number" step="0.01" min="0" max="1" value={form.cancellationRate} onChange={(e) => update('cancellationRate', Number(e.target.value))} />
          </div>
          <div className="field">
            <label className="label">Repeat customer rate<span className="label-hint">Share of jobs from returning customers (0–1)</span></label>
            <Input type="number" step="0.01" min="0" max="1" value={form.repeatCustomerRate} onChange={(e) => update('repeatCustomerRate', Number(e.target.value))} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="form-grid">
          <div className="field">
            <label className="label">Review rating<span className="label-hint">Your average Google / Yelp rating</span></label>
            <Input type="number" step="0.1" min="0" max="5" value={form.reviewRating} onChange={(e) => update('reviewRating', Number(e.target.value))} />
          </div>
          <div className="field">
            <label className="label">Number of reviews<span className="label-hint">Total published reviews</span></label>
            <Input type="number" min="0" value={form.reviewCount} onChange={(e) => update('reviewCount', Number(e.target.value))} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Website URL <span className="label-hint">Optional — used to check your page speed score</span></label>
            <Input value={form.websiteUrl ?? ''} placeholder="https://yourbusiness.com" onChange={(e) => update('websiteUrl', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Solo operator?</label>
            <Select value={String(form.soloOperator)} onChange={(e) => update('soloOperator', e.target.value === 'true')}>
              <option value="true">Yes, just me</option>
              <option value="false">I have a team</option>
            </Select>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card-flat">
          <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: 'var(--muted)' }}>
            We&apos;ll run 6,000 Monte Carlo simulations using your inputs and local market data to
            estimate your likely revenue range and where you&apos;re leaving money on the table.
          </p>
          <ul className="review-list">
            <li className="review-row"><span className="review-key">Service</span><span className="review-val">{form.serviceType}</span></li>
            <li className="review-row"><span className="review-key">Market</span><span className="review-val">{form.city || '—'}, {form.state || '—'}</span></li>
            <li className="review-row"><span className="review-key">Monthly leads</span><span className="review-val">{form.monthlyLeads} leads at {(form.bookingRate * 100).toFixed(0)}% booking</span></li>
            <li className="review-row"><span className="review-key">Average job value</span><span className="review-val">${form.averageJobValue.toLocaleString()}</span></li>
            <li className="review-row"><span className="review-key">Reviews</span><span className="review-val">{form.reviewRating}★ &middot; {form.reviewCount} reviews</span></li>
            <li className="review-row"><span className="review-key">Response time</span><span className="review-val">{form.responseTimeBucket}</span></li>
          </ul>
        </div>
      )}

      <div className="button-row">
        <button
          className="btn btn-secondary"
          disabled={step === 1}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </button>
        {step < TOTAL_STEPS ? (
          <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
            Continue →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleGenerate}>
            Run my forecast →
          </button>
        )}
      </div>
    </Card>
  );
}
