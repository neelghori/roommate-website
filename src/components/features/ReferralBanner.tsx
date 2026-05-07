/**
 * ReferralBanner.tsx
 * Orange referral banner from the mockup.
 *
 * Features:
 * - Orange (#F57C00) background
 * - "EXCLUSIVE DEAL" label
 * - "Refer a friend & get ₹500 Cashback!" heading
 * - "Invite Now" button (white bg, orange text)
 * - Carousel dots + prev/next arrows
 * - Right side: abstract geometric decoration
 */
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface BannerSlide {
  tag: string;
  heading: string;
  subtext: string;
  buttonLabel: string;
  accentColor: string;
  textColor: string;
}

// Multiple slides for carousel extend as needed
const SLIDES: BannerSlide[] = [
  {
    tag: 'EXCLUSIVE DEAL',
    heading: 'Refer a friend & get ₹500 Cashback!',
    subtext: 'Share your referral code and earn on every sign-up.',
    buttonLabel: 'Invite Now',
    accentColor: 'bg-secondary',
    textColor: 'text-secondary',
  },
  {
    tag: 'LIMITED TIME',
    heading: 'Post your listing for FREE this week!',
    subtext: 'No charges for new listings posted before Sunday.',
    buttonLabel: 'Post Listing',
    accentColor: 'bg-primary',
    textColor: 'text-primary',
  },
  {
    tag: 'NEW FEATURE',
    heading: 'Verified Badge build trust instantly',
    subtext: 'Complete Aadhar verification and get a verified badge.',
    buttonLabel: 'Get Verified',
    accentColor: 'bg-green-600',
    textColor: 'text-green-600',
  },
];

interface ReferralBannerProps {
  onInvite?: () => void;
}

export const ReferralBanner: React.FC<ReferralBannerProps> = ({ onInvite }) => {
  const [current, setCurrent] = useState(0);
  const toast = useToast();

  const prev = () => setCurrent((c) => (c === 0 ? SLIDES.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === SLIDES.length - 1 ? 0 : c + 1));

  const slide = SLIDES[current];

  const handleCTA = () => {
    if (current === 0) {
      onInvite?.();
      toast.success('Invite link copied!', 'Share it with friends to earn ₹500 cashback.');
    } else if (current === 1) {
      toast.info('Redirecting...', 'Opening Post Listing form.');
    } else {
      toast.info('Opening verification...', 'Please upload your Aadhar card.');
    }
  };

  return (
    <div
      className={['relative w-full rounded-2xl overflow-hidden', slide.accentColor].join(' ')}
      role="region"
      aria-label="Promotional banner"
    >
      {/* Geometric decoration (right side) */}
      <div className="absolute right-0 top-0 bottom-0 w-28 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Circles */}
        <div
          className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
          style={{ backgroundColor: 'white' }}
        />
        <div
          className="absolute -right-2 top-8 w-16 h-16 rounded-full opacity-15"
          style={{ backgroundColor: 'white' }}
        />
        <div
          className="absolute right-4 bottom-2 w-10 h-10 rounded-full opacity-20"
          style={{ backgroundColor: 'white' }}
        />
        <div
          className="absolute -right-4 bottom-8 w-20 h-20 rounded-full opacity-10"
          style={{ backgroundColor: 'white' }}
        />
      </div>

      <div className="relative z-10 p-4 pr-16">
        {/* Tag */}
        <div className="flex items-center gap-1.5 mb-2">
          <Gift size={12} className="text-white opacity-90" />
          <span className="text-[10px] font-bold text-white opacity-80 tracking-widest uppercase">
            {slide.tag}
          </span>
        </div>

        {/* Heading */}
        <h3 className="text-base font-bold text-white leading-snug mb-1">
          {slide.heading}
        </h3>

        {/* Subtext */}
        <p className="text-xs text-white/80 mb-3">{slide.subtext}</p>

        {/* CTA button */}
        <button
          onClick={handleCTA}
          className={['inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90 active:opacity-80 bg-white', (slide as any).textColor].join(' ')}
        >
          {slide.buttonLabel}
        </button>
      </div>

      {/* ── Carousel controls ───────────────────────────── */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
        {/* Prev */}
        <button
          onClick={prev}
          className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={[
                'rounded-full transition-all duration-200',
                idx === current ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50',
              ].join(' ')}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === current ? 'true' : undefined}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={next}
          className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
