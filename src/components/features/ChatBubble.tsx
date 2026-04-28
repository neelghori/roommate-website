/**
 * ChatBubble.tsx
 * Chat message bubble component.
 *
 * - Sent messages: right-aligned, teal background, white text
 * - Received messages: left-aligned, white background, dark text
 * - Timestamp below bubble in gray
 * - "Read" indicator (double tick) for sent messages
 */
'use client';

import React from 'react';
import { CheckCheck, Check } from 'lucide-react';
import { ChatMessage } from '@/types';
import { formatRelativeTime } from '@/lib/utils/format';

interface ChatBubbleProps {
  message: ChatMessage;
  /** ID of the current logged-in user — used to determine sent vs received */
  currentUserId: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, currentUserId }) => {
  const isSent = message.senderId === currentUserId;

  return (
    <div
      className={['flex flex-col', isSent ? 'items-end' : 'items-start'].join(' ')}
      role="listitem"
      aria-label={isSent ? 'Sent message' : 'Received message'}
    >
      <div
        className={[
          'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
          isSent
            ? 'rounded-tr-sm text-white'
            : 'rounded-tl-sm bg-white text-gray-800',
        ].join(' ')}
        style={isSent ? { backgroundColor: '#1B8F8F' } : undefined}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>

      {/* Timestamp + read indicator */}
      <div
        className={[
          'flex items-center gap-1 mt-1 px-1',
          isSent ? 'flex-row-reverse' : 'flex-row',
        ].join(' ')}
      >
        <span className="text-[10px] text-gray-400">
          {formatRelativeTime(message.timestamp)}
        </span>

        {/* Read receipt — only for sent messages */}
        {isSent && (
          <span
            className={[
              'flex-shrink-0',
              message.isRead ? 'text-teal-500' : 'text-gray-400',
            ].join(' ')}
            aria-label={message.isRead ? 'Read' : 'Delivered'}
            title={message.isRead ? 'Read' : 'Delivered'}
          >
            {message.isRead ? <CheckCheck size={13} /> : <Check size={13} />}
          </span>
        )}
      </div>
    </div>
  );
};
