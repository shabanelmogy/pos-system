import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getActiveOrders } from "@/shared/api/services/kdsApi";

interface KdsStore {
  activeOrders: any[];
  currentStationId: string | null;
  isLoading: boolean;
  
  // Actions
  setStationId: (id: string | null) => void;
  fetchOrders: () => Promise<void>;
  updateOrderLocal: (orderId: string, updates: any) => void;
}

const useKdsStore = create<KdsStore>()(
  persist(
    (set, get) => ({
      activeOrders: [],
      currentStationId: null,
      isLoading: false,

      setStationId: (id) => {
        set({ currentStationId: id });
        get().fetchOrders();
      },

      fetchOrders: async () => {
        set({ isLoading: true });
        try {
          const response = await getActiveOrders(get().currentStationId || undefined);
          const orders = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          set({ activeOrders: orders, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch KDS orders:", error);
          set({ isLoading: false });
        }
      },

      updateOrderLocal: (orderId, updates) => {
        set({
          activeOrders: get().activeOrders.map(order => 
            order.id === orderId ? { ...order, ...updates } : order
          )
        });
      }
    }),
    {
      name: "pos-kds-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useKdsStore;
