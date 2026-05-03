/**
 * FAQ service GET /api/v1/faqs/
 */
import { isAxiosError } from 'axios';
import { apiClient } from '@/services/api';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

function normalizeFaq(raw: Record<string, unknown>, index: number): FaqItem | null {
  const question =
    (typeof raw.question === 'string' && raw.question) ||
    (typeof raw.title === 'string' && raw.title) ||
    (typeof raw.q === 'string' && raw.q) ||
    null;

  const answer =
    (typeof raw.answer === 'string' && raw.answer) ||
    (typeof raw.description === 'string' && raw.description) ||
    (typeof raw.content === 'string' && raw.content) ||
    (typeof raw.a === 'string' && raw.a) ||
    null;

  if (!question?.trim() || !answer?.trim()) return null;

  const id =
    (typeof raw._id === 'string' && raw._id) ||
    (typeof raw.id === 'string' && raw.id) ||
    `faq-${index}`;

  return { id, question: question.trim(), answer: answer.trim() };
}

function extractFaqArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const root = data as Record<string, unknown>;
    const inner = root.data;
    if (Array.isArray(inner)) return inner;
    if (inner && typeof inner === 'object') {
      const block = inner as Record<string, unknown>;
      if (Array.isArray(block.faqs)) return block.faqs;
      if (Array.isArray(block.items)) return block.items;
    }
    if (Array.isArray(root.faqs)) return root.faqs;
    if (Array.isArray(root.items)) return root.items;
    if (Array.isArray(root.results)) return root.results;
  }
  return [];
}

function faqErrorMessage(err: unknown): string {
  if (!isAxiosError(err)) return err instanceof Error ? err.message : 'Could not load FAQs';
  const data = err.response?.data as { message?: unknown } | undefined;
  const msg = data?.message;
  return typeof msg === 'string' ? msg : err.message || 'Could not load FAQs';
}

export const faqService = {
  /**
   * Public FAQs for Help & Support.
   * BACKEND: GET /api/v1/faqs/
   */
  getFaqs: async (): Promise<FaqItem[]> => {
    try {
      const { data } = await apiClient.get<unknown>('/api/v1/faqs/');
      const list = extractFaqArray(data);
      const out: FaqItem[] = [];
      list.forEach((item, i) => {
        if (item && typeof item === 'object') {
          const row = normalizeFaq(item as Record<string, unknown>, i);
          if (row) out.push(row);
        }
      });
      return out;
    } catch (err) {
      throw new Error(faqErrorMessage(err));
    }
  },
};
