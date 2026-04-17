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
import { ChatMessage } from '@/types';
import { TopBar } from '@/components/shared/TopBar';
import { BottomNav } from '@/components/shared/BottomNav';

const CURRENT_USER_ID = 'u1'; // BACKEND: replace with authStore.user?.id

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
    appendMessage,
    confirmMessage,
    failMessage,
    setActiveChatId,
    markConversationRead,
  } = useChatStore();

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
    wsService.connect();

    Promise.all([
      chatService.getMessages(chatId),
      chatService.markAsRead(chatId),
    ]).then(([msgs]) => {
      setMessages(chatId, msgs);
      markConversationRead(chatId);
      setLoading(false);
    });

    return () => {
      setActiveChatId(null);
    };
  }, [chatId, setActiveChatId, setMessages, markConversationRead]);

  // ── Load conversations if not hydrated (direct URL visit) ───────────────────
  useEffect(() => {
    if (conversations.length === 0) {
      chatService.getConversations().then((data) => {
        useChatStore.getState().setConversations(data);
      });
    }
  }, [conversations.length]);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    const behavior: ScrollBehavior = isFirstLoad.current ? 'instant' : 'smooth';
    bottomRef.current?.scrollIntoView({ behavior });
    isFirstLoad.current = false;
  }, [messages.length, isTyping]);

  // ── Back-nav guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && conversations.length > 0 && !conversation) {
      router.replace('/chat');
    }
  }, [loading, conversation, conversations.length, router]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // 1. Optimistic append
      const tempId = `temp-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: tempId,
        senderId: CURRENT_USER_ID,
        receiverId: conversation?.participantId ?? '',
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
        // 3. Rollback — show retry UI
        failMessage(chatId, tempId);
      }
    },
    [chatId, conversation, appendMessage, confirmMessage, failMessage]
  );

  // ── Typing ───────────────────────────────────────────────────────────────────
  const handleTypingStart = useCallback(() => {
    wsService.send('typing:start', { chatId });
  }, [chatId]);

  const handleTypingStop = useCallback(() => {
    wsService.send('typing:stop', { chatId });
  }, [chatId]);

  // ── Layout ───────────────────────────────────────────────────────────────────
  // Chat thread uses a special full-viewport layout:
  //   TopBar (56px) + thread content fills remaining + BottomNav (64px)
  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh' }}>
      {/* App topbar */}
      <TopBar showSearch={false} />

      {/* Chat area: fixed height between topbar and bottom nav */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ paddingTop: '3.5rem', paddingBottom: '4rem' }}
      >
        {/* Chat header */}
        {conversation ? (
          <ChatHeader conversation={conversation} isTyping={isTyping} />
        ) : (
          <ChatHeaderSkeleton />
        )}

        {/* Message list */}
        <div
          className="flex-1 overflow-y-auto bg-gray-50 py-2"
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
                    isOwn={msg.senderId === CURRENT_USER_ID}
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
      </div>

      {/* Bottom nav */}
      <BottomNav />
    </div>
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
