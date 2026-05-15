import { buildPageMetadata } from '@/lib/seo/site';
import RoommatesPageClient from './client';

export const metadata = buildPageMetadata({
  title: 'Find Roommates in Ahmedabad & Gandhinagar',
  description:
    'Find compatible roommates in Ahmedabad & Gandhinagar on roommat.in. Browse verified profiles, filter by lifestyle, budget, and location.',
  path: '/roommates',
  keywords: [
    'find roommate Ahmedabad',
    'roommate search Ahmedabad',
    'roommate Gandhinagar',
    'compatible roommate India',
    'roommate for students Ahmedabad',
    'vegetarian roommate Ahmedabad',
  ],
});

export default function RoommatesPage() {
  return <RoommatesPageClient />;
}
