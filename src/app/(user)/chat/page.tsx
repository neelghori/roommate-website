'use client';

import React, { useEffect, useState } from 'react';
import { Search, MessageSquarePlus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/modules/chat.service';
import { wsService } from '@/services/wsService';
import { ConversationItem } from '@/components/features/chat/ConversationItem';
import { ChatSidebar } from '@/components/features/chat/ChatSidebar';
import { UserLayout } from '@/components/shared/UserLayout';
import { TopBar } from '@/components/shared/TopBar';
import { BottomNav } from '@/components/shared/BottomNav';
import { MessageSquare } from 'lucide-react';

export default function ChatListPage() {
  const { conversations, setConversations, totalUnread } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    chatService.getConversations().then((data) => {
      if (mounted) {
        setConversations(data);
        setLoading(false);
      }
    });
    wsService.connect();
    return () => { mounted = false; };
  }, [setConversations]);

  const filtered = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  );

  // ── Desktop WhatsApp layout (lg+) ──────────────────────────────────────────
  return (
    <>
      {/* ── DESKTOP (lg+): WhatsApp-style two-panel layout ── */}
      <div className="hidden lg:flex flex-col" style={{ height: '100dvh' }}>
        <TopBar showSearch={false} />

        {/* Two-panel area below TopBar */}
        <div className="flex flex-1 overflow-hidden pt-16">
          {/* Left sidebar — fixed width, scrollable */}
          <div className="w-[340px] xl:w-[380px] flex-shrink-0 h-full">
            <ChatSidebar />
          </div>

          {/* Right welcome panel */}
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] border-l border-gray-200">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: '#e8f4f4' }}
            >
              <MessageSquare className="w-12 h-12" style={{ color: '#1B8F8F' }} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Your Messages
            </h2>
            <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
              Select a conversation from the left to start chatting with your roommate matches.
            </p>
            <div
              className="mt-6 px-5 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#1B8F8F', opacity: 0.85 }}
            >
              Select a chat to begin
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET: original layout unchanged ── */}
      <div className="lg:hidden">
        <UserLayout showSearch={false} showFab={false} pageSuffix="Messages">
          <div className="min-h-screen bg-white max-w-3xl mx-auto">
            {/* Sticky header + search */}
            <div className="sticky top-14 z-10 px-4 pt-4 pb-3 bg-white border-b border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Messages
                  {totalUnread > 0 && (
                    <span
                      className="ml-2 inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full text-white text-xs font-bold px-1"
                      style={{ backgroundColor: '#F57C00' }}
                    >
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </h1>
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
            </div>

            {/* Conversation list */}
            {loading ? (
              <ConversationSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {search ? 'No results found' : 'No conversations yet'}
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">
                  {search
                    ? 'Try searching a different name'
                    : 'Start chatting with roommate matches or listing owners'}
                </p>
                {!search && (
                  <a
                    href="/roommates"
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#1B8F8F' }}
                  >
                    Find Roommates
                  </a>
                )}
              </div>
            ) : (
              <nav aria-label="Conversations" className="divide-y divide-gray-50 bg-white">
                {filtered.map((conv) => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))}
              </nav>
            )}
          </div>
        </UserLayout>
      </div>
    </>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function ConversationSkeleton() {
  return (
    <div className="divide-y divide-gray-50 bg-white" aria-busy="true" aria-label="Loading conversations">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-2.5 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="h-2.5 bg-gray-100 rounded w-10 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
