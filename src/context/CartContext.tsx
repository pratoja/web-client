import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { api, extractApiErrorMessage } from '../config/api';
import { useAuth } from './AuthContext';

export interface CartItemOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  notes: string | null;
  unitPrice: number;
  options: CartItemOption[];
  lineTotal: number;
}

type AddItemResult = { ok: true } | { ok: false; conflict: boolean; message: string };

interface CartApiResponse {
  id: string | null;
  companyId: string | null;
  items: CartItem[];
  subtotal: number;
}

interface CartContextValue {
  companyId: string | null;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string) => Promise<AddItemResult>;
  incrementItem: (item: CartItem) => Promise<void>;
  decrementItem: (item: CartItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const EMPTY_CART: CartApiResponse = { id: null, companyId: null, items: [], subtotal: 0 };

// O carrinho (sacola) mora no backend, ligado à conta do cliente — por isso
// só existe de verdade depois que a pessoa faz login ou cria uma conta. Ver
// sem login funciona normal; a sacola só começa a existir no momento em que
// alguém clica em "Adicionar" já logado (as telas de cardápio mandam pro
// login antes disso, se precisar).
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartApiResponse>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<CartApiResponse>('/cart');
      setCart(data);
    } catch {
      // Sem conexão ou sessão inválida — mantém o que já tinha em tela.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setCart(EMPTY_CART);
    }
  }, [isAuthenticated, refresh]);

  async function addItem(productId: string): Promise<AddItemResult> {
    try {
      const { data } = await api.post<CartApiResponse>('/cart/items', { productId, quantity: 1 });
      setCart(data);
      return { ok: true };
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      return {
        ok: false,
        conflict: status === 409,
        message: extractApiErrorMessage(error, 'Não foi possível adicionar o item.'),
      };
    }
  }

  async function incrementItem(item: CartItem) {
    const { data } = await api.patch<CartApiResponse>(`/cart/items/${item.id}`, {
      quantity: item.quantity + 1,
    });
    setCart(data);
  }

  async function decrementItem(item: CartItem) {
    if (item.quantity <= 1) {
      await removeItem(item.id);
      return;
    }
    const { data } = await api.patch<CartApiResponse>(`/cart/items/${item.id}`, {
      quantity: item.quantity - 1,
    });
    setCart(data);
  }

  async function removeItem(itemId: string) {
    const { data } = await api.delete<CartApiResponse>(`/cart/items/${itemId}`);
    setCart(data);
  }

  async function clearCart() {
    await api.delete('/cart');
    setCart(EMPTY_CART);
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({
      companyId: cart.companyId,
      items: cart.items,
      subtotal: cart.subtotal,
      totalItems,
      isLoading,
      refresh,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [cart, isLoading, totalItems, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart precisa ser usado dentro de um <CartProvider>');
  }
  return context;
}
