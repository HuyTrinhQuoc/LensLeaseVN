import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
export interface CartItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  pricePerDay: number;
  rentalDays: number;
  startDate: string;
  endDate: string;
  quantity: number;
  deposit: number;
  accessories: string[];
  condition: 'Mới' | 'Tốt' | 'Khá';
  available: boolean;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateDays: (id: string, days: number) => void;
  clearCart: () => void;
  totalItems: number;
}

/* ────────────────────────────────────────────
   Context
   ──────────────────────────────────────────── */
const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev; // Không thêm trùng
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateDays = useCallback((id: string, days: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, rentalDays: Math.max(1, Math.min(30, days)) } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateDays,
        clearCart,
        totalItems: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook để sử dụng CartContext.
 * @throws Nếu gọi bên ngoài CartProvider.
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được sử dụng bên trong <CartProvider>');
  return ctx;
}
