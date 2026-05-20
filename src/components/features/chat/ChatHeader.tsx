'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChatConversation } from '@/types';

interface ChatHeaderProps {
  conversation: ChatConversation;
  isTyping?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = React.memo(
  ({ conversation, isTyping = false }) => {
    const initials = conversation.participantName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shadow-sm z-10 shrink-0"
        aria-label={`Chat with ${conversation.participantName}`}
      >
        <Link
          href="/chat"
          className="md:hidden shrink-0 p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            {initials}
          </div>
          {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {conversation.participantName}
          </p>
          <p className="text-xs" style={{ color: isTyping ? '#1B8F8F' : '#9CA3AF' }}>
            {isTyping ? 'typing…' : conversation.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </header>
    );
  },
);

ChatHeader.displayName = 'ChatHeader';
