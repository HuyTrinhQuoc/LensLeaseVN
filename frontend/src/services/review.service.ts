import api from './api'; 

export const reviewService = {
  createReview: async (data: {
    booking_id: string;
    lens_id?: string;
    reviewed_user_id?: string;
    rating: number;
    comment: string;
  }) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  getReviewsByLens: async (lensId: string) => {
    const response = await api.get(`/reviews/lens/${lensId}`);
    return response.data;
  },
};