import termsParagraphs from '@/content/terms-plain-paragraphs.json';
import { renderTermsParagraphs } from '@/components/legal/renderTermsParagraphs';

export function TermsDocumentBody() {
  const paras = termsParagraphs as string[];
  return <div className="space-y-0">{renderTermsParagraphs(paras)}</div>;
}
