import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, ProductUnit } from "@/types";

interface CartStore {
    items: CartItem[];
    // returns { action: 'added'|'updated', quantity } so callers can show notifications
    addItem: (product: ProductUnit, quantity?: number) => { action: 'added' | 'updated'; quantity: number };
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingItem = items.find(
                    (item) => item.productUnit.id === product.id
                );

                if (existingItem) {
                    // Tăng số lượng nếu đã có trong giỏ
                    const newQty = existingItem.quantity + quantity;
                    set({
                        items: items.map((item) =>
                            item.productUnit.id === product.id
                                ? {
                                      ...item,
                                      quantity: newQty,
                                  }
                                : item
                        ),
                    });
                    return { action: 'updated', quantity: newQty } as const;
                } else {
                    // Thêm mới vào giỏ
                    set({
                        items: [...items, { productUnit: product, quantity }],
                    });
                    return { action: 'added', quantity } as const;
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter(
                        (item) => item.productUnit.id !== productId
                    ),
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: get().items.map((item) =>
                        item.productUnit.id === productId
                            ? { ...item, quantity }
                            : item
                    ),
                });
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotalItems: () => {
                return get().items.reduce(
                    (total, item) => total + item.quantity,
                    0
                );
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) =>
                        total + item.productUnit.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: "cart-storage", // Key trong localStorage
        }
    )
);
