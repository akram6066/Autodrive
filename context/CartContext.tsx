"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  brand: string;
  size: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) => p.productId === item.productId && p.size === item.size
      );
      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId && p.size === item.size
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter((p) => !(p.productId === productId && p.size === size))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    setCart((prev) =>
      prev.map((p) =>
        p.productId === productId && p.size === size ? { ...p, quantity } : p
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
