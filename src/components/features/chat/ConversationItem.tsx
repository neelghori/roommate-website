'use client';

import React from 'react';
import Link from 'next/link';
import { ChatConversation } from '@/types';
import { formatRelativeTime } from '@/lib/utils/format';
import { escapeHtml } from '@/lib/utils/sanitize';

interface ConversationItemProps {
  conversation: ChatConversation;
  isActive?: boolean;
}

export const ConversationItem: React.FC<ConversationItemProps> = React.memo(
  ({ conversation, isActive = false }) => {
    const initials = conversation.participantName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <Link
        href={`/chat/${conversation.id}`}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
        style={isActive ? { backgroundColor: '#E8F7F7' } : {}}
        aria-label={`Chat with ${conversation.participantName}`}
      >
        {/* Avatar + online dot */}
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            {initials}
          </div>
          {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {escapeHtml(conversation.participantName)}
            </p>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatRelativeTime(conversation.lastMessageTime)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-xs text-gray-500 truncate">
              {escapeHtml(conversation.lastMessage)}
            </p>
            {conversation.unreadCount > 0 && (
              <span
                className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1"
              >
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }
);

ConversationItem.displayName = 'ConversationItem';
