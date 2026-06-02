'use client';

import { UserLayout } from '@/components/shared/UserLayout';

const PAGE_CONTAINER = 'max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-14';

type SeoPageShellProps = {
  children: React.ReactNode;
  pageSuffix?: string;
  showSearch?: boolean;
};

/** Area/SEO pages — same TopBar, layout, and footer as the rest of the app. */
export function SeoPageShell({
  children,
  pageSuffix = 'Areas',
  showSearch = true,
}: SeoPageShellProps) {
  return (
    <UserLayout pageSuffix={pageSuffix} showSearch={showSearch} showFab={false}>
      <div className={`${PAGE_CONTAINER} py-5 space-y-6`}>{children}</div>
    </UserLayout>
  );
}
