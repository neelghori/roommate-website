'use client';

import React, { useEffect, useState } from 'react';
import { Search, MessageSquarePlus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/modules/chat.service';
import { wsService } from '@/services/wsService';
import { getAccessToken } from '@/lib/authToken';
import { ConversationItem } from './ConversationItem';
import { ChatPushBanner } from './ChatPushBanner';

interface ChatSidebarProps {
  activeChatId?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ activeChatId }) => {
  const { conversations, setConversations, totalUnread } = useChatStore();
  const [loading, setLoading] = useState(conversations.length === 0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    if (conversations.length === 0) {
      chatService.getConversations().then((data) => {
        if (mounted) {
          setConversations(data);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    wsService.connect(getAccessToken() ?? undefined);
    return () => { mounted = false; };
  }, [conversations.length, setConversations]);

  const filtered = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Sidebar header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">
            Messages
            {totalUnread > 0 && (
              <span
                className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-white text-[10px] font-bold px-1"
                style={{ backgroundColor: '#F57C00' }}
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </h2>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="New conversation"
          >
            <MessageSquarePlus className="w-5 h-5" style={{ color: '#1B8F8F' }} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <ChatPushBanner className="mt-3" />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <SidebarSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {search ? 'No results' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-400">
              {search ? 'Try a different name' : 'Start chatting with a roommate match'}
            </p>
          </div>
        ) : (
          <nav aria-label="Conversations" className="divide-y divide-gray-50">
            {filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeChatId}
              />
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
};

ChatSidebar.displayName = 'ChatSidebar';

function SidebarSkeleton() {
  return (
    <div className="divide-y divide-gray-50 animate-pulse" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-2.5 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="h-2 bg-gray-100 rounded w-10 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
