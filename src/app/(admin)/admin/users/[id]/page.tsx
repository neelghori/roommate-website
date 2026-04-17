'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Home,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { ADMIN_USERS } from '@/mock/data/admin';
import { formatDate } from '@/lib/utils/format';
import { useToast } from '@/components/ui/Toast';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const user = ADMIN_USERS.find((u) => u.id === id);
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [showBanConfirm, setShowBanConfirm] = useState(false);

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[40vh]">
        <p className="text-gray-500 mb-4">User not found</p>
        <Link href="/admin/users" className="text-teal-600 font-medium text-sm underline">
          Back to users
        </Link>
      </div>
    );
  }

  const handleToggleActive = () => {
    const next = !isActive;
    setIsActive(next);
    setShowBanConfirm(false);
    toast.success(next ? 'User Activated' : 'User Banned', `${user.name} has been ${next ? 'activated' : 'banned'}.`);
  };

  const handleVerify = () => {
    toast.success('Verification Updated', `${user.name} is now marked as verified.`);
  };

  const roleColor: Record<string, string> = {
    TENANT: 'bg-blue-50 text-blue-600 border-blue-100',
    OWNER: 'bg-orange-50 text-orange-600 border-orange-100',
    ADMIN: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              {user.isVerified && (
                <UserCheck className="w-5 h-5 text-green-500" aria-label="Verified" />
              )}
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleColor[user.role] ?? 'bg-gray-100 text-gray-600 border-gray-100'}`}
              >
                {user.role}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              {isActive ? 'Active' : 'Banned'}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Joined {formatDate(user.joinedAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Home className="w-4 h-4 text-gray-400" />
            <span>{user.listingCount} listing{user.listingCount !== 1 ? 's' : ''}</span>
          </div>
          {user.lastLogin && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-gray-400" />
              <span>Last login: {formatDate(user.lastLogin)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Admin Actions</h2>

        {/* Verify */}
        {!user.isVerified && (
          <button
            onClick={handleVerify}
            className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            <UserCheck className="w-4 h-4" />
            Mark as Verified
          </button>
        )}

        {/* Ban/Activate */}
        {!showBanConfirm ? (
          <button
            onClick={() => (isActive ? setShowBanConfirm(true) : handleToggleActive())}
            className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors ${
              isActive
                ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
            }`}
          >
            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {isActive ? 'Ban User' : 'Activate User'}
          </button>
        ) : (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-medium text-red-600">Confirm Ban</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              This will prevent {user.name} from logging in and using the platform.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleToggleActive}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Confirm Ban
              </button>
              <button
                onClick={() => setShowBanConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* View listings */}
        <Link
          href={`/admin/listings?owner=${user.id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <Home className="w-4 h-4" />
          View Listings by This User
        </Link>
      </div>
    </div>
  );
}
