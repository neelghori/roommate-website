'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/modules/chat.service';
import { wsService } from '@/services/wsService';
import { ChatHeader } from '@/components/features/chat/ChatHeader';
import { MessageBubble } from '@/components/features/chat/MessageBubble';
import { MessageInput } from '@/components/features/chat/MessageInput';
import { TypingIndicator } from '@/components/features/chat/TypingIndicator';
import { ChatSidebar } from '@/components/features/chat/ChatSidebar';
import { ChatMessage, type ChatConversation } from '@/types';
import { TopBar } from '@/components/shared/TopBar';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/lib/authToken';

/** Returns true if two ISO timestamps are on different calendar days */
function isDifferentDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() !== db.getFullYear() ||
    da.getMonth() !== db.getMonth() ||
    da.getDate() !== db.getDate()
  );
}

export default function ChatThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const chatId = params.id;

  const {
    conversations,
    messagesByChatId,
    typing,
    setMessages,
    mergeThreadFromServer,
    appendMessage,
    confirmMessage,
    failMessage,
    setActiveChatId,
    markConversationRead,
    upsertConversation,
  } = useChatStore();

  const currentUserId = useAuthStore((s) => s.user?.id ?? '');

  const messages: ChatMessage[] = messagesByChatId[chatId] ?? [];
  const conversation = conversations.find((c) => c.id === chatId);
  const isTyping = typing[chatId] ?? false;

  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  // ── Mark active + load messages + mark read ──────────────────────────────────
  useEffect(() => {
    if (!chatId) return;
    setActiveChatId(chatId);
    wsService.connect(getAccessToken() ?? undefined);
    setLoading(true);

    void (async () => {
      try {
        const { messages: msgs, partner } = await chatService.getThread(chatId);
        mergeThreadFromServer(chatId, msgs);
        await chatService.markAsRead(chatId).catch(() => undefined);
        markConversationRead(chatId);

        const existing = useChatStore.getState().conversations.find((c) => c.id === chatId);
        if (!existing) {
          const name = partner?.fullName?.trim() || 'User';
          const initials = name
            .split(/\s+/)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
          const last = msgs.length ? msgs[msgs.length - 1] : null;
          const stub: ChatConversation = {
            id: chatId,
            participantId: chatId,
            participantName: name,
            participantAvatar: initials,
            lastMessage: last?.content ?? '',
            lastMessageTime: last?.timestamp ?? new Date().toISOString(),
            unreadCount: 0,
            isOnline: false,
          };
          upsertConversation(stub);
        }
      } catch {
        setMessages(chatId, []);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      setActiveChatId(null);
    };
  }, [chatId, setActiveChatId, setMessages, mergeThreadFromServer, markConversationRead, upsertConversation]);

  // ── Load conversations if not hydrated (direct URL visit) ───────────────────
  useEffect(() => {
    if (conversations.length === 0) {
      chatService.getConversations().then((data) => {
        useChatStore.getState().setConversations(data);
      });
    }
  }, [conversations.length]);

  // ── Poll thread while open (backup if WS down; merges so no duplicates) ─────
  useEffect(() => {
    if (!chatId || loading) return;
    const sync = () => {
      void chatService
        .getThread(chatId)
        .then(({ messages: msgs }) => {
          useChatStore.getState().mergeThreadFromServer(chatId, msgs);
        })
        .catch(() => undefined);
    };
    const interval = setInterval(sync, 4000);
    const onVis = () => {
      if (document.visibilityState === 'visible') sync();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [chatId, loading]);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    const behavior: ScrollBehavior = isFirstLoad.current ? 'instant' : 'smooth';
    bottomRef.current?.scrollIntoView({ behavior });
    isFirstLoad.current = false;
  }, [messages.length, isTyping]);

  // ── Back-nav guard: unknown thread id with no messages after load ───────────
  useEffect(() => {
    if (!loading && conversations.length > 0 && !conversation && messages.length === 0) {
      router.replace('/chat');
    }
  }, [loading, conversation, conversations.length, messages.length, router]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // 1. Optimistic append
      const tempId = `temp-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: tempId,
        senderId: currentUserId,
        receiverId: conversation?.participantId ?? chatId,
        content,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'text',
      };
      appendMessage(chatId, optimistic);

      try {
        // 2. Confirm via service
        const confirmed = await chatService.sendMessage(chatId, content);
        confirmMessage(chatId, tempId, confirmed);
      } catch {
        // 3. Rollback show retry UI
        failMessage(chatId, tempId);
      }
    },
    [chatId, conversation, currentUserId, appendMessage, confirmMessage, failMessage]
  );

  // ── Typing ───────────────────────────────────────────────────────────────────
  const handleTypingStart = useCallback(() => {
    wsService.send('typing:start', { chatId });
  }, [chatId]);

  const handleTypingStop = useCallback(() => {
    wsService.send('typing:stop', { chatId });
  }, [chatId]);

  // ── Chat thread panel (shared between desktop and mobile) ─────────────────────
  const chatPanel = (
    <>
      {/* Chat header */}
      {conversation ? (
        <ChatHeader conversation={conversation} isTyping={isTyping} />
      ) : (
        <ChatHeaderSkeleton />
      )}

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto bg-[#efeae2] py-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8bfb0' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-live="polite"
        aria-label="Messages"
      >
        {loading ? (
          <MessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-sm text-gray-500">
              Say hello to {conversation?.participantName ?? 'your contact'}!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showSep = !prevMsg || isDifferentDay(prevMsg.timestamp, msg.timestamp);
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === currentUserId}
                  showDateSeparator={showSep}
                  separatorDate={msg.timestamp}
                />
              );
            })}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} className="h-2" />
          </>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={loading}
      />
    </>
  );

  return (
    <>
      {/* ── DESKTOP (lg+): WhatsApp two-panel layout ── */}
      <div className="hidden lg:flex flex-col" style={{ height: '100dvh' }}>
        <TopBar showSearch={false} />

        {/* Two-panel area below TopBar */}
        <div className="flex flex-1 overflow-hidden pt-16">
          {/* Left sidebar */}
          <div className="w-[340px] xl:w-[380px] flex-shrink-0 h-full">
            <ChatSidebar activeChatId={chatId} />
          </div>

          {/* Right chat panel */}
          <div className="flex flex-col flex-1 overflow-hidden border-l border-gray-200">
            {chatPanel}
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET: original full-screen layout (unchanged) ── */}
      <div className="flex flex-col lg:hidden" style={{ minHeight: '100dvh' }}>
        {/* App topbar */}
        <TopBar showSearch={false} />

        {/* Chat area */}
        <div
          className="flex flex-col flex-1 overflow-hidden max-w-3xl mx-auto w-full pt-14 pb-16"
        >
          {chatPanel}
        </div>

        {/* Bottom nav */}
        <BottomNav />
      </div>
    </>
  );
}

// ── Skeletons ──────────────────────────────────────────────────────────────────
function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200" />
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-28" />
        <div className="h-2.5 bg-gray-100 rounded w-12" />
      </div>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-3 px-4 py-2 animate-pulse" aria-label="Loading messages">
      {[true, false, true, false, true, false].map((isOwn, i) => (
        <div
          key={i}
          className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}
        >
          <div
            className={`h-9 rounded-2xl ${isOwn ? 'bg-teal-100' : 'bg-gray-200'}`}
            style={{ width: `${40 + (i % 3) * 15}%`, maxWidth: 240 }}
          />
        </div>
      ))}
    </div>
  );
}
