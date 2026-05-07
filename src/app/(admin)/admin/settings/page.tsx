'use client';

import React, { useState } from 'react';
import { Save, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { ADMIN_SETTINGS } from '@/mock/data/admin';
import { AdminSettings } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({ ...ADMIN_SETTINGS });
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // BACKEND: PUT /admin/settings with settings payload
    setIsDirty(false);
    toast.success('Settings Saved', 'All changes have been applied.');
  };

  const handleReset = () => {
    setSettings({ ...ADMIN_SETTINGS });
    setIsDirty(false);
    toast.info('Settings reset to defaults');
  };

  // Toggle component
  const Toggle = ({
    value,
    onChange,
    label,
    description,
    danger,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
    danger?: boolean;
  }) => (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>
          {label}
        </p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="flex-shrink-0 transition-colors"
        aria-label={`Toggle ${label}`}
      >
        {value ? (
          <ToggleRight className="w-8 h-8" style={{ color: danger ? '#EF4444' : '#1B8F8F' }} />
        ) : (
          <ToggleLeft className="w-8 h-8 text-gray-300" />
        )}
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform configuration</p>
        </div>
        {isDirty && (
          <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
            Unsaved changes
          </span>
        )}
      </div>

      {/* General */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">General</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => update('siteName', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => update('supportEmail', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Listings per User
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.maxListingsPerUser}
              onChange={(e) => update('maxListingsPerUser', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referral Bonus (₹)
            </label>
            <input
              type="number"
              min={0}
              value={settings.referralBonus}
              onChange={(e) => update('referralBonus', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Feature Flags</h2>
        <div className="divide-y divide-gray-50">
          <Toggle
            value={settings.requireListingApproval}
            onChange={(v) => update('requireListingApproval', v)}
            label="Require Listing Approval"
            description="New listings need admin review before going live"
          />
          <Toggle
            value={settings.enableChat}
            onChange={(v) => update('enableChat', v)}
            label="Enable Chat"
            description="Allow users to message each other within the platform"
          />
          <Toggle
            value={settings.enableReferrals}
            onChange={(v) => update('enableReferrals', v)}
            label="Enable Referral Program"
            description="Users earn bonus credits for referring new members"
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Maintenance mode disables user access to the platform. Only admins can log in.
        </p>
        <Toggle
          value={settings.maintenanceMode}
          onChange={(v) => update('maintenanceMode', v)}
          label="Maintenance Mode"
          description="Enable to take the site offline for maintenance"
          danger
        />
      </div>

      {/* Save / Reset */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: '#1B8F8F' }}
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
