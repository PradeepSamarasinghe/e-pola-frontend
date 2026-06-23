import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/lib/api';

type WishlistContextType = {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const local = await AsyncStorage.getItem('wishlist_items');
        if (local) setItems(JSON.parse(local));
      } catch (e) {}
    })();
  }, []);

  const updateItems = useCallback((updater: (prev: Product[]) => Product[]) => {
    setItems((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem('wishlist_items', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addToWishlist = useCallback((product: Product) => {
    updateItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, [updateItems]);

  const removeFromWishlist = useCallback((productId: string) => {
    updateItems((prev) => prev.filter((p) => p.id !== productId));
  }, [updateItems]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      updateItems((prev) => {
        if (prev.some((p) => p.id === product.id)) {
          return prev.filter((p) => p.id !== product.id);
        } else {
          return [...prev, product];
        }
      });
    },
    [updateItems]
  );

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
