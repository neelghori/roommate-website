'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Home,
  Flag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  ArrowUpRight,
} from 'lucide-react';
import { ADMIN_STATS, ADMIN_LISTINGS, ADMIN_USERS } from '@/mock/data/admin';
import { formatRupees } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

function StatCard({ label, value, sub, icon: Icon, color, href }: StatCardProps) {
  const content = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {href && <ArrowUpRight className="w-4 h-4 text-gray-300" />}
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' && label.toLowerCase().includes('revenue')
          ? formatRupees(value)
          : value.toLocaleString('en-IN')}
      </p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-green-500 font-medium mt-1">{sub}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    APPROVED: { label: 'Approved', className: 'bg-green-50 text-green-600 border-green-100' },
    PENDING: { label: 'Pending', className: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    UNDER_REVIEW: { label: 'Review', className: 'bg-blue-50 text-blue-600 border-blue-100' },
    REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-100' },
  };
  const cfg = map[status] ?? { label: status, className: 'bg-gray-50 text-gray-600 border-gray-100' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const pendingListings = ADMIN_LISTINGS.filter((l) => l.status === 'PENDING');
  const recentUsers = [...ADMIN_USERS]
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Users"
          value={ADMIN_STATS.totalUsers}
          sub={`+${ADMIN_STATS.newUsersThisMonth} this month`}
          icon={Users}
          color="#1B8F8F"
          href="/admin/users"
        />
        <StatCard
          label="Total Listings"
          value={ADMIN_STATS.totalListings}
          sub={`${ADMIN_STATS.pendingListings} pending`}
          icon={Home}
          color="#F57C00"
          href="/admin/listings"
        />
        <StatCard
          label="Open Reports"
          value={ADMIN_STATS.openReports}
          sub={`${ADMIN_STATS.totalReports} total`}
          icon={Flag}
          color="#EF4444"
          href="/admin/reports"
        />
        <StatCard
          label="Revenue (MTD)"
          value={ADMIN_STATS.revenueThisMonth}
          icon={IndianRupee}
          color="#8B5CF6"
        />
      </div>

      {/* Active users */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{ADMIN_STATS.activeUsers.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500">Active Users (30d)</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{ADMIN_STATS.pendingListings}</p>
            <p className="text-xs text-gray-500">Listings Awaiting Review</p>
          </div>
        </div>
      </div>

      {/* Pending listings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Listings Pending Approval</h2>
          <Link
            href="/admin/listings"
            className="text-xs font-semibold"
            style={{ color: '#1B8F8F' }}
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {pendingListings.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No pending listings 🎉</p>
          ) : (
            pendingListings.slice(0, 5).map((listing) => (
              <Link
                key={listing.id}
                href={`/admin/listings/${listing.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                  <p className="text-xs text-gray-400">
                    {listing.ownerName} · {listing.city}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold" style={{ color: '#1B8F8F' }}>
                    ₹{listing.price.toLocaleString('en-IN')}
                  </span>
                  <StatusBadge status={listing.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Users</h2>
          <Link
            href="/admin/users"
            className="text-xs font-semibold"
            style={{ color: '#1B8F8F' }}
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentUsers.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#1B8F8F' }}
              >
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-400">
                <span
                  className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                {formatDate(user.joinedAt)}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Review Listings', href: '/admin/listings', icon: Home, color: '#F57C00' },
          { label: 'Manage Users', href: '/admin/users', icon: Users, color: '#1B8F8F' },
          { label: 'Handle Reports', href: '/admin/reports', icon: Flag, color: '#EF4444' },
          { label: 'Edit CMS', href: '/admin/cms', icon: CheckCircle2, color: '#8B5CF6' },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl p-3 border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center"
          >
            <Icon className="w-5 h-5" style={{ color }} />
            <span className="text-xs font-medium text-gray-600">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
