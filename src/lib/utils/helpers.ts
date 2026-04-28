/**
 * helpers.ts
 * General-purpose utility functions.
 */

/**
 * Merge class names — filters out falsy values.
 * Use instead of a full classnames library for simple cases.
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Generate a random alphanumeric ID string.
 * Not cryptographically secure — use for UI keys and mock IDs only.
 */
export const generateId = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Promise-based delay (sleep).
 * Useful for mock service delays and rate limiting.
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Split an array into chunks of a given size.
 * @example chunk([1, 2, 3, 4, 5], 2) → [[1, 2], [3, 4], [5]]
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) throw new Error('Chunk size must be greater than 0');
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

/**
 * Group an array of objects by a key.
 * @example groupBy([{type:'PG',...},{type:'Flat',...}], 'type') → { PG: [...], Flat: [...] }
 */
export const groupBy = <T extends Record<string, unknown>>(
  array: T[],
  key: keyof T,
): Record<string, T[]> => {
  return array.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});
};

/**
 * Create a debounced version of a function.
 * The function will only be called after `delay` ms have passed since the last call.
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Validate an email address using a standard regex.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Parse a price string like "15,000" or "15000" to a number.
 * Returns NaN if parsing fails.
 * @example parsePrice("15,000") → 15000
 * @example parsePrice("₹ 8,500/mo") → 8500
 */
export const parsePrice = (str: string): number => {
  if (typeof str !== 'string') return NaN;
  // Remove currency symbols, spaces, slashes, and text
  const cleaned = str.replace(/[₹,\s/a-zA-Z]/g, '');
  return parseInt(cleaned, 10);
};
