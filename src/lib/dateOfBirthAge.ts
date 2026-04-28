/**
 * Date-of-birth helpers: calendar YYYY-MM-DD in UTC (noon) so age is stable across timezones.
 */

export function parseYmdUtcNoon(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd).trim());
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  const dt = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

/** Full years between DOB and `now` (UTC calendar comparison). */
export function computeAgeFromDobUtc(dobUtc: Date, now: Date = new Date()): number {
  let age = now.getUTCFullYear() - dobUtc.getUTCFullYear();
  const md = now.getUTCMonth() - dobUtc.getUTCMonth();
  if (md < 0 || (md === 0 && now.getUTCDate() < dobUtc.getUTCDate())) age -= 1;
  return age;
}

/** Age from `YYYY-MM-DD`, or null if invalid / future / non-calendar date. */
export function computeAgeFromDateOfBirthYmd(ymd: string, now: Date = new Date()): number | null {
  const dob = parseYmdUtcNoon(ymd);
  if (!dob) return null;
  if (dob.getTime() > now.getTime()) return null;
  return computeAgeFromDobUtc(dob, now);
}

/** Normalize API `dateOfBirth` (ISO string or similar) to `YYYY-MM-DD` for `<input type="date" />`. */
export function dateOfBirthYmdFromApi(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  const t = raw.trim();
  if (t.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  return '';
}
