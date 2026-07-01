import { useEffect, useState, useCallback } from 'react';
import { SupabaseService } from '../services/supabase.service';
import { getUserIdFromToken } from '../utils/auth';
import type { ProductItem } from '../type/product.type';

interface UseSupabaseLensOptions {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
}

interface UseSupabaseLensResult {
  items: ProductItem[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook để fetch lens_listings từ Supabase
 * Thay thế cho việc gọi backend API trực tiếp
 */
export function useSupabaseLens(options?: UseSupabaseLensOptions): UseSupabaseLensResult {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page] = useState(options?.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize options để dễ so sánh reference
  const optionsKey = JSON.stringify(options || {});

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('useSupabaseLens: Fetching with options:', options);
      const result = await SupabaseService.getLensListings({
        ...options,
        page,
      });
      console.log('useSupabaseLens: Got result:', result);
      setItems(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Có lỗi xảy ra');
      console.error('useSupabaseLens: Error caught:', errorObj);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [optionsKey, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    items,
    total,
    page,
    totalPages,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook để fetch chi tiết một lens_listing từ Supabase
 */
export function useSupabaseLensById(id: string) {
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const viewerUserId = getUserIdFromToken() ?? undefined;
        const data = await SupabaseService.getLensListingById(id, { viewerUserId });
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Có lỗi xảy ra'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}

/**
 * Hook để subscribe real-time updates
 */
export function useSupabaseRealtimeListings(callback?: (data: ProductItem) => void) {
  useEffect(() => {
    if (!callback) return;

    const unsubscribe = SupabaseService.subscribeToListings((status, data) => {
      if (status !== 'SUBSCRIPTION_STATE') {
        callback(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [callback]);
}
