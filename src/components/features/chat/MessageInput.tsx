'use client';

import React, { useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendMessageSchema } from '@/lib/validations/chat.schema';

type FormValues = {
  content: string;
};

interface MessageInputProps {
  onSend: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled = false,
}) => {
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(sendMessageSchema) as any,
    defaultValues: { content: '' },
  });

  const content = watch('content');

  const handleKeyDown = useCallback(() => {
    onTypingStart?.();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTypingStop?.();
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  const onSubmit = (data: FormValues) => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTypingStop?.();
    onSend(data.content);
    reset();
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(onSubmit)();
    }
  };

  const hasContent = content.trim().length > 0;

  return (
    <div className="border-t border-gray-100 bg-white px-3 py-2">
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <textarea
            {...register('content')}
            onKeyDown={handleTextKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Type a message…"
            className="w-full resize-none rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:!outline-none focus:ring-0 focus:border-teal-500 transition-colors max-h-32 overflow-y-auto disabled:opacity-40"
            style={{ scrollbarWidth: 'thin' }}
          />
          {errors.content && (
            <p className="absolute -top-5 left-0 text-[10px] text-red-500">
              {errors.content.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !hasContent}
          className={[
            'shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm',
            hasContent && !disabled
              ? 'bg-primary text-white hover:scale-105 active:scale-95'
              : 'bg-gray-200 text-gray-400',
          ].join(' ')}
          aria-label="Send message"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
};

MessageInput.displayName = 'MessageInput';
