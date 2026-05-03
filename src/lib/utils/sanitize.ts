/**
 * sanitize.ts
 * Input sanitization utilities.
 * Security: Prevents XSS attacks by sanitizing user-provided content.
 * All dynamic content rendered from user input MUST pass through these functions.
 */

/**
 * Strip all HTML tags from a string.
 * Use for any text field that should not contain HTML.
 */
export const stripHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
};

/**
 * Escape HTML special characters to prevent XSS.
 * Use when displaying user content in a context where HTML might be interpreted.
 */
export const escapeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char] ?? char);
};

/**
 * Sanitize a search query only allow alphanumeric, spaces, and common punctuation.
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';
  return query.replace(/[^a-zA-Z0-9\s\-,.]/g, '').trim().slice(0, 200);
};

/**
 * Validate and sanitize a URL to prevent javascript: and data: URIs.
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '#';
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) return '#';
  return url.trim();
};

/**
 * Sanitize a phone number keep only digits, +, and spaces.
 */
export const sanitizePhone = (phone: string): string => {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[^\d+\s\-()]/g, '').trim();
};
