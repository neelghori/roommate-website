import React from 'react';

const SECTION_CODE = /^\d{2}$/;
const EMAIL_ONLY = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function clean(line: string): string {
  return line
    .replace(/\u00a0/g, ' ')
    .replace(/⚠️|⚠/g, 'Important:')
    .replace(/–|—/g, '-')
    .replace(/…/g, '...')
    .replace(/\?{3,}/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function toSectionId(heading: string): string {
  return `privacy-${clean(heading)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')}`;
}

function renderLine(line: string, key: number): React.ReactNode {
  const text = clean(line);
  if (!text) return null;

  if (EMAIL_ONLY.test(text)) {
    return (
      <p key={key} className="mt-3 text-sm text-gray-700">
        <a href={`mailto:${text}`} className="underline hover:text-primary transition-colors">
          {text}
        </a>
      </p>
    );
  }

  if (/^Email\s*:/.test(text)) {
    const value = text.replace(/^Email\s*:\s*/i, '').trim();
    return (
      <p key={key} className="mt-3 text-sm text-gray-700">
        Email:{' '}
        <a href={`mailto:${value}`} className="underline hover:text-primary transition-colors">
          {value}
        </a>
      </p>
    );
  }

  return (
    <p key={key} className="mt-3 text-sm leading-relaxed text-gray-700">
      {text}
    </p>
  );
}

function renderLabelValueRow(
  label: string,
  value: string,
  key: number,
): React.ReactNode {
  const safeValue = clean(value);
  if (!safeValue) return null;
  if (EMAIL_ONLY.test(safeValue)) {
    return (
      <div key={key} className="grid grid-cols-[140px_1fr] gap-3 text-sm">
        <p className="font-medium text-gray-800">{label}</p>
        <a href={`mailto:${safeValue}`} className="underline text-gray-700 hover:text-primary transition-colors">
          {safeValue}
        </a>
      </div>
    );
  }
  return (
    <div key={key} className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <p className="font-medium text-gray-800">{label}</p>
      <p className="text-gray-700">{safeValue}</p>
    </div>
  );
}

function renderContactSection(lines: string[], nextKey: () => number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pairs = new Map<string, string>();
  const labels = new Set(['Email', 'WhatsApp Support', 'Location', 'Governing Law']);
  for (let i = 0; i < lines.length; i += 1) {
    const curr = clean(lines[i]);
    if (!curr) continue;
    if (labels.has(curr) && i + 1 < lines.length) {
      pairs.set(curr, clean(lines[i + 1]));
      i += 1;
      continue;
    }
    if (!labels.has(curr)) {
      const p = renderLine(curr, nextKey());
      if (p) nodes.push(p);
    }
  }
  if (pairs.size) {
    nodes.push(
      <div key={nextKey()} className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
        {renderLabelValueRow('Email', pairs.get('Email') ?? '', nextKey())}
        {renderLabelValueRow('Location', pairs.get('Location') ?? '', nextKey())}
        {renderLabelValueRow('Governing Law', pairs.get('Governing Law') ?? '', nextKey())}
      </div>,
    );
  }
  return nodes;
}

function renderGrievanceSection(lines: string[], nextKey: () => number): React.ReactNode[] {
  const merged = clean(lines.join(' '));
  const m = merged.match(
    /Grievance Officer:\s*(.*?)\s*Company:\s*(.*?)\s*Email:\s*(.*?)\s*Address:\s*(.*?)\s*Response Time:\s*(.*)$/i,
  );
  if (!m) return lines.map((line) => renderLine(line, nextKey())).filter(Boolean) as React.ReactNode[];

  const [, officer, company, email, address, responseTime] = m;
  return [
    <div key={nextKey()} className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      {renderLabelValueRow('Grievance Officer', officer, nextKey())}
      {renderLabelValueRow('Company', company, nextKey())}
      {renderLabelValueRow('Email', email, nextKey())}
      {renderLabelValueRow('Address', address, nextKey())}
      {renderLabelValueRow('Response Time', responseTime, nextKey())}
    </div>,
  ];
}

export function renderPrivacyParagraphs(paras: string[]): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const nextKey = () => key++;

  const titleLines = paras.slice(0, 3).map(clean);
  if (titleLines.length >= 3) {
    out.push(
      <header key={nextKey()} className="mb-8 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{titleLines[0]}</p>
        <p className="mt-1 text-sm font-medium text-gray-600">{titleLines[1]}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">{titleLines[2]}</h1>
      </header>,
    );
    i = 3;
  }

  const preface: React.ReactNode[] = [];
  while (i < paras.length && clean(paras[i]) !== 'Table of Contents') {
    const node = renderLine(paras[i], nextKey());
    if (node) preface.push(node);
    i += 1;
  }
  if (preface.length) {
    out.push(
      <section key={nextKey()} className="mb-8">
        {preface}
      </section>,
    );
  }

  if (i < paras.length && clean(paras[i]) === 'Table of Contents') {
    i += 1;
    const toc: string[] = [];
    while (i < paras.length && !SECTION_CODE.test(clean(paras[i]))) {
      const text = clean(paras[i]);
      if (text) toc.push(text);
      i += 1;
    }
    out.push(
      <section key={nextKey()} className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Table of Contents</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          {toc.map((item, idx) => (
            <li key={idx}>
              <a href={`#${toSectionId(item)}`} className="hover:text-primary hover:underline transition-colors">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </section>,
    );
  }

  while (i < paras.length) {
    const code = clean(paras[i]);
    if (SECTION_CODE.test(code) && i + 1 < paras.length) {
      const heading = clean(paras[i + 1]);
      i += 2;
      const rawLines: string[] = [];
      while (i < paras.length && !SECTION_CODE.test(clean(paras[i]))) {
        rawLines.push(clean(paras[i]));
        i += 1;
      }
      let nodes: React.ReactNode[] = [];
      if (heading === 'Contact Us') {
        nodes = renderContactSection(rawLines, nextKey);
      } else if (heading === 'Grievance Officer') {
        nodes = renderGrievanceSection(rawLines, nextKey);
      } else {
        nodes = rawLines.map((line) => renderLine(line, nextKey())).filter(Boolean) as React.ReactNode[];
      }
      out.push(
        <section key={nextKey()} className="mt-8 border-b border-gray-100 pb-8 last:border-0">
          <h2 id={toSectionId(heading)} className="scroll-mt-24 text-xl font-bold text-gray-900">
            {code}. {heading}
          </h2>
          {nodes}
        </section>,
      );
      continue;
    }

    const node = renderLine(paras[i], nextKey());
    if (node) out.push(node);
    i += 1;
  }

  return out;
}
