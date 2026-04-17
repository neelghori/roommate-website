'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, UserCheck, UserX, ChevronRight } from 'lucide-react';
import { ADMIN_USERS } from '@/mock/data/admin';
import { AdminUser } from '@/types';
import { formatDate } from '@/lib/utils/format';

type RoleFilter = 'ALL' | 'TENANT' | 'OWNER' | 'ADMIN';
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const filtered = useMemo(() => {
    return ADMIN_USERS.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone ?? '').includes(search);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{ADMIN_USERS.length} total users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Role filter */}
          {(['ALL', 'TENANT', 'OWNER', 'ADMIN'] as RoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                roleFilter === r
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-gray-200 text-gray-600 bg-gray-50'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {(['ALL', 'ACTIVE', 'INACTIVE'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-gray-200 text-gray-600 bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'All Status' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <p className="text-xs text-gray-500 mb-2">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>

      {/* Table (card on mobile) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No users match the filters</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────
function UserRow({ user }: { user: AdminUser }) {
  const roleColor: Record<string, string> = {
    TENANT: 'bg-blue-50 text-blue-600',
    OWNER: 'bg-orange-50 text-orange-600',
    ADMIN: 'bg-purple-50 text-purple-600',
  };

  return (
    <Link
      href={`/admin/users/${user.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: '#1B8F8F' }}
      >
        {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
          {user.isVerified && (
            <UserCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>

      {/* Meta */}
      <div className="hidden md:flex items-center gap-3 flex-shrink-0 text-xs text-gray-400">
        <span>{user.listingCount} listings</span>
        <span>{formatDate(user.joinedAt)}</span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColor[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
          {user.role}
        </span>
        {user.isActive ? (
          <span className="w-2 h-2 rounded-full bg-green-500" aria-label="Active" />
        ) : (
          <UserX className="w-4 h-4 text-gray-300" aria-label="Inactive" />
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </Link>
  );
}
