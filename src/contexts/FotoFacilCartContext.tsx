import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  photoId: string;
  eventId: string;
  eventTitle: string;
  title: string;
  thumbUrl: string;
  priceCents: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (photoId: string) => void;
  clearCart: () => void;
  isInCart: (photoId: string) => boolean;
  totalCents: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'fotofacil_cart';

export function FotoFacilCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      if (prev.some(i => i.photoId === item.photoId)) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (photoId: string) => {
    setItems(prev => prev.filter(i => i.photoId !== photoId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (photoId: string) => {
    return items.some(i => i.photoId === photoId);
  };

  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, totalCents, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useFotoFacilCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useFotoFacilCart must be used within FotoFacilCartProvider');
  }
  return context;
}
