'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { pushService } from '@/services/modules/push.service';
import { useToast } from '@/hooks/useToast';

type ChatPushBannerProps = {
  className?: string;
};

/** Prompts users to allow browser push so chat alerts work when away from the tab. */
export function ChatPushBanner({ className = '' }: ChatPushBannerProps) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const visible =
    pushService.supportsWebPush() &&
    typeof Notification !== 'undefined' &&
    Notification.permission !== 'granted';

  if (!visible) return null;

  const enable = async () => {
    setBusy(true);
    try {
      const perm = await pushService.requestPermission();
      if (perm !== 'granted') {
        toast.error('Permission denied', 'Allow notifications in browser settings to get message alerts.');
        return;
      }
      await pushService.subscribeAndSave();
      toast.success('Alerts enabled', 'You will get notified for new chat messages even when away.');
    } catch (e) {
      toast.error('Could not enable', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-2.5',
        className,
      ].join(' ')}
    >
      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-800">Get message alerts when you&apos;re away</p>
        <p className="mt-0.5 text-[11px] leading-snug text-gray-600">
          Enable browser notifications so new chats reach you even with the tab closed.
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void enable()}
        className="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {busy ? '…' : 'Enable'}
      </button>
    </div>
  );
}
