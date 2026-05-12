import api from './api';

export const ProductService = {
  // Lấy danh sách sản phẩm (có filter, phân trang)
  getProducts: async (params: URLSearchParams) => {
    const response = await api.get(`/lenses?${params.toString()}`);
    return response.data;
  },

getProductById: async (id: string) => {
  const response = await api.get(`/lenses/${id}`);
  // Thêm .data một lần nữa nếu backend bọc trong field 'data'
  return response.data.data ? response.data.data : response.data; 
},
};