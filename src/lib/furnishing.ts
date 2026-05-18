/** Form values for property furnishing (maps to API snake_case). */
export const FURNISHING_FORM_VALUES = ['Unfurnished', 'SemiFurnished', 'FullyFurnished'] as const;

export type FurnishingFormValue = (typeof FURNISHING_FORM_VALUES)[number];

export const FURNISHING_SELECT_OPTIONS: { label: string; value: FurnishingFormValue }[] = [
  { label: 'Unfurnished', value: 'Unfurnished' },
  { label: 'Semi Furnished', value: 'SemiFurnished' },
  { label: 'Fully Furnished', value: 'FullyFurnished' },
];

const UI_TO_API: Record<FurnishingFormValue, string> = {
  Unfurnished: 'unfurnished',
  SemiFurnished: 'semi_furnished',
  FullyFurnished: 'fully_furnished',
};

const API_TO_UI: Record<string, FurnishingFormValue> = {
  unfurnished: 'Unfurnished',
  semi_furnished: 'SemiFurnished',
  fully_furnished: 'FullyFurnished',
};

export function mapFurnishingToApi(value: FurnishingFormValue | string): string {
  if (value in UI_TO_API) return UI_TO_API[value as FurnishingFormValue];
  return UI_TO_API.SemiFurnished;
}

export function mapFurnishingFromApi(raw: string | undefined): FurnishingFormValue | undefined {
  if (!raw) return undefined;
  return API_TO_UI[raw.toLowerCase()] ?? API_TO_UI[raw] ?? undefined;
}

export function formatFurnishingLabel(
  value: FurnishingFormValue | string | undefined,
): string {
  if (!value) return '—';
  const opt = FURNISHING_SELECT_OPTIONS.find((o) => o.value === value);
  if (opt) return opt.label;
  const fromApi = mapFurnishingFromApi(value);
  if (fromApi) {
    return FURNISHING_SELECT_OPTIONS.find((o) => o.value === fromApi)?.label ?? value;
  }
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
