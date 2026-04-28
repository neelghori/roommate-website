'use client';

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean; // true = sent by current user
  showDateSeparator?: boolean;
  separatorDate?: string;
}

/** Format HH:MM from ISO timestamp */
function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

/** Format date for separator (Today / Yesterday / DD Mon YYYY) */
function formatSeparatorDate(iso: string): string {
  try {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ message, isOwn, showDateSeparator = false, separatorDate }) => {
    return (
      <>
        {/* Date separator */}
        {showDateSeparator && separatorDate && (
          <div className="flex items-center gap-3 px-4 py-2 my-1" role="separator">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
              {formatSeparatorDate(separatorDate)}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* Message */}
        <div
          className={`flex items-end gap-2 px-4 py-0.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Bubble */}
          <div
            className={`relative max-w-[75%] sm:max-w-[60%] group ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}
          >
            <div
              className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                isOwn
                  ? 'text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              } ${message.failed ? 'opacity-60' : ''}`}
              style={isOwn ? { backgroundColor: '#1B8F8F' } : {}}
            >
              {message.content}
            </div>

            {/* Timestamp + read ticks */}
            <div
              className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <span className="text-[10px] text-gray-400">
                {message.failed ? (
                  <span className="text-red-500 text-[10px]">Failed · Tap to retry</span>
                ) : (
                  formatTime(message.timestamp)
                )}
              </span>
              {isOwn && !message.failed && (
                <span className="text-[10px]">
                  {message.isRead ? (
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Check className="w-3 h-3 text-gray-400" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';
