/**
 * Vibe-Check Engine — roommate compatibility scoring.
 *
 * Produces a transparent 0–100 compatibility score between the current user's
 * roommate-seeker profile and a candidate {@link RoommateProfile}, plus a list
 * of human-readable reasons explaining the strongest matches.
 *
 * The score is a weighted sum of independent dimensions (weights sum to 100).
 * When a dimension is unknown on either side we award a neutral partial score
 * rather than penalising to zero, so sparse profiles still surface reasonably.
 *
 * All inputs are derived from data the API already returns — no extra fields
 * are required. Lifestyle attributes (diet, smoking, day schedule, pets) are
 * inferred from `lifestyleTags`/`tags` and, when present, the candidate's
 * structured `lifestyleSnippet`.
 */

import type { RoommateProfile } from '@/types';
import type { TenantRoommateProfileMine } from '@/services/modules/tenantRoommateProfile.service';

export interface VibeCheckResult {
  /** Overall compatibility, 0–100 (integer). */
  score: number;
  /** Short, user-facing reasons for the strongest matches, best first. */
  reasons: string[];
}

/** Weight each dimension contributes to the final score. Sums to 100. */
const WEIGHTS = {
  diet: 25,
  smoking: 20,
  schedule: 10,
  budget: 20,
  moveIn: 10,
  sharedTags: 15,
} as const;

/** Neutral credit for a dimension when data is missing on either side. */
const NEUTRAL = 0.6;

type Diet = 'veg' | 'nonveg' | 'unknown';
type Smoking = 'non' | 'smoker' | 'unknown';
type Schedule = 'early' | 'night' | 'unknown';

function normalizeTags(tags: readonly string[] | undefined): Set<string> {
  return new Set((tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean));
}

function dietFromTags(tags: Set<string>, snippetDiet?: string, role?: string): Diet {
  const s = (snippetDiet ?? '').toLowerCase();
  if (s.includes('non') || s.includes('egg')) return 'nonveg';
  if (s.includes('veg') || s.includes('jain')) return 'veg';
  if ((role ?? '').toLowerCase() === 'veg only') return 'veg';
  if (tags.has('non-veg') || tags.has('non veg') || tags.has('nonveg')) return 'nonveg';
  if (tags.has('vegetarian') || tags.has('veg') || tags.has('vegan') || tags.has('jain')) return 'veg';
  return 'unknown';
}

function smokingFromTags(tags: Set<string>, snippetSmoking?: string): Smoking {
  const s = (snippetSmoking ?? '').toLowerCase();
  if (s.includes('non') || s.includes('no')) return 'non';
  if (s.includes('smok') || s.includes('yes') || s.includes('occasional')) return 'smoker';
  if (tags.has('non-smoker') || tags.has('non smoker') || tags.has('no smoking')) return 'non';
  if (tags.has('smoker') || tags.has('smoking')) return 'smoker';
  return 'unknown';
}

function scheduleFromTags(tags: Set<string>): Schedule {
  if (tags.has('early bird') || tags.has('early-bird') || tags.has('morning person')) return 'early';
  if (tags.has('night owl') || tags.has('night-owl') || tags.has('late night')) return 'night';
  return 'unknown';
}

/** 1 when identical, NEUTRAL when unknown on either side, 0 when opposed. */
function matchExclusive<T extends string>(a: T, b: T, unknown: T): number {
  if (a === unknown || b === unknown) return NEUTRAL;
  return a === b ? 1 : 0;
}

/** Budget closeness as ratio of smaller to larger; NEUTRAL when either unknown. */
function budgetScore(a?: number, b?: number): number {
  if (!a || !b || a <= 0 || b <= 0) return NEUTRAL;
  return Math.min(a, b) / Math.max(a, b);
}

/** Move-in timing closeness: 1 within a month, degrading to 0 over ~6 months. */
function moveInScore(a?: string, b?: string): number {
  const da = a ? Date.parse(a) : NaN;
  const db = b ? Date.parse(b) : NaN;
  if (Number.isNaN(da) || Number.isNaN(db)) return NEUTRAL;
  const days = Math.abs(da - db) / 86_400_000;
  if (days <= 30) return 1;
  return Math.max(0, 1 - (days - 30) / 150);
}

