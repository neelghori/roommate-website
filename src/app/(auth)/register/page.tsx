import { buildPageMetadata } from '@/lib/seo/site';
import RegisterPageClient from './client';

export const metadata = buildPageMetadata({
  title: 'Create Your Free Account',
  description:
    'Sign up free on roommat.in to find verified PG rooms, shared flats, and compatible roommates in Ahmedabad & Gandhinagar.',
  path: '/register',
  keywords: ['roommat signup', 'create roommate account', 'register roommat', 'free PG app India'],
});

export default function RegisterPage() {
  return <RegisterPageClient />;
}
