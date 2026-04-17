'use client';

import React, { useState } from 'react';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/hooks/useToast';
import { timeAgo } from '@/lib/utils/format';
import { ROOMMATE_REQUESTS_RECEIVED, ROOMMATE_REQUESTS_SENT } from '@/mock/data/users';
import { RoommateRequest } from '@/types';
import { Users, Check, X, Clock, Send } from 'lucide-react';

// ── Status badge helper ───────────────────────────────────────────────────────
const statusVariant = (status: RoommateRequest['status']) => {
  if (status === 'ACCEPTED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'warning';
};

const statusLabel = (status: RoommateRequest['status']) => {
  if (status === 'ACCEPTED') return '✓ Accepted';
  if (status === 'REJECTED') return '✗ Rejected';
  return '⏳ Pending';
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ backgroundColor: '#1B8F8F' }}
    >
      {initials}
    </div>
  );
};

export default function RequestsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [received, setReceived] = useState<RoommateRequest[]>(ROOMMATE_REQUESTS_RECEIVED);
  const [sent] = useState<RoommateRequest[]>(ROOMMATE_REQUESTS_SENT);

  const pendingCount = received.filter((r) => r.status === 'PENDING').length;

  // ── Accept / Reject handlers ──────────────────────────────────────────────
  const handleAccept = (id: string) => {
    // BACKEND: await userService.acceptRequest(id)
    setReceived((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'ACCEPTED' } : r))
    );
    toast.success('Request accepted!', 'You are now connected.');
  };

  const handleReject = (id: string) => {
    // BACKEND: await userService.rejectRequest(id)
    setReceived((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
    );
    toast.info('Request rejected.');
  };

  // ── Tab bar ───────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'received', label: `Received${pendingCount ? ` (${pendingCount})` : ''}` },
    { key: 'sent', label: `Sent (${sent.length})` },
  ] as const;

  return (
    <UserLayout pageSuffix="Requests" showSearch={false} showFab={false}>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

        {/* Tab switcher */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
              style={
                activeTab === tab.key
                  ? { backgroundColor: '#1B8F8F', color: '#fff' }
                  : { color: '#6B7280' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Received tab ─────────────────────────────────────────────────── */}
        {activeTab === 'received' && (
          <div className="space-y-3">
            {received.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No requests received yet"
                description="When someone sends you a roommate request, it'll appear here."
              />
            ) : (
              received.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3"
                >
                  <Avatar name={req.senderName} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {req.senderName}
                      </p>
                      <Badge variant={statusVariant(req.status)} size="sm">
                        {statusLabel(req.status)}
                      </Badge>
                    </div>

                    {req.message && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo(req.createdAt)}
                    </p>

                    {req.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAccept(req.id)}
                          leftIcon={<Check size={13} />}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(req.id)}
                          leftIcon={<X size={13} />}
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Sent tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'sent' && (
          <div className="space-y-3">
            {sent.length === 0 ? (
              <EmptyState
                icon={Send}
                title="No requests sent yet"
                description="Browse roommates and send a connection request to get started."
                actionLabel="Find Roommates"
                onAction={() => (window.location.href = '/roommates')}
              />
            ) : (
              sent.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3"
                >
                  <Avatar name={req.receiverName} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {req.receiverName}
                      </p>
                      <Badge variant={statusVariant(req.status)} size="sm">
                        {statusLabel(req.status)}
                      </Badge>
                    </div>

                    {req.message && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo(req.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
