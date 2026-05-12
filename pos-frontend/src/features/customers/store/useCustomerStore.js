import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useCustomerStore = create(
  persist(
    (set) => ({
      customerName: "",
      customerPhone: "",
      guests: 0,
      table: null,
      orderId: "",

      setCustomer: (customerData) =>
        set({
          customerName: customerData.name,
          customerPhone: customerData.phone,
          guests: customerData.guests,
          orderId: 'new-' + Date.now(),
          table: null,
        }),

      updateTable: (table) => set({ table }),

      setOrder: (orderData) =>
        set({
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          table: orderData.table,
          orderId: orderData.orderId,
          guests: orderData.guests,
        }),

      removeCustomer: () =>
        set({
          customerName: "",
          customerPhone: "",
          guests: 0,
          table: null,
          orderId: "",
        }),
    }),
    {
      name: "customer-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCustomerStore;
