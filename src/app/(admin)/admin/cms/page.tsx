'use client';

import React, { useState } from 'react';
import { FileText, Edit3, Eye, EyeOff, Check, X } from 'lucide-react';
import { CMS_PAGES } from '@/mock/data/admin';
import { CmsPage } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { useToast } from '@/components/ui/Toast';

export default function AdminCmsPage() {
  const [pages, setPages] = useState<CmsPage[]>(CMS_PAGES);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const { toast } = useToast();

  const startEdit = (page: CmsPage) => {
    setEditing(page);
    setEditTitle(page.title);
    setEditContent(page.content);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditContent('');
    setEditTitle('');
  };

  const saveEdit = () => {
    if (!editing) return;
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setPages((prev) =>
      prev.map((p) =>
        p.id === editing.id
          ? { ...p, title: editTitle.trim(), content: editContent.trim(), updatedAt: new Date().toISOString() }
          : p
      )
    );
    toast.success('Page Saved', `"${editTitle}" has been updated.`);
    cancelEdit();
  };

  const togglePublished = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPublished: !p.isPublished } : p))
    );
    const page = pages.find((p) => p.id === id);
    if (page) {
      toast.info(page.isPublished ? `"${page.title}" unpublished` : `"${page.title}" published`);
    }
  };

  // Show editor if a page is being edited
  if (editing) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Edit Page</h1>
          <button onClick={cancelEdit} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
          />
        </div>

        {/* Slug (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
          <div className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500">
            /{editing.slug}
          </div>
        </div>

        {/* Content (Markdown) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
            <span className="ml-1.5 text-xs text-gray-400 font-normal">(Markdown supported)</span>
          </label>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={16}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white resize-y"
          />
        </div>

        {/* Preview note */}
        <p className="text-xs text-gray-400 mb-4 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          ⚠️ Preview renderer not included in frontend demo — Markdown will be parsed by the backend.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={saveEdit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1B8F8F' }}
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
          <button
            onClick={cancelEdit}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage content pages (About, Privacy, Terms, FAQ)</p>
      </div>

      <div className="space-y-3">
        {pages.map((page) => (
          <div
            key={page.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EDF5F5' }}
                >
                  <FileText className="w-4.5 h-4.5" style={{ color: '#1B8F8F' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{page.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">/{page.slug}</p>
                  <p className="text-xs text-gray-400">Updated {formatDate(page.updatedAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Publish toggle */}
                <button
                  onClick={() => togglePublished(page.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    page.isPublished
                      ? 'bg-green-50 text-green-600 border-green-100'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                  title={page.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {page.isPublished ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  {page.isPublished ? 'Live' : 'Draft'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => startEdit(page)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Edit page"
                >
                  <Edit3 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content preview */}
            <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed pl-12">
              {page.content.replace(/^#.+$/gm, '').replace(/\*\*/g, '').trim().slice(0, 120)}…
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
