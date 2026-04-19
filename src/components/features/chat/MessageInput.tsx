'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  sendMessageSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/validations/chat.schema';

type FormValues = {
  content: string;
  type: 'text' | 'image';
};

interface MessageInputProps {
  onSend: (content: string, attachment?: File) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(sendMessageSchema) as any,
    defaultValues: { content: '', type: 'text' as const },
  });

  const content = watch('content');

  // ── Typing events ────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(() => {
    onTypingStart?.();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTypingStop?.();
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = (data: FormValues) => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTypingStop?.();
    onSend(data.content, attachment ?? undefined);
    reset();
    setAttachment(null);
    setAttachError(null);
  };

  // ── Attachment ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setAttachError('Only JPEG, PNG, WebP, or PDF allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setAttachError('File must be under 5 MB.');
      return;
    }
    setAttachError(null);
    setAttachment(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachError(null);
  };

  // ── Enter to send (Shift+Enter = newline) ────────────────────────────────────
  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(onSubmit)();
    }
  };

  const hasContent = content.trim().length > 0 || attachment !== null;

  return (
    <div className="border-t border-gray-100 bg-white px-3 py-2">
      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 max-w-[220px]">
            <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-600 truncate">{attachment.name}</span>
          </div>
          <button
            type="button"
            onClick={removeAttachment}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Remove attachment"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Attachment error */}
      {attachError && (
        <p className="text-xs text-red-500 mb-1 px-1">{attachError}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
        {/* Attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Text area */}
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

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || !hasContent}
          className={[
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm',
            hasContent && !disabled ? 'bg-primary text-white hover:scale-105 active:scale-95' : 'bg-gray-200 text-gray-400'
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
