'use client';

/**
 * Property gallery: existing S3 URLs + new local files.
 * First image in order is the cover photo.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';

const DEFAULT_MAX = 5;
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

export type ListingGalleryChange = {
  keptExistingUrls: string[];
  newFiles: File[];
};

type ExistingItem = { id: string; url: string };
type NewPreview = { id: string; file: File; objectUrl: string };

type ListingGalleryEditorProps = {
  initialExistingUrls?: string[];
  maxImages?: number;
  onChange?: (state: ListingGalleryChange) => void;
  className?: string;
};

export function ListingGalleryEditor({
  initialExistingUrls = [],
  maxImages = DEFAULT_MAX,
  onChange,
  className = '',
}: ListingGalleryEditorProps) {
  const limit = Math.max(1, maxImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existing, setExisting] = useState<ExistingItem[]>(() =>
    initialExistingUrls.map((url, i) => ({ id: `ex-${i}-${url}`, url })),
  );
  const [newPreviews, setNewPreviews] = useState<NewPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setExisting(initialExistingUrls.map((url, i) => ({ id: `ex-${i}-${url}`, url })));
    setNewPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.objectUrl));
      return [];
    });
  }, [initialExistingUrls]);

  const emit = useCallback(
    (ex: ExistingItem[], nw: NewPreview[]) => {
      onChange?.({
        keptExistingUrls: ex.map((e) => e.url),
        newFiles: nw.map((p) => p.file),
      });
    },
    [onChange],
  );

  const totalCount = existing.length + newPreviews.length;
  const isFull = totalCount >= limit;

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const accepted = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
      if (!accepted.length) return;
      const remaining = limit - totalCount;
      if (remaining <= 0) return;
      const slice = accepted.slice(0, remaining);
      const added: NewPreview[] = slice.map((file) => ({
        file,
        objectUrl: URL.createObjectURL(file),
        id: `new-${file.name}-${Date.now()}-${Math.random()}`,
      }));
      setNewPreviews((prev) => {
        const next = [...prev, ...added];
        emit(existing, next);
        return next;
      });
    },
    [existing, emit, limit, totalCount],
  );

  const removeExisting = (id: string) => {
    setExisting((prev) => {
      const next = prev.filter((e) => e.id !== id);
      emit(next, newPreviews);
      return next;
    });
  };

  const removeNew = (id: string) => {
    setNewPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.objectUrl);
      const next = prev.filter((p) => p.id !== id);
      emit(existing, next);
      return next;
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const orderedItems: { kind: 'existing' | 'new'; id: string; src: string; onRemove: () => void }[] =
    [
      ...existing.map((e) => ({
        kind: 'existing' as const,
        id: e.id,
        src: e.url,
        onRemove: () => removeExisting(e.id),
      })),
      ...newPreviews.map((p) => ({
        kind: 'new' as const,
        id: p.id,
        src: p.objectUrl,
        onRemove: () => removeNew(p.id),
      })),
    ];

  return (
    <div className={['space-y-3', className].join(' ')}>
      {!isFull && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className={[
            'w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 bg-gray-50 hover:border-primary hover:bg-primary/5',
          ].join(' ')}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
            <Camera size={22} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {isDragging ? 'Drop photos here' : 'Tap to add photos'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPEG, PNG, WebP · Max {limit} photos · {totalCount}/{limit}
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={handleFileInput}
        aria-hidden
      />

      {orderedItems.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {orderedItems.map((item, index) => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square">
              <img src={item.src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={item.onRemove}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/80"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
              {index === 0 ? (
                <div className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/50 rounded px-1.5 py-0.5">
                  Cover
                </div>
              ) : null}
              {item.kind === 'new' ? (
                <div className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-primary/80 rounded px-1.5 py-0.5">
                  New
                </div>
              ) : null}
            </div>
          ))}
          {!isFull ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors bg-gray-50"
              aria-label="Add more photos"
            >
              <ImagePlus size={20} className="text-gray-400" />
              <span className="text-[10px] text-gray-400">Add more</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}




