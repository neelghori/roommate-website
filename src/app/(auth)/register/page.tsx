import { buildPageMetadata, mergePageKeywords } from '@/lib/seo/site';
import RegisterPageClient from './client';

export const metadata = buildPageMetadata({
  title: 'Create Your Free Account',
  description:
    'Sign up free on roommat.in to find verified PG rooms, shared flats, and compatible roommates in Ahmedabad & Gandhinagar.',
  path: '/register',
  keywords: mergePageKeywords('roommat signup', 'create roommate account', 'free PG app India'),
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterPageClient />;
}
