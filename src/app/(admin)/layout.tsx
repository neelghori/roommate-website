/**
 * Admin group layout wrapper.
 * Uses AdminLayout component.
 */
'use client';
import React from 'react';
import { AdminLayout } from '@/components/shared/AdminLayout';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
