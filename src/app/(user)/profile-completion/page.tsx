'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/modules/user.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MapPin, Briefcase, LogOut, CheckCircle } from 'lucide-react';

const INDIAN_STATES = [
  { label: 'Select State', value: '' },
  { label: 'Gujarat', value: 'Gujarat' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'Delhi', value: 'Delhi' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Rajasthan', value: 'Rajasthan' },
  { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
  { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  { label: 'Telangana', value: 'Telangana' },
  { label: 'West Bengal', value: 'West Bengal' },
  { label: 'Haryana', value: 'Haryana' },
  { label: 'Punjab', value: 'Punjab' },
  { label: 'Goa', value: 'Goa' },
  { label: 'Kerala', value: 'Kerala' },
  { label: 'Other', value: 'Other' },
];

export default function ProfileCompletionPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const [state, setState] = useState('');
  const [occupation, setOccupation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!state || !occupation.trim()) {
      toastError('Validation Error', 'Please complete both fields to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await userService.updateProfile({
        state,
        occupation: occupation.trim(),
      });
      setUser(updatedUser);
      toastSuccess('Profile Completed!', 'Welcome to Roommat. You can now access the full application.');
      router.push('/');
    } catch (err) {
      toastError('Submission failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-teal-50 via-white to-amber-50/40 p-4">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-xl p-8 relative z-10 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
            <CheckCircle size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed">
            Please fill in your State and Occupation to customize your roommate match experience.
          </p>
        </div>

        {/* User Info card */}
        {user && (
          <div className="bg-gray-50 border border-gray-100/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {user.avatarInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* State */}
          <div className="space-y-1">
            <Select
              label="Select State *"
              options={INDIAN_STATES}
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Occupation */}
          <Input
            label="Occupation *"
            type="text"
            placeholder="e.g. Software Engineer, Student"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            leftIcon={<Briefcase size={16} className="text-gray-400" />}
            required
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Details…' : 'Complete Registration'}
          </Button>

          {/* Logout secondary link */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut size={12} />
            Sign in with a different account
          </button>
        </form>
      </div>
    </div>
  );
}
