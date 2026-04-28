'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminAuthService } from '@/services/modules/adminAuth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminAuthService.login(email, password);
      router.push('/admin/listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h1 className="text-lg font-bold text-gray-900">Staff sign in</h1>
        <p className="text-xs text-gray-500">
          Use your superadmin or sub-admin account. Required to review property listings.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Sign in
          </Button>
        </form>
        <Link href="/" className="block text-center text-xs text-teal-600 hover:underline">
          Back to site
        </Link>
      </div>
    </div>
  );
}
