import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook dùng để gọi API từ service layer.
 * Quản lý trạng thái loading, data, error.
 *
 * @example
 * const { data, loading, error, refetch } = useFetch(() => lensService.getAll());
 */
export function useFetch<T>(
  fetcher: () => Promise<{ data: T }>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher();
      setData(response.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
