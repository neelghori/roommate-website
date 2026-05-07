/**
 * RequestCard.tsx
 * Card showing a roommate request both sent and received.
 *
 * - Received + PENDING: shows Accept (teal) and Reject (danger outline) buttons
 * - Sent: shows status indicator only
 * - Status badges: PENDING=yellow, ACCEPTED=green, REJECTED=red
 *
 * BACKEND INTEGRATION:
 * - Accept: PATCH /requests/{id}/accept
 * - Reject: PATCH /requests/{id}/reject
 */
'use client';

import React, { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { RoommateRequest } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { formatRelativeTime } from '@/lib/utils/format';

interface RequestCardProps {
  request: RoommateRequest;
  /** 'received' current user is the receiver; 'sent' current user is the sender */
  direction: 'received' | 'sent';
  onStatusChange?: (id: string, status: 'ACCEPTED' | 'REJECTED') => void;
}

const STATUS_BADGE_MAP = {
  PENDING: { variant: 'warning' as const, label: 'Pending', icon: <Clock size={10} /> },
  ACCEPTED: { variant: 'success' as const, label: 'Accepted', icon: <Check size={10} /> },
  REJECTED: { variant: 'danger' as const, label: 'Rejected', icon: <X size={10} /> },
};

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  direction,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>(request.status);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const toast = useToast();

  const otherName = direction === 'received' ? request.senderName : request.receiverName;
  const otherAvatar = direction === 'received' ? request.senderAvatar : request.receiverAvatar;

  const initials = otherAvatar.slice(0, 2).toUpperCase();

  const handleAccept = async () => {
    setIsAccepting(true);
    // BACKEND: await userService.acceptRequest(request.id)
    await new Promise((r) => setTimeout(r, 700));
    setStatus('ACCEPTED');
    setIsAccepting(false);
    toast.success('Request Accepted!', `You are now connected with ${otherName}.`);
    onStatusChange?.(request.id, 'ACCEPTED');
  };

  const handleReject = async () => {
    setIsRejecting(true);
    // BACKEND: await userService.rejectRequest(request.id)
    await new Promise((r) => setTimeout(r, 700));
    setStatus('REJECTED');
    setIsRejecting(false);
    toast.info('Request Declined', `You declined the request from ${otherName}.`);
    onStatusChange?.(request.id, 'REJECTED');
  };

  const badge = STATUS_BADGE_MAP[status];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3.5">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-primary"
          aria-label={`${otherName}'s avatar`}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-bold text-gray-900 truncate">{otherName}</p>
            <Badge variant={badge.variant} size="sm">
              <span className="flex items-center gap-1">
                {badge.icon}
                {badge.label}
              </span>
            </Badge>
          </div>

          <p className="text-xs text-gray-400 mb-1.5">
            {direction === 'received' ? 'Sent you a request' : 'Request sent'}
            {' · '}
            {formatRelativeTime(request.createdAt)}
          </p>

          {/* Message excerpt */}
          {request.message && (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 italic line-clamp-2 mb-2">
              &ldquo;{request.message}&rdquo;
            </p>
          )}

          {/* Action buttons only for received + pending */}
          {direction === 'received' && status === 'PENDING' && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="primary"
                size="xs"
                isLoading={isAccepting}
                onClick={handleAccept}
                disabled={isRejecting}
                leftIcon={!isAccepting ? <Check size={12} /> : undefined}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                size="xs"
                isLoading={isRejecting}
                onClick={handleReject}
                disabled={isAccepting}
                leftIcon={!isRejecting ? <X size={12} /> : undefined}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
