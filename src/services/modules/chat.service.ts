/**
 * chat.service.ts
 * Chat & messaging service module.
 *
 * MOCK MODE: Returns mock data with artificial delay.
 * BACKEND INTEGRATION: Replace mock functions with apiClient calls.
 * For real-time, integrate Socket.IO or Pusher alongside these REST endpoints.
 *
 * Expected endpoints:
 *   GET  /chat/conversations              → ChatConversation[]
 *   GET  /chat/conversations/:id/messages → ChatMessage[]
 *   POST /chat/conversations/:id/messages → ChatMessage
 *   PUT  /chat/conversations/:id/read     → void
 *   POST /chat/conversations              → ChatConversation
 */

import { ChatConversation, ChatMessage } from '@/types';
import { CHAT_CONVERSATIONS, CHAT_MESSAGES } from '@/mock/data/users';

// Mock delay to simulate network latency
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const chatService = {
  /**
   * Get all conversations for the current user.
   * BACKEND: GET /chat/conversations
   */
  getConversations: async (): Promise<ChatConversation[]> => {
    await delay();
    return [...CHAT_CONVERSATIONS].sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
    );
  },

  /**
   * Get all messages in a conversation.
   * BACKEND: GET /chat/conversations/:id/messages
   */
  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    await delay();
    const messages = CHAT_MESSAGES[conversationId];
    if (!messages) {
      return [];
    }
    return [...messages].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  },

  /**
   * Send a new message in a conversation.
   * BACKEND: POST /chat/conversations/:id/messages
   */
  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    await delay(300);
    const conversation = CHAT_CONVERSATIONS.find((c) => c.id === conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'u1',
      receiverId: conversation.participantId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text',
    };
    return newMessage;
  },

  /**
   * Mark all messages in a conversation as read.
   * BACKEND: PUT /chat/conversations/:id/read
   */
  markAsRead: async (conversationId: string): Promise<void> => {
    await delay(200);
    void conversationId; // used in real implementation
  },

  /**
   * Start a new conversation with a user.
   * BACKEND: POST /chat/conversations
   */
  startConversation: async (userId: string): Promise<ChatConversation> => {
    await delay();
    const existing = CHAT_CONVERSATIONS.find((c) => c.participantId === userId);
    if (existing) {
      return existing;
    }
    // Return a new empty conversation
    const newConversation: ChatConversation = {
      id: `conv-${Date.now()}`,
      participantId: userId,
      participantName: 'New Contact',
      participantAvatar: 'NC',
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isOnline: false,
    };
    return newConversation;
  },
};
