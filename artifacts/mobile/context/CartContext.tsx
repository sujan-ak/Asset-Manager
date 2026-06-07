import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/data/mockData";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "@edodwaja_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setItems(JSON.parse(data));
    });
  }, []);

  function save(updated: CartItem[]) {
    setItems(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addToCart(product: Product) {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      save(items.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      save([...items, { product, quantity: 1 }]);
    }
  }

  function removeFromCart(productId: string) {
    save(items.filter((i) => i.product.id !== productId));
  }

  function clearCart() {
    save([]);
  }

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
