'use client';

import React from 'react';
import { AdminLayout } from '@/components/shared/AdminLayout';

export default function AdminGroupClient({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
