import privacyParagraphs from '@/content/privacy-plain-paragraphs.json';
import { renderPrivacyParagraphs } from '@/components/legal/renderPrivacyParagraphs';

export function PrivacyDocumentBody() {
  const paras = privacyParagraphs as string[];
  return <div className="space-y-0">{renderPrivacyParagraphs(paras)}</div>;
}
