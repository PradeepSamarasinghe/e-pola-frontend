import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, ProductVariant, syncCartBackend, fetchCartBackend } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export type CartItem = {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addToCart: (product: Product, variant?: ProductVariant | null) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  getQuantity: (productId: string, variantId?: string | null) => number;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

function cartKey(productId: string, variantId?: string | null): string {
  return `${productId}:${variantId ?? 'default'}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { session } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const local = await AsyncStorage.getItem('cart_items');
        if (local) setItems(JSON.parse(local));
      } catch (e) {}
      setInitialized(true);
    })();
  }, []);

  useEffect(() => {
    if (initialized && session?.access_token) {
      (async () => {
        try {
          const remoteCart = await fetchCartBackend(session.access_token);
          if (remoteCart && Array.isArray(remoteCart) && remoteCart.length > 0) {
            setItems(remoteCart);
            await AsyncStorage.setItem('cart_items', JSON.stringify(remoteCart));
          }
        } catch (e) {
          console.error("Failed to fetch backend cart", e);
        }
      })();
    }
  }, [session?.access_token, initialized]);

  const updateItems = useCallback((updater: (prev: CartItem[]) => CartItem[]) => {
    setItems((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem('cart_items', JSON.stringify(next)).catch(() => {});
      if (session?.access_token) {
        syncCartBackend(next, session.access_token).catch(() => {});
      }
      return next;
    });
  }, [session?.access_token]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const unitPrice = item.variant ? item.variant.price_lkr : item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const addToCart = useCallback((product: Product, variant?: ProductVariant | null) => {
    const key = cartKey(product.id, variant?.id);
    updateItems((prev) => {
      const existing = prev.find(
        (i) => cartKey(i.product.id, i.variant?.id) === key
      );
      if (existing) {
        return prev.map((i) =>
          cartKey(i.product.id, i.variant?.id) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, variant: variant ?? null, quantity: 1 }];
    });
  }, [updateItems]);

  const removeFromCart = useCallback((productId: string, variantId?: string | null) => {
    const key = cartKey(productId, variantId);
    updateItems((prev) =>
      prev.filter((i) => cartKey(i.product.id, i.variant?.id) !== key)
    );
  }, [updateItems]);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string | null) => {
      const key = cartKey(productId, variantId);
      if (quantity <= 0) {
        updateItems((prev) =>
          prev.filter((i) => cartKey(i.product.id, i.variant?.id) !== key)
        );
      } else {
        updateItems((prev) =>
          prev.map((i) =>
            cartKey(i.product.id, i.variant?.id) === key ? { ...i, quantity } : i
          )
        );
      }
    },
    [updateItems]
  );

  const getQuantity = useCallback(
    (productId: string, variantId?: string | null) => {
      const key = cartKey(productId, variantId);
      return (
        items.find((i) => cartKey(i.product.id, i.variant?.id) === key)?.quantity ?? 0
      );
    },
    [items]
  );

  const clearCart = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        getQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
