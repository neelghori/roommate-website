import { apiClient } from '@/services/api';

export type ApiAmenity = {
  _id: string;
  name: string;
  slug?: string;
};

export const amenityService = {
  list: async (): Promise<ApiAmenity[]> => {
    const { data } = await apiClient.get<{ status?: string; data?: { items?: ApiAmenity[] } }>(
      '/api/v1/amenities',
    );
    return data?.data?.items ?? [];
  },
};
