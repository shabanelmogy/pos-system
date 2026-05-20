import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrder, createOrderRazorpay, verifyPaymentRazorpay } from "@/shared/api/services/posApi";
import { updateTable } from "@/shared/api/services/tableApi";
import { useSnackbar } from "notistack";
import useCartStore from "@/features/pos/terminal/store/useCartStore";
import useCustomerStore from "@/features/crm/customer/store/useCustomerStore";
import useUserStore from "@/features/system/auth/store/useUserStore";
import usePOSStore from "@/features/pos/terminal/store/usePOSStore";
import Invoice from "@/features/pos/order/components/invoice/Invoice";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import CouponInput from "./CouponInput";
import { confirmOrderDraft, addOrderPayment, applyOrderCoupon } from "@/shared/api/services/orderApi";

declare global {
  interface Window { Razorpay: any; }
}

const Bill: React.FC = () => {
  const { t } = useTranslation();
  const { items: cartItems, clearCart, getSubtotal } = useCartStore();
  const { customerName, customerPhone, guests, table, removeCustomer, orderType } = useCustomerStore();
  const user = useUserStore();
  const { activeShift, selectedPOSPoint } = usePOSStore();

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const subtotal = getSubtotal();
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
       discountAmount = (subtotal * appliedCoupon.value) / 100;
       if (appliedCoupon.maxDiscountAmount && discountAmount > appliedCoupon.maxDiscountAmount) {
         discountAmount = appliedCoupon.maxDiscountAmount;
       }
    } else {
       discountAmount = parseFloat(appliedCoupon.value);
    }
  }

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = subtotalAfterDiscount * 0.05; // Visual estimate for the UI
  const totalWithTax = subtotalAfterDiscount + tax;

  const tableMutation = useMutation({
    mutationFn: (data: { tableId: string; [key: string]: any }) => updateTable(data),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmOrderDraft(id),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: any) => addOrderPayment(data),
  });

  const applyBackendCouponMutation = useMutation({
    mutationFn: (data: { orderId: string; code: string }) => applyOrderCoupon(data),
  });

  const orderMutation = useMutation({
    mutationFn: (data: any) => addOrder(data),
    onSuccess: async (res: any, variables: any) => {
      const order = res.data.data;
      
      // Apply Coupon if exists
      if (appliedCoupon) {
         await applyBackendCouponMutation.mutateAsync({ orderId: order.id, code: appliedCoupon.code });
      }

      // Chain confirm draft to make it ACTIVE
      await confirmMutation.mutateAsync(order.id);

      // If Razorpay, add payment
      if (variables.metadata?.razorpay_payment_id) {
        await paymentMutation.mutateAsync({
           orderId: order.id,
           amount: variables.amount,
           method: "Razorpay",
           transactionId: variables.metadata.razorpay_payment_id
        });
      }

      const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["recentOrders"] });
        enqueueSnackbar(t('pos.cart.order_success'), { variant: "success" });
        setOrderInfo(order);
        setShowInvoice(true);
        clearCart();
        removeCustomer();
        setAppliedCoupon(null);
      };
      
      if (order.tableId) {
        tableMutation.mutate({ status: "Occupied", orderId: order.id, tableId: order.tableId }, { onSuccess: handleSuccess });
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
    if (!activeShift && !isAdmin) {
      enqueueSnackbar("No active shift found. Please start a shift first.", { variant: "error" });
      return;
    }

    // 1. Prepare Items according to the new backend DTO
    // We NO LONGER send unitPrice, as the backend derives it from the catalog.
    const preparedItems = cartItems.map((item) => ({
      menuItemId: item.productId,
      quantity: item.quantity,
      notes: item.notes,
      modifiers: item.modifiers.map(m => ({
        modifierId: m.modifierId,
        quantity: m.quantity
      }))
    }));

    // 2. Build the Payload (Strict following CreateOrderDTO)
    const orderPayload: any = {
      type: orderType,
      items: preparedItems,
      notes: "POS Order",
    };

    if (table?.tableId) {
      orderPayload.tableId = table.tableId;
      orderPayload.customerDetails = {
        name: customerName || "Guest",
        phone: customerPhone || "0000000000",
        guests: guests || 1
      };
    }

    // Razorpay Flow
    if (paymentMethod === "Razorpay") {
      razorpayMutation.mutate({ amount: totalWithTax, orderPayload });
    } else {
      orderMutation.mutate(orderPayload);
    }
  };

  const razorpayMutation = useMutation({
    mutationFn: (data: any) => createOrderRazorpay(data),
    onSuccess: (res: any, variables: any) => {
      const { data } = res;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Restaurant POS",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            await verifyPaymentRazorpay(response);
            // Append payment info to our payload
            const finalPayload = {
              ...variables.orderPayload,
              metadata: { 
                razorpay_order_id: response.razorpay_order_id, 
                razorpay_payment_id: response.razorpay_payment_id 
              }
            };
            orderMutation.mutate(finalPayload);
          } catch {
            enqueueSnackbar("Payment Verification Failed", { variant: "error" });
          }
        },
        prefill: { name: customerName, contact: customerPhone },
        theme: { color: "var(--primary)" },
      };
      const rzp = new (window as any).Razorpay(options);
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
              <span className="font-bold text-[var(--text-main)]">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)] text-sm">
              <span className="font-medium">{t('pos.cart.tax')}</span>
              <span className="font-bold text-[var(--text-main)]">₹{tax.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-500 text-sm">
                <span className="font-medium">Discount ({appliedCoupon?.code})</span>
                <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-[var(--border-main)]"></div>
            <div className="flex justify-between text-[var(--primary)]">
              <span className="text-base font-black uppercase">{t('pos.cart.total')}</span>
              <span className="text-lg font-black">₹{totalWithTax.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-4">
            <CouponInput 
               orderAmount={subtotal} 
               onSuccess={(coupon) => setAppliedCoupon(coupon)} 
               onRemove={() => setAppliedCoupon(null)} 
            />
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
