'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/modules/auth.service';
import { CURRENT_USER } from '@/mock/data/users';
import {
  Pencil, Settings, Home, Users, BadgeCheck,
  HelpCircle, LogOut, ChevronRight, Phone, Building2,
  Star, Heart, UserCheck,
} from 'lucide-react';

/** FAQ accordion item */
const FAQS = [
  { q: 'How do I post a listing?', a: 'Go to My Listings → + Add Listing. Listings are reviewed within 24 hours.' },
  { q: 'Is Roommat free to use?', a: 'Basic browsing and profile creation are free. Premium features require a subscription.' },
  { q: 'How does roommate matching work?', a: 'Our algorithm matches you on lifestyle, budget, location and move-in preferences.' },
  { q: 'How do I verify my identity?', a: 'Go to Verify Identity below and upload your Aadhar card. Verified in 2 business days.' },
];

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const profile = user ?? CURRENT_USER;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    toast.success('Logged out', 'See you soon!');
    router.push('/login');
  };

  const menuItems = [
    { icon: Settings, label: 'Super Admin Panel', href: '/admin/dashboard', admin: true },
    { icon: Home,     label: 'My Listings',        href: '/my-listings' },
    { icon: Users,    label: 'Tenant Profiles',     href: '/roommates' },
    { icon: BadgeCheck, label: 'Verify Identity',  onClick: () => setShowVerify(true) },
    { icon: HelpCircle, label: 'Help & Support',   onClick: () => setShowHelp(true) },
  ];

  return (
    <UserLayout pageSuffix="Profile" showSearch={false} showFab={true}>
      {/* Edit icon in top-right — rendered via a portal-style absolute */}
      <div className="relative max-w-lg mx-auto">

        {/* Edit button pinned top-right */}
        <Link
          href="/profile/edit"
          className="absolute top-2 right-4 z-10 p-2 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Edit profile"
        >
          <Pencil size={18} className="text-white" />
        </Link>

        {/* Teal banner */}
        <div
          className="h-32 w-full"
          style={{ background: 'linear-gradient(135deg, #1B8F8F 0%, #0f6060 100%)' }}
        />

        {/* Avatar overlapping banner */}
        <div className="px-4">
          <div className="relative -mt-10 mb-3">
            <div
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-md"
              style={{ backgroundColor: '#1B8F8F' }}
            >
              {profile.avatarInitial}
            </div>
          </div>

          {/* Name + role */}
          <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-sm text-gray-500 mb-3">
            {profile.role === 'TENANT' ? 'Tenant' : profile.role === 'OWNER' ? 'Owner' : 'Admin'}
          </p>

          {/* Verified badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {profile.isPhoneVerified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                <Phone size={11} /> Phone Verified
              </span>
            )}
            {profile.isCompanyVerified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                <Building2 size={11} /> Company Verified
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { icon: Home,     value: profile.listingCount,     label: 'Listings' },
                { icon: Heart,    value: profile.shortlistedCount,  label: 'Shortlisted' },
                { icon: UserCheck, value: profile.connectCount,    label: 'Connects' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center gap-0.5 px-2">
                  <span className="text-xl font-bold text-gray-900">{value}</span>
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Match score (cosmetic) */}
          {profile.role === 'TENANT' && (
            <div
              className="flex items-center justify-between rounded-2xl p-3 mb-4"
              style={{ backgroundColor: '#E8F7F7' }}
            >
              <div className="flex items-center gap-2">
                <Star size={16} style={{ color: '#1B8F8F' }} fill="#1B8F8F" />
                <span className="text-sm font-semibold" style={{ color: '#1B8F8F' }}>
                  Profile Strength
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: '#1B8F8F' }} />
                </div>
                <span className="text-xs font-bold" style={{ color: '#1B8F8F' }}>65%</span>
              </div>
            </div>
          )}

          {/* Menu items */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
            {menuItems.map(({ icon: Icon, label, href, onClick, admin }) => {
              if (admin && profile.role !== 'ADMIN') return null;
              const inner = (
                <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              );
              return href
                ? <Link key={label} href={href}>{inner}</Link>
                : <div key={label} onClick={onClick}>{inner}</div>;
            })}
          </div>

          {/* Logout button */}
          <Button
            variant="outline"
            fullWidth
            size="lg"
            className="mb-6 border-red-200 text-red-500 hover:bg-red-50"
            leftIcon={<LogOut size={16} />}
            onClick={() => setShowLogoutConfirm(true)}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* ── Logout confirm modal ─────────────────────────────────────────────── */}
      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Logout?" size="sm">
        <p className="text-sm text-gray-500 mb-4">Are you sure you want to log out of Roommat?</p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={handleLogout}>Logout</Button>
        </div>
      </Modal>

      {/* ── Verify Identity modal ────────────────────────────────────────────── */}
      <Modal isOpen={showVerify} onClose={() => setShowVerify(false)} title="🪪 Verify Identity" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Upload your Aadhar card to get verified. Verification is completed within 2 business days.</p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <BadgeCheck size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Tap to upload Aadhar card</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF · Max 5 MB</p>
          </div>
          <Button variant="primary" fullWidth onClick={() => { setShowVerify(false); toast.success('Document submitted!', 'Verification takes up to 2 business days.'); }}>
            Submit for Verification
          </Button>
        </div>
      </Modal>

      {/* ── Help & Support modal ─────────────────────────────────────────────── */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="❓ Help & Support" size="md">
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                {faq.q}
                <ChevronRight size={16} className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-sm text-gray-600">{faq.a}</div>
              )}
            </div>
          ))}
          <div className="pt-2 text-center">
            <p className="text-xs text-gray-400">Contact us: <a href="mailto:support@roommat.in" className="underline">support@roommat.in</a></p>
          </div>
        </div>
      </Modal>
    </UserLayout>
  );
}
