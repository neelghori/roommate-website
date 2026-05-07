'use client';

import React, { useState, useMemo } from 'react';
import { Flag, AlertTriangle, CheckCircle2, XCircle, Search } from 'lucide-react';
import { REPORTS } from '@/mock/data/admin';
import { Report } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { useToast } from '@/components/ui/Toast';

type StatusFilter = 'ALL' | Report['status'];

const REASON_LABELS: Record<string, string> = {
  FAKE_LISTING: 'Fake Listing',
  FRAUD: 'Fraud',
  HARASSMENT: 'Harassment',
  SPAM: 'Spam',
  INAPPROPRIATE: 'Inappropriate',
  OTHER: 'Other',
};

const STATUS_CONFIG: Record<
  Report['status'],
  { label: string; className: string; dotColor: string }
> = {
  OPEN: { label: 'Open', className: 'bg-red-50 text-red-600 border-red-100', dotColor: 'bg-red-500' },
  IN_REVIEW: { label: 'In Review', className: 'bg-blue-50 text-blue-600 border-blue-100', dotColor: 'bg-blue-500' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-50 text-green-600 border-green-100', dotColor: 'bg-green-500' },
  DISMISSED: { label: 'Dismissed', className: 'bg-gray-50 text-gray-500 border-gray-100', dotColor: 'bg-gray-400' },
};

export default function AdminReportsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [statuses, setStatuses] = useState<Record<string, Report['status']>>(
    Object.fromEntries(REPORTS.map((r) => [r.id, r.status]))
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return REPORTS.filter((r) => {
      const currentStatus = statuses[r.id] ?? r.status;
      const matchesSearch =
        !search ||
        r.reporterName.toLowerCase().includes(search.toLowerCase()) ||
        r.targetName.toLowerCase().includes(search.toLowerCase()) ||
        REASON_LABELS[r.reason].toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, statuses]);

  const updateStatus = (id: string, newStatus: Report['status'], label: string) => {
    setStatuses((prev) => ({ ...prev, [id]: newStatus }));
    toast.success(`Report ${label}`);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: REPORTS.length };
    REPORTS.forEach((r) => {
      const s = statuses[r.id] ?? r.status;
      c[s] = (c[s] ?? 0) + 1;
    });
    return c;
  }, [statuses]);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">{REPORTS.length} total reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by reporter, target, or reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-gray-200 text-gray-600 bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s as Report['status']]?.label ?? s}
              <span className="ml-1 text-[10px] font-bold">({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-2">{filtered.length} report{filtered.length !== 1 ? 's' : ''}</p>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
            No reports match the filters
          </div>
        ) : (
          filtered.map((report) => {
            const currentStatus = statuses[report.id] ?? report.status;
            const cfg = STATUS_CONFIG[currentStatus];
            const isExpanded = expanded === report.id;

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header row */}
                <button
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : report.id)}
                >
                  <Flag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{report.targetName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {report.targetType}
                      </span>
                      <span className="text-xs font-medium text-orange-500">
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      By {report.reporterName} · {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.className}`}
                  >
                    {cfg.label}
                  </span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">{report.description}</p>
                    {currentStatus === 'OPEN' || currentStatus === 'IN_REVIEW' ? (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button
                          onClick={() => updateStatus(report.id, 'RESOLVED', 'resolved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'IN_REVIEW', 'marked for review')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Mark in Review
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'DISMISSED', 'dismissed')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateStatus(report.id, 'OPEN', 'reopened')}
                        className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
                      >
                        Reopen report
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
