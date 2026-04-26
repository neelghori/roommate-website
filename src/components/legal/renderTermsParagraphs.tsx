import React from 'react';

const MAIN_SECTION = /^(?:1[0-4]|[1-9])\.\s{2}\S/;
const SUB_CODE = /^\d{1,2}\.\d{1,2}$/;

function isMainSection(p: string): boolean {
  return MAIN_SECTION.test(p.trim());
}

function isSubCodeOnly(p: string): boolean {
  return SUB_CODE.test(p.trim());
}

/**
 * Renders flat paragraphs extracted from the Roommat Living Terms DOCX
 * (see `terms-plain-paragraphs.json`).
 */
export function renderTermsParagraphs(paras: string[]): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const nextKey = () => key++;

  // Hero (first lines until "NOTE")
  const hero: string[] = [];
  while (i < paras.length && paras[i] !== 'NOTE') {
    hero.push(paras[i]);
    i += 1;
  }
  if (hero.length) {
    out.push(
      <header key={nextKey()} className="mb-10 text-center sm:text-left">
        {hero.map((line, idx) => {
          if (idx === 0) {
            return (
              <p key={`h-${idx}`} className="text-sm font-semibold uppercase tracking-widest text-primary">
                {line}
              </p>
            );
          }
          if (line === 'TERMS AND CONDITIONS') {
            return (
              <h1 key={`h-${idx}`} className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                {line}
              </h1>
            );
          }
          if (line.startsWith('Effective Date:')) {
            return (
              <p key={`h-${idx}`} className="mt-3 text-sm font-medium text-gray-600">
                {line}
              </p>
            );
          }
          return (
            <p key={`h-${idx}`} className="mt-1 text-sm text-gray-500">
              {line}
            </p>
          );
        })}
      </header>,
    );
  }

  if (i < paras.length && paras[i] === 'NOTE') {
    i += 1;
    const noteBody = paras[i] ?? '';
    i += 1;
    out.push(
      <aside
        key={nextKey()}
        className="mb-10 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm text-amber-950"
      >
        <p className="font-bold uppercase tracking-wide text-amber-900">Note</p>
        <p className="mt-2 leading-relaxed text-amber-950/95">{noteBody}</p>
      </aside>,
    );
  }

  while (i < paras.length) {
    const p = paras[i];

    if (p === 'ROOMMAT LIVING — CONTACT INFORMATION') {
      const block: string[] = [p];
      i += 1;
      while (i < paras.length && !paras[i].startsWith('By using Roommat Living')) {
        block.push(paras[i]);
        i += 1;
      }
      out.push(
        <section key={nextKey()} className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-900">{block[0]}</h2>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            {block.slice(1).map((line, idx) => (
              <p key={idx}>{line.trim()}</p>
            ))}
          </div>
        </section>,
      );
      if (i < paras.length && paras[i].startsWith('By using Roommat Living')) {
        out.push(
          <p key={nextKey()} className="mt-6 text-sm font-medium text-gray-800">
            {paras[i]}
          </p>,
        );
        i += 1;
      }
      continue;
    }

    if (isMainSection(p)) {
      out.push(
        <h2 key={nextKey()} className="mt-12 scroll-mt-24 text-xl font-bold text-gray-900 first:mt-0">
          {p.trim()}
        </h2>,
      );
      i += 1;
      continue;
    }

    if (isSubCodeOnly(p)) {
      const code = p.trim();
      const term = paras[i + 1] ?? '';
      const body = paras[i + 2] ?? '';
      i += 3;

      const bullets: string[] = [];
      const introEndsWithColon =
        body.trim().endsWith(':') || /following types/i.test(body) || /following activities/i.test(body);
      if (introEndsWithColon) {
        while (i < paras.length && !isSubCodeOnly(paras[i]) && !isMainSection(paras[i])) {
          bullets.push(paras[i]);
          i += 1;
        }
      }

      out.push(
        <section key={nextKey()} className="mt-6 border-b border-gray-100 pb-6 last:border-0">
          <h3 className="text-sm font-bold text-primary">
            <span className="text-gray-900">{code}</span>{' '}
            <span className="text-gray-900">{term}</span>
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{body}</p>
          {bullets.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-gray-700">
              {bullets.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>,
      );
      continue;
    }

    // Fallback: standalone paragraph
    out.push(
      <p key={nextKey()} className="mt-4 text-sm leading-relaxed text-gray-700">
        {p}
      </p>,
    );
    i += 1;
  }

  return out;
}
