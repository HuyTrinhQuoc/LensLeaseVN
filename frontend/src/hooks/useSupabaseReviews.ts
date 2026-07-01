import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  booking?: {
    renter?: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export function useSupabaseReviews(lensId: string) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!lensId) return;

    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
          .from("Review") 
          .select(`
            id,
            rating,
            comment,
            created_at,
            booking:Booking (
              renter:User ( 
                full_name,
                avatar_url
              )
            )
          `)
          .eq("lens_id", lensId)
          .order("created_at", { ascending: false });

        console.log("Dữ liệu Reviews thực tế lấy về từ DB:", data);
        if (err) {
          console.error("Chi tiết lỗi Supabase phát hiện:", err);
          throw err;
        }

        setReviews((data as any) || []);
      } catch (err: any) {
        console.error("Lỗi khi fetch reviews:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [lensId]);

  return { reviews, loading, error };
}