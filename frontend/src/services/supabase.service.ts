import { supabase } from '../lib/supabase';
import type { ProductItem } from '../type/product.type';

export const SupabaseService = {

  // =====================================================
  // GET LENS LISTINGS
  // =====================================================

  async getLensListings(options?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    search?: string;
  }): Promise<{
    data: ProductItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {

    // =====================================================
    // PAGINATION
    // =====================================================

    const page = options?.page || 1;
    const limit = options?.limit || 10;

    const offset = (page - 1) * limit;

    try {

      console.log('====================================================');
      console.log('FETCHING LENS LISTINGS');
      console.log('====================================================');

      console.log('Options:', options);

      // =====================================================
      // BASE QUERY
      // =====================================================

      let query = supabase
        .from('lens_listings')
        .select(`
          *,
          
          images:lens_images(
            *
          ),

          owner:users!lens_listings_owner_id_fkey(
            id,
            full_name,
            avatar_url,
            email,
            phone
          )

        `, {
          count: 'exact'
        })

        // =====================================================
        // SAFE FILTERS
        // =====================================================

        .or('is_deleted.is.null,is_deleted.eq.false')

        // approval_status an toàn hơn - accept both APPROVED and PENDING
        .in('approval_status', [
          'APPROVED',
          'PENDING'
        ]);

      // =====================================================
      // CATEGORY FILTER
      // =====================================================

      if (options?.category) {

        query = query.eq(
          'category_id',
          options.category
        );

      }

      // =====================================================
      // BRAND FILTER
      // =====================================================

      if (options?.brand) {

        query = query.eq(
          'brand',
          options.brand
        );

      }

      // =====================================================
      // CITY FILTER
      // =====================================================

      if (options?.city) {

        query = query.eq(
          'city',
          options.city
        );

      }

      // =====================================================
      // MIN PRICE
      // =====================================================

      if (options?.minPrice !== undefined) {

        query = query.gte(
          'price_per_day',
          options.minPrice
        );

      }

      // =====================================================
      // MAX PRICE
      // =====================================================

      if (options?.maxPrice !== undefined) {

        query = query.lte(
          'price_per_day',
          options.maxPrice
        );

      }

      // =====================================================
      // SEARCH
      // =====================================================

      if (options?.search) {

        query = query.or(`
          title.ilike.%${options.search}%,
          brand.ilike.%${options.search}%,
          description.ilike.%${options.search}%
        `);

      }

      // =====================================================
      // SORTING
      // =====================================================

      switch (options?.sort) {

        case 'rating':

          query = query.order(
            'rating_avg',
            {
              ascending: false,
              nullsFirst: false
            }
          );

          break;

        case 'price_asc':

          query = query.order(
            'price_per_day',
            {
              ascending: true
            }
          );

          break;

        case 'price_desc':

          query = query.order(
            'price_per_day',
            {
              ascending: false
            }
          );

          break;

        case 'newest':

          query = query.order(
            'created_at',
            {
              ascending: false
            }
          );

          break;

        default:

          query = query.order(
            'created_at',
            {
              ascending: false
            }
          );

          break;

      }

      // =====================================================
      // PAGINATION
      // =====================================================

      query = query.range(
        offset,
        offset + limit - 1
      );

      // =====================================================
      // EXECUTE QUERY
      // =====================================================

      const {
        data,
        error,
        count
      } = await query;

      // =====================================================
      // DEBUG
      // =====================================================

      console.log('====================================================');
      console.log('SUPABASE RESPONSE');
      console.log('====================================================');

      console.log('Count:', count);

      console.log(
        'Data length:',
        data?.length
      );

      console.log(
        'Data preview:',
        JSON.stringify(
          data?.slice(0, 2),
          null,
          2
        )
      );

      // =====================================================
      // HANDLE ERROR
      // =====================================================

      if (error) {

        console.error('====================================================');
        console.error('SUPABASE ERROR');
        console.error('====================================================');

        console.error({
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        throw error;

      }

      // =====================================================
      // RETURN RESULT
      // =====================================================

      const total = count || 0;

      const totalPages = Math.ceil(
        total / limit
      );

      return {

        data: (data || []) as ProductItem[],

        total,

        page,

        limit,

        totalPages

      };

    } catch (error) {

      console.error('====================================================');
      console.error('FETCH LENS LISTINGS FAILED');
      console.error('====================================================');

      console.error(error);

      return {

        data: [],

        total: 0,

        page,

        limit,

        totalPages: 0

      };

    }

  },

  // =====================================================
  // GET LISTING DETAIL
  // =====================================================

  async getLensListingById(
    id: string
  ): Promise<ProductItem> {

    try {

      console.log('Fetching listing:', id);

      const {
        data,
        error
      } = await supabase

        .from('lens_listings')

        .select(`
          *,

          images:lens_images(
            *
          ),

          owner:users!lens_listings_owner_id_fkey(
            id,
            full_name,
            avatar_url,
            email,
            phone
          )
        `)

        .eq('id', id)

        .or('is_deleted.is.null,is_deleted.eq.false')

        .single();

      if (error) {

        console.error(error);

        throw error;

      }

      if (!data) {

        throw new Error(
          'Không tìm thấy sản phẩm!'
        );

      }

      return data as ProductItem;

    } catch (error) {

      console.error(
        'Error fetching lens listing by id:',
        error
      );

      throw error;

    }

  },

  // =====================================================
  // SEARCH LISTINGS
  // =====================================================

  async searchListings(
    keyword: string
  ): Promise<ProductItem[]> {

    try {

      if (!keyword.trim()) {

        return [];

      }

      const {
        data,
        error
      } = await supabase

        .from('lens_listings')

        .select(`
          id,
          title,
          brand,
          thumbnail,
          price_per_day
        `)

        .or(`
          title.ilike.%${keyword}%,
          brand.ilike.%${keyword}%
        `)

        .or('is_deleted.is.null,is_deleted.eq.false')

        .in('approval_status', [
          'APPROVED',
          'approved',
          'Approved'
        ])

        .limit(5);

      if (error) {

        console.error(error);

        throw error;

      }

      return (data || []) as ProductItem[];

    } catch (error) {

      console.error(
        'Search listings failed:',
        error
      );

      return [];

    }

  },

  // =====================================================
  // REALTIME SUBSCRIBE
  // =====================================================

  subscribeToListings(
    callback: (
      status:
        | 'SUBSCRIPTION_STATE'
        | 'INSERT'
        | 'UPDATE'
        | 'DELETE',

      data: ProductItem

    ) => void
  ) {

    const subscription = supabase

      .channel(
        'lens_listings_changes'
      )

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'lens_listings',
        },

        (payload) => {

          callback(
            payload.eventType as any,
            payload.new as ProductItem
          );

        }
      )

      .subscribe();

    return () => {

      subscription.unsubscribe();

    };

  },

};