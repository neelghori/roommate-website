import { SEO_AREAS } from '@/lib/seo/site';

export type AreaPage = {
  slug: string;
  name: string;
  city: string;
};

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export const AREA_PAGES: AreaPage[] = SEO_AREAS.map((name) => ({
  slug: toSlug(name),
  name,
  city: name === 'Gandhinagar' ? 'Gandhinagar' : 'Ahmedabad',
}));

export function getAreaBySlug(slug: string): AreaPage | undefined {
  return AREA_PAGES.find((a) => a.slug === slug);
}