/** Overlap of non-core lifestyle tags (excludes diet/smoking/schedule, already scored). */
const CORE_TAGS = new Set([
  'vegetarian', 'veg', 'vegan', 'jain', 'non-veg', 'non veg', 'nonveg',
  'non-smoker', 'non smoker', 'no smoking', 'smoker', 'smoking',
  'early bird', 'early-bird', 'morning person', 'night owl', 'night-owl', 'late night',
]);

function sharedTagScore(a: Set<string>, b: Set<string>): { score: number; shared: string[] } {
  const aExtra = [...a].filter((t) => !CORE_TAGS.has(t));
  const bExtra = new Set([...b].filter((t) => !CORE_TAGS.has(t)));
  if (aExtra.length === 0) return { score: NEUTRAL, shared: [] };
  const shared = aExtra.filter((t) => bExtra.has(t));
  return { score: Math.min(1, shared.length / Math.min(3, aExtra.length)), shared };
}

function titleCase(tag: string): string {
  return tag.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Compute the Vibe-Check score for a candidate relative to the current user.
 * If `mine` is null (user has no seeker profile yet) we fall back to the
 * candidate's own `matchPercent` so the page still renders meaningfully.
 */
export function computeVibeCheck(
  mine: TenantRoommateProfileMine | null,
  candidate: RoommateProfile,
): VibeCheckResult {
  const candTags = normalizeTags(candidate.lifestyleTags ?? candidate.tags);

  if (!mine) {
    return {
      score: Math.min(100, Math.max(0, Math.round(candidate.matchPercent))),
      reasons: [],
    };
  }

  const myTags = normalizeTags(mine.lifestyleTags);

  const myDiet = dietFromTags(myTags, undefined, mine.displayRole);
  const candDiet = dietFromTags(candTags, candidate.lifestyleSnippet?.diet, candidate.role);

  const mySmoking = smokingFromTags(myTags);
  const candSmoking = smokingFromTags(candTags, candidate.lifestyleSnippet?.smoking);

  const mySchedule = scheduleFromTags(myTags);
  const candSchedule = scheduleFromTags(candTags);

  const dims = {
    diet: matchExclusive(myDiet, candDiet, 'unknown'),
    smoking: matchExclusive(mySmoking, candSmoking, 'unknown'),
    schedule: matchExclusive(mySchedule, candSchedule, 'unknown'),
    budget: budgetScore(mine.monthlyBudget, candidate.monthlyBudget ?? candidate.budget),
    moveIn: moveInScore(mine.moveInDate, candidate.moveInDate),
  };

  const shared = sharedTagScore(myTags, candTags);

  const total =
    dims.diet * WEIGHTS.diet +
    dims.smoking * WEIGHTS.smoking +
    dims.schedule * WEIGHTS.schedule +
    dims.budget * WEIGHTS.budget +
    dims.moveIn * WEIGHTS.moveIn +
    shared.score * WEIGHTS.sharedTags;

  const score = Math.min(100, Math.max(0, Math.round(total)));

  // Build reasons for the dimensions that genuinely align.
  const reasons: string[] = [];
  if (dims.diet === 1 && myDiet !== 'unknown') {
    reasons.push(myDiet === 'veg' ? 'Both vegetarian' : 'Both non-veg');
  }
  if (dims.smoking === 1 && mySmoking === 'non') reasons.push('Both non-smokers');
  if (dims.schedule === 1 && mySchedule !== 'unknown') {
    reasons.push(mySchedule === 'early' ? 'Both early birds' : 'Both night owls');
  }
  if (dims.budget >= 0.85) reasons.push('Similar budget');
  if (dims.moveIn >= 0.85) reasons.push('Move-in dates align');
  for (const t of shared.shared.slice(0, 2)) reasons.push(`Both like ${titleCase(t)}`);

  return { score, reasons };
}
