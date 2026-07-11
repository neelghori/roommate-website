'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/hooks/useToast';
import { timeAgo } from '@/lib/utils/format';
import { userService } from '@/services/modules/user.service';
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
  const [received, setReceived] = useState<RoommateRequest[]>([]);
  const [sent, setSent] = useState<RoommateRequest[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [rec, snt] = await Promise.all([
        userService.getRequestsReceived(),
        userService.getRequestsSent(),
      ]);
      setReceived(rec);
      setSent(snt);
      setLoadState('ok');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingCount = received.filter((r) => r.status === 'PENDING').length;

  // ── Accept / Reject handlers (optimistic, rolled back on error) ────────────
  const respond = async (id: string, action: 'accept' | 'reject') => {
    if (busyId) return;
    const prev = received;
    const nextStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    setBusyId(id);
    setReceived((rs) => rs.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));
    try {
      if (action === 'accept') {
        await userService.acceptRequest(id);
        toast.success('Request accepted!', 'You are now connected.');
      } else {
        await userService.rejectRequest(id);
        toast.info('Request rejected.');
      }
    } catch (err) {
      setReceived(prev); // rollback
      toast.error('Could not update request', err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId(null);
    }
  };

  const handleAccept = (id: string) => void respond(id, 'accept');
  const handleReject = (id: string) => void respond(id, 'reject');

  // ── Tab bar ───────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'received', label: `Received${pendingCount ? ` (${pendingCount})` : ''}` },
    { key: 'sent', label: `Sent (${sent.length})` },
  ] as const;

  return (
    <UserLayout pageSuffix="Requests" showSearch={false} showFab={false}>
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-4 space-y-4">

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

        {/* ── Load states ──────────────────────────────────────────────────── */}
        {loadState === 'loading' ? (
          <p className="text-center text-sm text-gray-500 py-10">Loading requests…</p>
        ) : loadState === 'error' ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500 mb-3">Could not load your requests.</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
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
                          disabled={busyId === req.id}
                          onClick={() => handleAccept(req.id)}
                          leftIcon={<Check size={13} />}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === req.id}
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
          </>
        )}
      </div>
    </UserLayout>
  );
}
