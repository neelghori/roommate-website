/**
 * Stable empty array for React default props.
 * Never use `prop = []` inline — that allocates a new reference every render and can
 * retrigger useEffect deps → "Maximum update depth exceeded".
 */
export const EMPTY_STRING_ARRAY: string[] = [];
