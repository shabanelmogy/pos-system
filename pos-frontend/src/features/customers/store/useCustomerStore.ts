import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CustomerState {
  customerName: string;
  customerPhone: string;
  guests: number;
  table: any;
  orderId: string;

  setCustomer: (customerData: { name: string; phone: string; guests: number }) => void;
  setGuestCustomer: () => void;
  updateTable: (table: any) => void;
  setOrder: (orderData: { 
    customerName: string; 
    customerPhone: string; 
    table: any; 
    orderId: string; 
    guests: number 
  }) => void;
  removeCustomer: () => void;
}

const useCustomerStore = create<CustomerState>()(
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
        }),

      setGuestCustomer: () =>
        set({
          customerName: "Guest",
          customerPhone: "0000000000",
          guests: 1,
          orderId: 'guest-' + Date.now(),
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
