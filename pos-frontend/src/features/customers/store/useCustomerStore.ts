import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CustomerState {
  customerName: string;
  customerPhone: string;
  customerId: string | null;
  guests: number;
  table: any;
  orderId: string;
  orderType: "DINE_IN" | "TAKE_AWAY" | "DELIVERY" | "QR_SELF" | "PHONE";

  setOrderType: (type: "DINE_IN" | "TAKE_AWAY" | "DELIVERY" | "QR_SELF" | "PHONE") => void;

  setCustomer: (customerData: { id?: string; name: string; phone: string; guests: number }) => void;
  setGuestCustomer: () => void;
  updateTable: (table: any) => void;
  setOrder: (orderData: { 
    customerName: string; 
    customerPhone: string; 
    customerId?: string | null;
    table: any; 
    orderId: string; 
    guests: number 
  }) => void;
  removeCustomer: () => void;
}

const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customerName: "",
      customerPhone: "",
      customerId: null,
      guests: 0,
      table: null,
      orderId: "",
      orderType: "TAKE_AWAY",

      setOrderType: (type) => set({ orderType: type }),

      setCustomer: (customerData) =>
        set({
          customerName: customerData.name,
          customerPhone: customerData.phone,
          customerId: customerData.id || null,
          guests: customerData.guests,
          orderId: 'new-' + Date.now(),
          orderType: get().table ? "DINE_IN" : "TAKE_AWAY",
        }),

      setGuestCustomer: () =>
        set({
          customerName: "Guest",
          customerPhone: "0000000000",
          customerId: null,
          guests: 1,
          orderId: 'guest-' + Date.now(),
          orderType: get().table ? "DINE_IN" : "TAKE_AWAY",
        }),

      updateTable: (table) => set({ table, orderType: table ? "DINE_IN" : "TAKE_AWAY" }),

      setOrder: (orderData) =>
        set({
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerId: orderData.customerId || null,
          table: orderData.table,
          orderId: orderData.orderId,
          guests: orderData.guests,
        }),

      removeCustomer: () =>
        set({
          customerName: "",
          customerPhone: "",
          customerId: null,
          guests: 0,
          table: null,
          orderId: "",
          orderType: "TAKE_AWAY",
        }),
    }),
    {
      name: "customer-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCustomerStore;
