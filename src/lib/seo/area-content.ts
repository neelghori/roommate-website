import type { AreaPage } from '@/lib/seo/areas';
import { SITE_NAME } from '@/lib/seo/site';

export type AreaFaq = { question: string; answer: string };

export function getAreaIntro(area: AreaPage): string {
  return `${area.name} is a popular locality in ${area.city} for students and working professionals looking for PG rooms, shared flats, and roommates. On ${SITE_NAME}, you can compare verified listings with photos, monthly rent, furnishing details, and amenities — then message owners directly without brokerage fees.`;
}

export function getAreaFaqs(area: AreaPage): AreaFaq[] {
  return [
    {
      question: `How do I find PG in ${area.name}, ${area.city}?`,
      answer: `Open the ${area.name} listings on ${SITE_NAME}, filter by budget and amenities, and shortlist properties you like. You can chat with owners or book a visit from each listing page.`,
    },
    {
      question: `Are ${area.name} listings verified on ${SITE_NAME}?`,
      answer: `Listings on ${SITE_NAME} are reviewed before they go live. Look for verified badges on property and owner profiles for extra confidence when renting in ${area.name}.`,
    },
    {
      question: `Can I find a roommate in ${area.name}?`,
      answer: `Yes. Browse roommate profiles for ${area.city}, filter by preferred areas including ${area.name}, and connect with people looking for a flatmate or PG buddy.`,
    },
  ];
}
