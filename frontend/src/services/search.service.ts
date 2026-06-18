import api from './api';
import { SupabaseService } from './supabase.service';

export type SearchSuggestion = {
  id: string;
  title: string;
  brand?: string | null;
  thumbnail?: string | null;
  price_per_day?: number;
  category_name?: string | null;
};

const RECENT_KEY = 'lenslease_recent_searches';
const MAX_RECENT = 6;

function normalizeSuggestions(raw: unknown): SearchSuggestion[] {
  if (!raw) return [];

  const list = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && raw !== null && 'data' in raw
      ? (raw as { data: unknown }).data
      : [];

  if (!Array.isArray(list)) return [];

  return list
    .map((item) => {
      if (typeof item === 'string') {
        return { id: '', title: item };
      }
      if (item && typeof item === 'object' && 'title' in item) {
        const row = item as SearchSuggestion;
        return {
          id: row.id || '',
          title: row.title,
          brand: row.brand,
          thumbnail: row.thumbnail,
          price_per_day: row.price_per_day,
          category_name: row.category_name,
        };
      }
      return null;
    })
    .filter((x): x is SearchSuggestion => !!x && !!x.title);
}

export const searchService = {
  async getSuggestions(query: string, limit = 8): Promise<SearchSuggestion[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const rows = await SupabaseService.searchListings(q);
      if (rows.length > 0) {
        return rows.slice(0, limit).map((r) => ({
          id: r.id,
          title: r.title,
          brand: r.brand,
          thumbnail: r.thumbnail,
          price_per_day: Number(r.price_per_day),
          category_name: r.category?.name ?? null,
        }));
      }
    } catch {
      // fallback API
    }

    const res = await api.get('/suggestions', { params: { q, limit } });
    return normalizeSuggestions(res.data).slice(0, limit);
  },

  getRecentSearches(): string[] {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
    } catch {
      return [];
    }
  },

  pushRecentSearch(term: string) {
    const q = term.trim();
    if (!q) return;
    const prev = searchService.getRecentSearches().filter((s) => s !== q);
    const next = [q, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  },

  clearRecentSearches() {
    localStorage.removeItem(RECENT_KEY);
  },
};
