'use client';

import React from 'react';

export const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-2 px-4 py-2" aria-label="Other person is typing">
    {/* Avatar placeholder */}
    <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
    {/* Bubble */}
    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
    </div>
  </div>
);

TypingIndicator.displayName = 'TypingIndicator';
