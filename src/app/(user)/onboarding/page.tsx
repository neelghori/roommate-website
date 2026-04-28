'use client';

/**
 * onboarding/page.tsx
 * 3-step onboarding flow — purpose, preferences, lifestyle.
 * Controlled state only (no React Hook Form).
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  LayoutGrid,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ── Types ───────────────────────────────────────────────────────────────────

type Purpose = 'find-roommate' | 'list-property' | 'both' | null;
type Gender = 'any' | 'male' | 'female';

interface OnboardingData {
  purpose: Purpose;
  // Step 2
  budgetMin: number;
  budgetMax: number;
  city: string;
  gender: Gender;
  moveInDate: string;
  // Step 3
  lifestyle: string[];
  bio: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 3;

const LIFESTYLE_TAGS = [
  'Student',
  'Working Professional',
  'Vegetarian',
  'Non-Veg',
  'Non-Smoker',
  'Smoker',
  'Pet Friendly',
  'Night Owl',
  'Early Bird',
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (val: number) =>
  val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`;

// ── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                  active ? 'text-white shadow-md' : done ? 'text-white' : 'text-gray-400 bg-gray-100',
                ].join(' ')}
                style={
                  active
                    ? { backgroundColor: '#1B8F8F' }
                    : done
                    ? { backgroundColor: '#1B8F8F', opacity: 0.6 }
                    : undefined
                }
              >
                {done ? <CheckCircle2 size={14} /> : step}
              </div>
            </div>
            {step < total && (
              <div
                className="h-0.5 flex-1 max-w-12 rounded-full transition-all duration-300"
                style={{ backgroundColor: step < current ? '#1B8F8F' : '#e5e7eb' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Purpose ──────────────────────────────────────────────────────────

interface Step1Props {
  purpose: Purpose;
  setPurpose: (p: Purpose) => void;
}

function Step1({ purpose, setPurpose }: Step1Props) {
  const options: { value: Exclude<Purpose, null>; label: string; desc: string; Icon: React.FC<{ size: number }> }[] = [
    { value: 'find-roommate', label: 'Find a Roommate', desc: 'Browse listings and connect with potential roommates.', Icon: Search },
    { value: 'list-property', label: 'List My Property', desc: 'Post your room or property for tenants to find.', Icon: Building2 },
    { value: 'both', label: 'Both', desc: 'Find roommates and list your property at the same time.', Icon: LayoutGrid },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">What are you looking for?</h2>
        <p className="text-sm text-gray-500 mt-1">Select one to personalise your experience</p>
      </div>
      <div className="flex flex-col gap-3 mt-2">
        {options.map(({ value, label, desc, Icon }) => {
          const active = purpose === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setPurpose(value)}
              className={[
                'flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200',
                active ? 'shadow-sm' : 'border-gray-100 bg-white hover:border-teal-200',
              ].join(' ')}
              style={active ? { borderColor: '#1B8F8F', backgroundColor: '#EDF5F5' } : undefined}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl mt-0.5"
                style={{ backgroundColor: active ? '#1B8F8F' : '#f3f4f6', color: active ? '#fff' : '#6b7280' }}
              >
                <Icon size={20} />
              </div>
              <div>
                <p className={['font-semibold text-sm', active ? '' : 'text-gray-700'].join(' ')}
                   style={active ? { color: '#1B8F8F' } : undefined}>
                  {label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Preferences ──────────────────────────────────────────────────────

interface Step2Props {
  data: Pick<OnboardingData, 'budgetMin' | 'budgetMax' | 'city' | 'gender' | 'moveInDate'>;
  onChange: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

function Step2({ data, onChange }: Step2Props) {
  const BUDGET_MIN = 3000;
  const BUDGET_MAX = 50000;

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Preferences</h2>
        <p className="text-sm text-gray-500 mt-1">Tell us what you&apos;re looking for</p>
      </div>

      {/* Budget Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Budget Range
        </label>
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: '#EDF5F5' }}
        >
          <div className="flex justify-between text-sm font-semibold" style={{ color: '#1B8F8F' }}>
            <span>{formatCurrency(data.budgetMin)}</span>
            <span>{formatCurrency(data.budgetMax)}</span>
          </div>
          {/* Min slider */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Minimum</span>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={1000}
              value={data.budgetMin}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChange('budgetMin', Math.min(val, data.budgetMax - 1000));
              }}
              className="w-full accent-teal-600 h-2 rounded-full"
              style={{ accentColor: '#1B8F8F' }}
            />
          </div>
          {/* Max slider */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Maximum</span>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={1000}
              value={data.budgetMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChange('budgetMax', Math.max(val, data.budgetMin + 1000));
              }}
              className="w-full h-2 rounded-full"
              style={{ accentColor: '#1B8F8F' }}
            />
          </div>
        </div>
      </div>

      {/* City */}
      <Input
        label="Preferred City"
        type="text"
        placeholder="e.g. Ahmedabad, Mumbai…"
        value={data.city}
        onChange={(e) => onChange('city', e.target.value)}
        leftIcon={<MapPin size={16} />}
      />

      {/* Gender Preference */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Gender Preference</span>
        <div className="grid grid-cols-3 gap-2">
          {GENDER_OPTIONS.map(({ value, label }) => {
            const active = data.gender === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange('gender', value)}
                className={[
                  'py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200',
                  active ? 'text-white' : 'border-gray-200 text-gray-600 bg-white hover:border-teal-300',
                ].join(' ')}
                style={active ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' } : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Move-in Date */}
      <Input
        label="Preferred Move-in Date"
        type="date"
        value={data.moveInDate}
        onChange={(e) => onChange('moveInDate', e.target.value)}
        leftIcon={<Calendar size={16} />}
      />
    </div>
  );
}

// ── Step 3: Lifestyle ────────────────────────────────────────────────────────

interface Step3Props {
  lifestyle: string[];
  bio: string;
  onToggleTag: (tag: string) => void;
  onBioChange: (bio: string) => void;
}

function Step3({ lifestyle, bio, onToggleTag, onBioChange }: Step3Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Lifestyle</h2>
        <p className="text-sm text-gray-500 mt-1">Select all that apply</p>
      </div>

      {/* Lifestyle Tags */}
      <div className="flex flex-wrap gap-2">
        {LIFESTYLE_TAGS.map((tag) => {
          const selected = lifestyle.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={[
                'px-3.5 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200',
                selected ? 'text-white' : 'border-gray-200 text-gray-600 bg-white hover:border-teal-300',
              ].join(' ')}
              style={selected ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' } : undefined}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Bio{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Tell potential roommates a bit about yourself…"
          rows={4}
          maxLength={300}
          className="w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 px-3 py-2.5 resize-none transition-all duration-200 focus:outline-none"
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#1B8F8F';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27,143,143,0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <div className="flex justify-end">
          <span className="text-xs text-gray-400">{bio.length}/300</span>
        </div>
      </div>

      {/* Selected summary */}
      {lifestyle.length > 0 && (
        <div
          className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
          style={{ backgroundColor: '#EDF5F5', color: '#1B8F8F' }}
        >
          <User size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">{lifestyle.length}</span>{' '}
            {lifestyle.length === 1 ? 'tag' : 'tags'} selected: {lifestyle.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { success } = useToast();
  const [step, setStep] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    purpose: null,
    budgetMin: 5000,
    budgetMax: 20000,
    city: '',
    gender: 'any',
    moveInDate: '',
    lifestyle: [],
    bio: '',
  });

  const updateField = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleLifestyleTag = (tag: string) => {
    setData((prev) => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(tag)
        ? prev.lifestyle.filter((t) => t !== tag)
        : [...prev.lifestyle, tag],
    }));
  };

  const canProceed = () => {
    if (step === 1) return data.purpose !== null;
    return true; // steps 2 and 3 are optional
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    // Simulate saving preferences
    await new Promise((r) => setTimeout(r, 800));
    success('Profile setup complete!', 'Welcome to Roommat!');
    router.push('/');
  };

  const stepLabels = ['Purpose', 'Preferences', 'Lifestyle'];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EDF5F5' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <span className="text-lg font-bold" style={{ color: '#1B8F8F' }}>
          Roommat
        </span>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-md">
          {/* Step label */}
          <p className="text-center text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
            Step {step} of {TOTAL_STEPS} — {stepLabels[step - 1]}
          </p>

          {/* Progress indicator */}
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[420px] flex flex-col">
            <div className="flex-1">
              {step === 1 && (
                <Step1
                  purpose={data.purpose}
                  setPurpose={(p) => updateField('purpose', p)}
                />
              )}
              {step === 2 && (
                <Step2
                  data={{
                    budgetMin: data.budgetMin,
                    budgetMax: data.budgetMax,
                    city: data.city,
                    gender: data.gender,
                    moveInDate: data.moveInDate,
                  }}
                  onChange={updateField}
                />
              )}
              {step === 3 && (
                <Step3
                  lifestyle={data.lifestyle}
                  bio={data.bio}
                  onToggleTag={toggleLifestyleTag}
                  onBioChange={(bio) => updateField('bio', bio)}
                />
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  leftIcon={<ChevronLeft size={16} />}
                  className="flex-1"
                >
                  Back
                </Button>
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth={step === 1}
                  onClick={handleNext}
                  disabled={!canProceed()}
                  rightIcon={<ChevronRight size={16} />}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleFinish}
                  isLoading={isFinishing}
                  className="flex-1"
                >
                  {isFinishing ? 'Saving…' : 'Finish'}
                </Button>
              )}
            </div>
          </div>

          {/* Step dots (alternative indicator at bottom) */}
          <div className="flex justify-center gap-1.5 mt-5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i + 1 === step ? 24 : 8,
                  backgroundColor: i + 1 === step ? '#1B8F8F' : i + 1 < step ? '#1B8F8F' : '#d1d5db',
                  opacity: i + 1 < step ? 0.5 : 1,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
