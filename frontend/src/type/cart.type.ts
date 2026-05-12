export interface ICartItem {
  id: string;
  title: string;
  brand: string;
  price_per_day: number;
  days: number;
  image_url: string;
}

export interface CartItemProps {
  item: ICartItem;
  onUpdateDays: (id: string, newDays: number) => void;
  onRemove: (id: string) => void;
}

export interface CartSummaryProps {
  totalRentalFee: number;
  totalItems: number;
}