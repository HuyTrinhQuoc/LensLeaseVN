import api from './api';
import { SupabaseService } from './supabase.service';
import { getAuthToken, getUserIdFromToken } from '../utils/auth';

export const ProductService = {
  // Lấy danh sách sản phẩm (có filter, phân trang)
  // Thử Supabase trước, fallback sang API nếu Supabase không khả dụng
  getProducts: async (params: URLSearchParams) => {
    try {
      // Convert URLSearchParams sang object để sử dụng với Supabase
      const options: any = {};
      params.forEach((value, key) => {
        if (key === 'page') options.page = parseInt(value);
        else if (key === 'limit') options.limit = parseInt(value);
        else if (key === 'category') options.category = value;
        else if (key === 'brand') options.brand = value;
        else if (key === 'city') options.city = value;
        else if (key === 'sort') options.sort = value;
        else if (key === 'search') options.search = value;
      });

      // Thử fetch từ Supabase
      const supabaseResult = await SupabaseService.getLensListings(options);
      return supabaseResult;
    } catch (error) {
      console.warn('Supabase fetch failed, falling back to API:', error);
      // Fallback sang API backend
      const response = await api.get(`/lenses?${params.toString()}`);
      return response.data;
    }
  },

  getProductById: async (id: string) => {
    try {
      const viewerUserId = getUserIdFromToken() ?? undefined;
      const product = await SupabaseService.getLensListingById(id, { viewerUserId });
      return product;
    } catch (error) {
      console.warn('Supabase fetch failed, falling back to API:', error);
      const token = getAuthToken();
      const response = await api.get(`/lenses/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return response.data.data ? response.data.data : response.data;
    }
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (query: string) => {
    try {
      const results = await SupabaseService.searchListings(query);
      return results;
    } catch (error) {
      console.warn('Supabase search failed, falling back to API:', error);
      // Fallback sang API backend
      const response = await api.get(`/suggestions?q=${encodeURIComponent(query)}`);
      const body = response.data;
      const list = Array.isArray(body) ? body : body?.data;
      return (Array.isArray(list) ? list : []).map((item: { id?: string; title: string; brand?: string; thumbnail?: string; price_per_day?: number }) => ({
        id: item.id || '',
        title: item.title,
        brand: item.brand,
        thumbnail: item.thumbnail,
        price_per_day: item.price_per_day,
      }));
    }
  },
};