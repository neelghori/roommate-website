import React from 'react';

const METRICS = [
  { val: '₹0',  label: 'To join',     sub: 'Free forever'    },
  { val: '0%',  label: 'Commission',  sub: 'Direct contact'  },
  { val: '24h', label: 'Support',     sub: 'Response time'   },
] as const;

export function AuthActivityFeed() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex divide-x divide-white/10">
        {METRICS.map(({ val, label, sub }) => (
          <div key={label} className="flex-1 px-3 py-4 text-center">
            <p className="text-2xl font-black leading-none text-amber-500 tabular-nums">{val}</p>
            <p className="mt-1.5 text-[11px] font-semibold leading-none text-white/80">{label}</p>
            <p className="mt-1 text-[9px] leading-none text-white/40">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
