import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrder, createOrderRazorpay, verifyPaymentRazorpay } from "../../api/posApi";
import { updateTable } from "../../../../features/tables/api/tableApi";
import { useSnackbar } from "notistack";
import useCartStore from "../../store/useCartStore";
import useCustomerStore from "../../../../features/customers/store/useCustomerStore";
import useUserStore from "../../../../features/auth/store/useUserStore";
import usePOSStore from "../../store/usePOSStore";
import Invoice from "../../../../features/orders/components/invoice/Invoice";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTranslation } from "react-i18next";

declare global {
  interface Window { Razorpay: any; }
}

const Bill: React.FC = () => {
  const { t } = useTranslation();
  const { items: cartItems, removeAllItems, getTotalPrice } = useCartStore();
  const { customerName, customerPhone, guests, table, removeCustomer } = useCustomerStore();
  const user = useUserStore();
  const { selectedBranch, selectedPOSPoint, activeShift } = usePOSStore();

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(true);

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const total = getTotalPrice();
  const tax = total * 0.05;
  const totalWithTax = total + tax;

  const tableMutation = useMutation({
    mutationFn: (data: { tableId: string; [key: string]: any }) => updateTable(data),
  });

  const orderMutation = useMutation({
    mutationFn: (data: any) => addOrder(data),
    onSuccess: (res: any) => {
      const order = res.data.data;
      const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        enqueueSnackbar("Order Placed Successfully", { variant: "success" });
        setOrderInfo(order);
        setShowInvoice(true);
        removeAllItems();
        removeCustomer();
      };
      if (order.tableId) {
        tableMutation.mutate({ status: "Booked", orderId: order.id, tableId: order.tableId }, { onSuccess: handleSuccess });
      } else {
        handleSuccess();
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to place order", { variant: "error" });
    },
  });

  const handlePlaceOrder = () => {
    const isAdmin = user?.role?.toLowerCase() === "admin";
    if (!activeShift && !isAdmin) { enqueueSnackbar("No active shift found. Please start a shift first.", { variant: "error" }); return; }
    if (!user || !user.id) { enqueueSnackbar("User session invalid. Please re-login.", { variant: "error" }); return; }
    const preparedItems = cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity, unitPrice: item.price, name: item.name }));
    const baseOrderData = {
      customerDetails: { name: customerName, phone: customerPhone, guests },
      orderStatus: selectedPOSPoint?.settings?.enableTables !== false ? "In Progress" : "Completed",
      items: preparedItems, tableId: table?.tableId, paymentMethod,
      branchId: selectedBranch?.id, posPointId: selectedPOSPoint?.id, shiftId: activeShift?.id, cashierId: user.id,
    };
    if (paymentMethod === "Razorpay") { razorpayMutation.mutate({ amount: totalWithTax }); } else { orderMutation.mutate(baseOrderData); }
  };

  const razorpayMutation = useMutation({
    mutationFn: (data: any) => createOrderRazorpay(data),
    onSuccess: (res: any) => {
      const { data } = res;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount, currency: data.order.currency,
        name: selectedBranch?.name || "POS Order",
        description: `POS Order - ${selectedPOSPoint?.name || "Terminal"}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            await verifyPaymentRazorpay(response);
            const orderData = {
              customerDetails: { name: customerName, phone: customerPhone, guests },
              orderStatus: selectedPOSPoint?.settings?.enableTables !== false ? "In Progress" : "Completed",
              items: cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity, unitPrice: item.price, name: item.name })),
              tableId: table?.tableId, paymentMethod,
              paymentData: { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature },
              branchId: selectedBranch?.id, posPointId: selectedPOSPoint?.id, shiftId: activeShift?.id, cashierId: user.id,
            };
            orderMutation.mutate(orderData);
          } catch { enqueueSnackbar("Payment Verification Failed", { variant: "error" }); }
        },
        prefill: { name: customerName, contact: customerPhone },
        theme: { color: "var(--primary)" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    },
  });

  if (showInvoice && orderInfo) {
    return <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} directPrint={selectedPOSPoint?.settings?.directPrint === true} />;
  }

  const isProcessing = orderMutation.isPending || razorpayMutation.isPending;

  return (
    <div className="bg-[var(--bg-card-alt)] rounded-2xl border border-[var(--border-main)] shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none" onClick={() => setIsMinimized((prev) => !prev)}>
        <div className="flex items-center gap-3">
          <h2 className="text-[var(--text-main)] text-sm font-black uppercase tracking-tighter">{t('pos.cart.bill_summary')}</h2>
          {isMinimized && <span className="text-[var(--primary)] text-sm font-black">₹{totalWithTax.toFixed(2)}</span>}
        </div>
        <div className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
          {isMinimized ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
      </div>

      {!isMinimized && (
        <div className="px-5 pb-5">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-[var(--text-muted)] text-sm">
              <span className="font-medium">{t('pos.cart.subtotal')}</span>
              <span className="font-bold text-[var(--text-main)]">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)] text-sm">
              <span className="font-medium">{t('pos.cart.tax')}</span>
              <span className="font-bold text-[var(--text-main)]">₹{tax.toFixed(2)}</span>
            </div>
            <div className="h-px bg-[var(--border-main)]"></div>
            <div className="flex justify-between text-[var(--primary)]">
              <span className="text-base font-black uppercase">{t('pos.cart.total')}</span>
              <span className="text-lg font-black">₹{totalWithTax.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">{t('pos.cart.payment_method')}</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ key: "Cash", label: t('pos.cart.cash') }, { key: "Razorpay", label: t('pos.cart.online') }].map(({ key, label }) => (
                <button key={key} onClick={(e) => { e.stopPropagation(); setPaymentMethod(key); }}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all border-2 ${paymentMethod === key ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]" : "bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--text-dim)]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={(e) => { e.stopPropagation(); handlePlaceOrder(); }}
            disabled={cartItems.length === 0 || isProcessing}
            className="w-full bg-[var(--primary)] hover:bg-[#e5a600] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--bg-card)] font-black uppercase tracking-widest py-4 rounded-2xl transition-all transform active:scale-[0.98] shadow-2xl shadow-yellow-500/10 text-xs">
            {isProcessing ? t('pos.cart.processing') : t('pos.cart.place_order')}
          </button>
        </div>
      )}

      {isMinimized && (
        <div className="px-5 pb-4">
          <button onClick={(e) => { e.stopPropagation(); handlePlaceOrder(); }}
            disabled={cartItems.length === 0 || isProcessing}
            className="w-full bg-[var(--primary)] hover:bg-[#e5a600] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--bg-card)] font-black uppercase tracking-widest py-3 rounded-2xl transition-all transform active:scale-[0.98] shadow-xl shadow-yellow-500/10 text-xs">
            {isProcessing ? t('pos.cart.processing') : t('pos.cart.place_order')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Bill;
