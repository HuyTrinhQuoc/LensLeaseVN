import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  searchService,
  type SearchSuggestion,
} from '../../services/search.service';

function formatPrice(n?: number) {
  if (n == null || Number.isNaN(n)) return '';
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ/ngày';
}

function thumbUrl(s: SearchSuggestion) {
  return (
    s.thumbnail ||
    'https://placehold.co/80x60/e2e8f0/94a3b8?text=Lens'
  );
}

type Props = {
  onSearch?: (query: string) => void;
};

export default function HeaderSearchAutocomplete({ onSearch }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (location.pathname === '/products' && q) {
      setQuery(q);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    setRecent(searchService.getRecentSearches());
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchService.getSuggestions(q, 8);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchSuggestions(query);
    }, 280);
    return () => window.clearTimeout(t);
  }, [query, fetchSuggestions]);

  const goSearch = (term: string) => {
    const q = term.trim();
    if (!q) return;
    searchService.pushRecentSearch(q);
    setRecent(searchService.getRecentSearches());
    setOpen(false);
    setActiveIndex(-1);
    onSearch?.(q);
    navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const goProduct = (item: SearchSuggestion) => {
    if (!item.id) {
      goSearch(item.title);
      return;
    }
    searchService.pushRecentSearch(item.title);
    setRecent(searchService.getRecentSearches());
    setOpen(false);
    setActiveIndex(-1);
    navigate(`/products/${item.id}`);
  };

  const flatItems: Array<
    | { type: 'suggestion'; item: SearchSuggestion }
    | { type: 'recent'; term: string }
    | { type: 'view-all' }
  > = [];

  if (query.trim()) {
    suggestions.forEach((item) => flatItems.push({ type: 'suggestion', item }));
    if (suggestions.length > 0) flatItems.push({ type: 'view-all' });
  } else {
    recent.forEach((term) => flatItems.push({ type: 'recent', term }));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        const row = flatItems[activeIndex];
        if (row.type === 'suggestion') goProduct(row.item);
        else if (row.type === 'recent') goSearch(row.term);
        else if (row.type === 'view-all') goSearch(query);
      } else {
        goSearch(query);
      }
    }
  };

  const showPanel = open && (loading || flatItems.length > 0 || !!query.trim());

  return (
    <div className="dark-header__search dark-header__search--autocomplete" ref={rootRef}>
      <span className="material-symbols-outlined dark-header__search-leading">search</span>
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-autocomplete="list"
        aria-controls="header-search-listbox"
        placeholder="Tìm máy ảnh, ống kính, tripod..."
        value={query}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {showPanel && (
        <div
          id="header-search-listbox"
          role="listbox"
          className="dark-header__search-panel"
        >
          {loading && (
            <div className="dark-header__search-status">
              <span className="material-symbols-outlined spin">progress_activity</span>
              Đang gợi ý...
            </div>
          )}

          {!loading && !query.trim() && recent.length > 0 && (
            <div className="dark-header__search-section">
              <div className="dark-header__search-section-head">
                <span>Tìm kiếm gần đây</span>
                <button
                  type="button"
                  onClick={() => {
                    searchService.clearRecentSearches();
                    setRecent([]);
                  }}
                >
                  Xóa
                </button>
              </div>
              {recent.map((term, idx) => {
                const flatIdx = flatItems.findIndex(
                  (r) => r.type === 'recent' && r.term === term,
                );
                return (
                  <button
                    key={term}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === flatIdx}
                    className={`dark-header__search-row ${
                      activeIndex === flatIdx ? 'is-active' : ''
                    }`}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    onClick={() => goSearch(term)}
                  >
                    <span className="material-symbols-outlined">history</span>
                    <span className="dark-header__search-row-title">{term}</span>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && query.trim() && suggestions.length === 0 && (
            <div className="dark-header__search-empty">
              Không có gợi ý — nhấn Enter để tìm &quot;{query.trim()}&quot;
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="dark-header__search-section">
              <div className="dark-header__search-section-head">
                <span>Gợi ý sản phẩm</span>
              </div>
              {suggestions.map((item) => {
                const flatIdx = flatItems.findIndex(
                  (r) => r.type === 'suggestion' && r.item.id === item.id,
                );
                return (
                  <button
                    key={item.id || item.title}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === flatIdx}
                    className={`dark-header__search-row dark-header__search-row--product ${
                      activeIndex === flatIdx ? 'is-active' : ''
                    }`}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    onClick={() => goProduct(item)}
                  >
                    <img src={thumbUrl(item)} alt="" loading="lazy" />
                    <div className="dark-header__search-row-body">
                      <span className="dark-header__search-row-title">{item.title}</span>
                      <span className="dark-header__search-row-meta">
                        {[item.brand, item.category_name].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    {item.price_per_day != null && (
                      <span className="dark-header__search-row-price">
                        {formatPrice(item.price_per_day)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!loading && query.trim() && suggestions.length > 0 && (
            <button
              type="button"
              role="option"
              aria-selected={activeIndex === flatItems.length - 1}
              className={`dark-header__search-footer ${
                activeIndex === flatItems.length - 1 ? 'is-active' : ''
              }`}
              onMouseEnter={() => setActiveIndex(flatItems.length - 1)}
              onClick={() => goSearch(query)}
            >
              <span className="material-symbols-outlined">manage_search</span>
              Xem tất cả kết quả cho &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        className="dark-header__search-btn"
        onClick={() => goSearch(query)}
        aria-label="Tìm kiếm"
      >
        <span className="material-symbols-outlined">search</span>
      </button>
    </div>
  );
}
