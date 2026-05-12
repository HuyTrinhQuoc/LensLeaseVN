

// Cấu trúc mảng ảnh
export interface ProductImage {
  id: string;
  image_url: string;
}

// Cấu trúc Danh mục
export interface ProductCategory {
  id: string;
  name: string;
}


export interface ProductItem {
  id: string;
  title: string;
  description?: string | null;
  brand?: string | null;
  category?: ProductCategory | null; 
  price_per_day: number; 
  thumbnail?: string | null;
  images?: ProductImage[]; 
  rating_avg?: number | string | null;
  review_count?: number | null; 
    city?: string;     
  district?: string;
  available?:boolean;
  owner?: {
  id: string;
  full_name: string;
};

  
}


export interface ProductListResponse {
  message?: string;
  data: ProductItem[];
}