import { apiClient } from '@/services/api';

export type ApiAmenity = {
  _id: string;
  name: string;
  slug?: string;
};

let cachedList: ApiAmenity[] | null = null;
let inFlightList: Promise<ApiAmenity[]> | null = null;

async function fetchAmenityListFromApi(): Promise<ApiAmenity[]> {
  const { data } = await apiClient.get<{ status?: string; data?: { items?: ApiAmenity[] } }>(
    '/api/v1/amenities',
  );
  return data?.data?.items ?? [];
}

export const amenityService = {
  /**
   * Master amenity catalogue. Deduplicates concurrent callers and repeats across the app
   * (FilterPanel, useAmenityMaster, resolveAmenityIdsFromLabels) so `/amenities` is not
   * hammered on load — including React Strict Mode double-mount in dev.
   */
  list: async (): Promise<ApiAmenity[]> => {
    if (cachedList) return cachedList;
    if (!inFlightList) {
      inFlightList = fetchAmenityListFromApi()
        .then((items) => {
          cachedList = items;
          inFlightList = null;
          return items;
        })
        .catch((err) => {
          inFlightList = null;
          throw err;
        });
    }
    return inFlightList;
  },

  /** Clear after admin mutates amenities (create/update/delete) so the next `list()` refetches. */
  invalidateListCache: () => {
    cachedList = null;
    inFlightList = null;
  },
};
