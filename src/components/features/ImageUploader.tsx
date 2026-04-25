/**
 * ImageUploader.tsx
 * Image upload UI component (mock / UI only — no actual upload).
 *
 * Features:
 * - Dashed border upload area with camera icon
 * - Preview thumbnails using local object URLs
 * - Remove individual images
 * - Configurable max images (default 5); single-image mode replaces on pick
 * - On click: triggers hidden file input, stores files locally
 */
'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, ImagePlus } from 'lucide-react';

const DEFAULT_MAX_IMAGES = 5;
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

interface ImageUploaderProps {
  /** Called with the current list of File objects whenever images change */
  onChange?: (files: File[]) => void;
  /** Initial files (for edit mode) */
  initialFiles?: File[];
  /** Max selectable images (1 = profile-style single photo) */
  maxImages?: number;
  className?: string;
}

interface PreviewImage {
  file: File;
  objectUrl: string;
  id: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onChange,
  initialFiles = [],
  maxImages = DEFAULT_MAX_IMAGES,
  className = '',
}) => {
  const limit = Math.max(1, maxImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<PreviewImage[]>(() =>
    initialFiles.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}`,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const acceptedAll = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
      if (!acceptedAll.length) return;

      if (limit === 1) {
        const file = acceptedAll[0];
        setPreviews((prev) => {
          prev.forEach((p) => URL.revokeObjectURL(p.objectUrl));
          const next: PreviewImage[] = [
            {
              file,
              objectUrl: URL.createObjectURL(file),
              id: `${file.name}-${Date.now()}-${Math.random()}`,
            },
          ];
          onChange?.([file]);
          return next;
        });
        return;
      }

      const remaining = limit - previews.length;
      if (remaining <= 0) return;

      const accepted = acceptedAll.slice(0, remaining);

      const newPreviews: PreviewImage[] = accepted.map((file) => ({
        file,
        objectUrl: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      }));

      setPreviews((prev) => {
        const updated = [...prev, ...newPreviews];
        onChange?.(updated.map((p) => p.file));
        return updated;
      });
    },
    [previews.length, onChange, limit]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.objectUrl);
      const updated = prev.filter((p) => p.id !== id);
      onChange?.(updated.map((p) => p.file));
      return updated;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const isFull = previews.length >= limit;
  const multiLabel = limit === 1 ? 'Tap to upload profile photo' : 'Tap to Upload Photos';
  const dropLabel = limit === 1 ? 'Drop photo here' : 'Drop photos here';
  const maxCopy = limit === 1 ? '1 photo' : `Max ${limit} photos`;

  return (
    <div className={['space-y-3', className].join(' ')}>
      {/* Upload area */}
      {!isFull && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label={limit === 1 ? 'Upload profile photo' : 'Upload photos'}
          className={[
            'w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 bg-gray-50 hover:border-primary hover:bg-primary/5',
          ].join(' ')}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10"
          >
            <Camera size={22} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {isDragging ? dropLabel : multiLabel}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPEG, PNG, WebP · {maxCopy}
            </p>
          </div>

          {/* Photo count indicator */}
          {limit > 1 && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className={['w-1.5 h-1.5 rounded-full transition-colors', i < previews.length ? 'bg-primary' : 'bg-gray-300'].join(' ')}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">
                {previews.length}/{limit}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple={limit > 1}
        className="hidden"
        onChange={handleFileInput}
        aria-hidden="true"
      />

      {/* Preview thumbnails */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview) => (
            <div key={preview.id} className="relative group rounded-xl overflow-hidden aspect-square">
              <img
                src={preview.objectUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(preview.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
              {/* Primary badge on first image */}
              {limit > 1 && preview === previews[0] && (
                <div className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/50 rounded px-1.5 py-0.5">
                  Cover
                </div>
              )}
            </div>
          ))}

          {/* "Add more" cell if not full */}
          {!isFull && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors bg-gray-50"
              aria-label="Add more photos"
            >
              <ImagePlus size={20} className="text-gray-400" />
              <span className="text-[10px] text-gray-400">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
