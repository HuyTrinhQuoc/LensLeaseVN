// 1. Định nghĩa các Interface mô tả cấu trúc dữ liệu của một Sản phẩm
interface ImageItem {
  id: string;
  image_url: string;
}

export interface LensSpecs {
  focal_length?: string | null;
  max_aperture?: string | null;
  mount?: string | null;
  sensor_format?: string | null;
  image_stabilization?: boolean | null;
}

export interface Owner {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  rating_avg?: number | string | null;
}

export interface Category {
  id: string;
  name: string;
}

type DepositType = "MONEY_PLATFORM" | "MONEY_DIRECT" | "PAPERWORK" | string;

export interface ProductDetail {
  id: string;
  title: string;
  description?: string | null;
  category?: Category | null;
  brand?: string | null;
  available: boolean;
  rating_avg?: number | string | null;
  review_count?: number;
  district?: string | null;
  city?: string | null;
  price_per_day: number;
  thumbnail?: string | null;
  images?: ImageItem[];
  specs?: LensSpecs | null;
  required_deposit_amount?: number | null;
  allowed_deposit_types?: DepositType[];
  owner?: Owner | null;
}

// Định nghĩa cấu trúc trả về từ API
export interface ApiResponse {
  message?: string;
  data: ProductDetail;
}