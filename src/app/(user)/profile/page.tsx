'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/modules/auth.service';
import { faqService, type FaqItem } from '@/services/modules/faq.service';
import { CURRENT_USER } from '@/mock/data/users';
import {
  Pencil, Settings, Home, Users, BadgeCheck,
  HelpCircle, LogOut, ChevronRight, Phone, Building2,
  Star, Heart, UserCheck, KeyRound,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const profile = user ?? CURRENT_USER;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);

  useEffect(() => {
    if (!showHelp) return;
    setOpenFaq(null);
    let cancelled = false;
    setFaqLoading(true);
    faqService
      .getFaqs()
      .then((list) => {
        if (!cancelled) setFaqItems(list);
      })
      .catch(() => {
        if (!cancelled) setFaqItems([]);
      })
      .finally(() => {
        if (!cancelled) setFaqLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showHelp]);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    toast.success('Logged out', 'See you soon!');
    router.push('/');
  };

  const menuItems = [
    { icon: Settings, label: 'Super Admin Panel', href: '/admin', admin: true },
    { icon: Home, label: 'My Listings', href: '/my-listings' },
    { icon: KeyRound, label: 'Change password', href: '/profile/change-password' },
    { icon: Users, label: 'Tenant Profiles', href: '/roommates' },
    { icon: BadgeCheck, label: 'Verify Identity', onClick: () => setShowVerify(true) },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => setShowHelp(true) },
  ];

  return (
    <UserLayout pageSuffix="Profile" showSearch={false} showFab={false}>
      <div className="max-w-5xl mx-auto lg:py-8 pb-safe">
        
        <div className="lg:px-0">
          {/* Main Card */}
          <div className="bg-white lg:rounded-3xl lg:shadow-sm border-b lg:border border-gray-100 lg:border-primary/10 px-5 lg:px-12 py-8 lg:py-12 relative z-10">
            
            {/* ── Header: Avatar + Info ── */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start lg:items-center mb-10 lg:mb-16">
              {/* Avatar & Edit Icon Row (Mobile) */}
              <div className="w-full flex items-center justify-between lg:w-auto lg:block relative">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 lg:w-48 lg:h-48 rounded-3xl lg:rounded-[3.5rem] bg-primary/5 border-2 border-primary/10 flex items-center justify-center text-primary text-3xl lg:text-6xl font-black shadow-inner transition-transform group-hover:scale-[1.02]">
                    {profile.avatarInitial}
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 lg:w-10 lg:h-10 bg-green-500 border-4 border-white rounded-full shadow-md" />
                </div>

                <Link
                  href="/profile/edit"
                  className="p-3 rounded-2xl bg-gray-50 hover:bg-primary/10 text-gray-400 hover:text-primary transition-all border border-gray-100 lg:hidden"
                >
                  <Pencil size={22} />
                </Link>
              </div>

              {/* Info */}
              <div className="w-full lg:flex-1 space-y-4 lg:space-y-5 text-left">
                <div className="space-y-1.5 lg:space-y-2">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <h1 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">{profile.name}</h1>
                    {profile.role === 'ADMIN' && (
                      <span className="bg-primary/10 text-primary text-[10px] lg:text-xs font-bold px-2 py-0.5 lg:px-3 lg:py-1 rounded-full uppercase tracking-wider">Admin</span>
                    )}
                  </div>
                  <p className="text-base lg:text-2xl text-gray-500 font-medium leading-tight">
                    {profile.role === 'TENANT' ? 'Looking for a home' : 'Property Owner'} • {profile.location || 'Ahmedabad'}
                  </p>
                </div>
                
                {/* Verification badges */}
                <div className="flex flex-wrap gap-2 lg:gap-3 pt-1">
                  {profile.isPhoneVerified && (
                    <span className="flex items-center gap-1.5 text-[11px] lg:text-sm font-bold text-green-600 bg-green-50 px-3.5 py-1.5 lg:px-5 lg:py-2.5 rounded-full border border-green-100">
                      <UserCheck size={16} className="shrink-0" /> Verified
                    </span>
                  )}
                  {profile.isCompanyVerified && (
                    <span className="flex items-center gap-1.5 text-[11px] lg:text-sm font-bold text-orange-600 bg-orange-50 px-3.5 py-1.5 lg:px-5 lg:py-2.5 rounded-full border border-orange-100">
                      <Building2 size={16} className="shrink-0" /> Company
                    </span>
                  )}
                </div>
              </div>

              {/* Actions (Desktop Only) */}
              <div className="hidden lg:flex flex-col gap-3">
                <Link href="/profile/edit">
                  <Button variant="secondary" size="lg" className="rounded-3xl px-10 font-bold shadow-sm hover:shadow-md transition-all h-14" leftIcon={<Pencil size={20} />}>Edit Profile</Button>
                </Link>
                <Button variant="outline" size="lg" className="rounded-3xl px-10 border-gray-200 hover:bg-red-50 hover:border-red-100 transition-all group h-14" onClick={() => setShowLogoutConfirm(true)}>
                  <LogOut size={20} className="text-gray-400 group-hover:text-red-500 transition-colors mr-2" />
                  <span className="text-gray-600 group-hover:text-red-500 font-bold transition-colors">Logout</span>
                </Button>
              </div>
            </div>

            {/* ── Content Grid ── */}
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-1 space-y-6 lg:space-y-8">
                {/* Stats */}
                <div className="bg-gray-50 lg:bg-primary/5 rounded-3xl p-6 lg:p-8 border border-gray-100 lg:border-primary/10 grid grid-cols-3 gap-4">
                  {[
                    { value: profile.listingCount,    label: 'Listings' },
                    { value: profile.shortlistedCount, label: 'Saved' },
                    { value: profile.connectCount,    label: 'Matches' },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center space-y-1">
                      <div className="text-2xl lg:text-3xl font-black text-primary">{value}</div>
                      <div className="text-[10px] lg:text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
                    </div>
                  ))}
                </div>

                {profile.role === 'TENANT' && (
                <div className="bg-white lg:bg-gray-50/50 rounded-3xl p-6 lg:p-8 border border-gray-100 lg:border-primary/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm lg:text-base font-bold text-gray-900">Profile Strength</h3>
                      <span className="text-xs lg:text-sm font-black text-primary">65%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '65%' }} />
                    </div>
                    <p className="text-[11px] lg:text-xs text-gray-400 leading-relaxed font-medium">
                      Complete your profile to get 2x more matches.
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                <div className="bg-white lg:bg-gray-50/50 rounded-3xl border border-gray-100 lg:border-primary/10 overflow-hidden">
                  {menuItems.map(({ icon: Icon, label, href, onClick, admin }, i) => {
                    if (admin && profile.role !== 'ADMIN') return null;
                    const content = (
                      <div className="flex items-center gap-4 px-5 py-5 lg:px-8 lg:py-6 hover:bg-gray-50 lg:hover:bg-white active:bg-gray-100 transition-all cursor-pointer group">
                        <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl bg-gray-50 lg:bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:scale-105 transition-all border border-gray-100">
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm lg:text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">{label}</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    );

                    return (
                      <React.Fragment key={label}>
                        {i > 0 && <div className="mx-5 lg:mx-8 border-t border-gray-50" />}
                        {href ? <Link href={href}>{content}</Link> : <div onClick={onClick}>{content}</div>}
                      </React.Fragment>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  fullWidth
                  className="lg:hidden rounded-2xl border-red-100 text-red-500 bg-white h-16 shadow-sm active:bg-red-50 transition-colors font-black text-base uppercase tracking-wider"
                  leftIcon={<LogOut size={22} />}
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  Logout
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Modals ── */}
        <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Logout?" size="sm">
          <p className="text-sm text-gray-500 mb-4">Are you sure you want to log out of Roommat?</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleLogout}>Logout</Button>
          </div>
        </Modal>

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

        <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="❓ Help & Support" size="md">
          <div className="space-y-2">
            {faqLoading && (
              <p className="text-sm text-gray-500 text-center py-4">Loading FAQs…</p>
            )}
            {!faqLoading && faqItems.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No FAQ found.</p>
            )}
            {!faqLoading &&
              faqItems.map((faq, i) => (
                <div key={faq.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    {faq.question}
                    <ChevronRight
                      size={16}
                      className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-3 text-sm text-gray-600">{faq.answer}</div>
                  )}
                </div>
              ))}
            <div className="pt-2 text-center">
              <p className="text-xs text-gray-400">Contact us: <a href="mailto:support@roommat.in" className="underline">support@roommat.in</a></p>
            </div>
          </div>
        </Modal>
      </div>
    </UserLayout>
  );
}
