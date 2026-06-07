import { supabase } from './supabase';

export interface Keyword {
  id: string;
  keyword_text: string;
  target_url: string;
  link_text?: string;
  priority: number;
  is_active: boolean;
  link_frequency: 'first' | 'all' | 'limited';
  max_links_per_page: number;
  case_sensitive: boolean;
}

export interface PageLink {
  source_page_url: string;
  target_page_url: string;
  keyword_id: string;
  anchor_text: string;
  link_count: number;
}

export async function fetchActiveKeywords(): Promise<Keyword[]> {
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching keywords:', error);
    return [];
  }

  return data || [];
}

export async function getExistingLinks(sourcePageUrl: string): Promise<PageLink[]> {
  const { data, error } = await supabase
    .from('page_links')
    .select('*')
    .eq('source_page_url', sourcePageUrl);

  if (error) {
    console.error('Error fetching existing links:', error);
    return [];
  }

  return data || [];
}

export async function trackPageLink(linkData: Omit<PageLink, 'id'>): Promise<void> {
  const { error } = await supabase
    .from('page_links')
    .upsert(linkData, {
      onConflict: 'source_page_url,keyword_id',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Error tracking page link:', error);
  }
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createLinkElement(keyword: Keyword, matchedText: string): string {
  const anchorText = keyword.link_text || matchedText;
  return `<a href="${keyword.target_url}" class="text-[#be0e0c] hover:text-[#9f0b0a] underline transition-colors">${anchorText}</a>`;
}

export function processContentWithLinks(
  content: string,
  keywords: Keyword[],
  currentPageUrl: string,
  existingLinks: PageLink[]
): { content: string; newLinks: Omit<PageLink, 'id'>[] } {
  let processedContent = content;
  const newLinks: Omit<PageLink, 'id'>[] = [];
  const linkCounts = new Map<string, number>();

  existingLinks.forEach(link => {
    linkCounts.set(link.keyword_id, link.link_count);
  });

  keywords.forEach(keyword => {
    if (keyword.target_url === currentPageUrl) {
      return;
    }

    const existingCount = linkCounts.get(keyword.id) || 0;

    if (keyword.link_frequency === 'first' && existingCount > 0) {
      return;
    }

    if (keyword.link_frequency === 'limited' && existingCount >= keyword.max_links_per_page) {
      return;
    }

    const flags = keyword.case_sensitive ? 'g' : 'gi';
    const regex = new RegExp(`\\b${escapeRegExp(keyword.keyword_text)}\\b(?![^<]*>)`, flags);

    const matches = processedContent.match(regex);
    if (!matches) {
      return;
    }

    let replacementCount = 0;
    let tempContent = processedContent;

    if (keyword.link_frequency === 'first') {
      tempContent = tempContent.replace(regex, (match) => {
        if (replacementCount === 0) {
          replacementCount++;
          newLinks.push({
            source_page_url: currentPageUrl,
            target_page_url: keyword.target_url,
            keyword_id: keyword.id,
            anchor_text: keyword.link_text || match,
            link_count: 1
          });
          return createLinkElement(keyword, match);
        }
        return match;
      });
    } else if (keyword.link_frequency === 'all') {
      tempContent = tempContent.replace(regex, (match) => {
        replacementCount++;
        return createLinkElement(keyword, match);
      });

      if (replacementCount > 0) {
        newLinks.push({
          source_page_url: currentPageUrl,
          target_page_url: keyword.target_url,
          keyword_id: keyword.id,
          anchor_text: keyword.link_text || keyword.keyword_text,
          link_count: replacementCount
        });
      }
    } else if (keyword.link_frequency === 'limited') {
      const remainingSlots = keyword.max_links_per_page - existingCount;

      tempContent = tempContent.replace(regex, (match) => {
        if (replacementCount < remainingSlots) {
          replacementCount++;
          return createLinkElement(keyword, match);
        }
        return match;
      });

      if (replacementCount > 0) {
        newLinks.push({
          source_page_url: currentPageUrl,
          target_page_url: keyword.target_url,
          keyword_id: keyword.id,
          anchor_text: keyword.link_text || keyword.keyword_text,
          link_count: replacementCount
        });
      }
    }

    processedContent = tempContent;
  });

  return { content: processedContent, newLinks };
}

export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}
