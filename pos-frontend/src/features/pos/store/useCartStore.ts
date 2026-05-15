import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartModifier {
  modifierId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string; // This is the unique key in the cart (might be productId + hash of modifiers)
  productId: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: CartModifier[];
  notes?: string;
}

interface CartStore {
  items: CartItem[];
  
  // Actions
  addItem: (product: any, modifiers?: CartModifier[], notes?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  
  // Selectors
  getSubtotal: () => number;
  getItemCount: () => number;
}

/**
 * Utility to generate a unique key for a product + modifier combination
 */
const generateCartId = (productId: string, modifiers: CartModifier[] = []) => {
  if (modifiers.length === 0) return productId;
  const modId = modifiers
    .sort((a, b) => a.modifierId.localeCompare(b.modifierId))
    .map(m => `${m.modifierId}:${m.quantity}`)
    .join("|");
  return `${productId}[${modId}]`;
};

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, modifiers = [], notes = "") => {
        const cartId = generateCartId(product.id, modifiers);
        const items = get().items;
        const existingItem = items.find((i) => i.id === cartId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: cartId,
                productId: product.id,
                name: product.name,
                basePrice: Number(product.price),
                quantity: 1,
                modifiers,
                notes,
              },
            ],
          });
        }
      },

      updateQuantity: (cartItemId, delta) => {
        const items = get().items;
        set({
          items: items.map((item) => {
            if (item.id === cartItemId) {
              const newQty = Math.max(0, item.quantity + delta);
              return { ...item, quantity: newQty };
            }
            return item;
          }).filter(item => item.quantity > 0)
        });
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.id !== cartItemId) });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const modifiersTotal = item.modifiers.reduce((mSum, m) => mSum + (m.price * m.quantity), 0);
          return total + (item.basePrice + modifiersTotal) * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "pos-cart-v2", // Versioned storage for the new structure
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCartStore;
