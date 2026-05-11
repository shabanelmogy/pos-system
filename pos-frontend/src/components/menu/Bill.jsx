import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrder, createOrderRazorpay, updateTable, verifyPaymentRazorpay } from "../../https";
import { useSnackbar } from "notistack";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Bill = () => {
  const cartItems = useSelector((state) => state.cart);
  const customerData = useSelector((state) => state.customer);
  const user = useSelector((state) => state.user);
  const { selectedBranch, selectedPOSPoint, activeShift } = useSelector((state) => state.pos);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isMinimized, setIsMinimized] = useState(true);

  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = total * 0.05;
  const totalWithTax = total + tax;

  const tableMutation = useMutation({
    mutationFn: (data) => updateTable(data),
  });

  const orderMutation = useMutation({
    mutationFn: (data) => addOrder(data),
    onSuccess: (res) => {
      const order = res.data.data;

      const handleSuccess = () => {
        queryClient.invalidateQueries(["orders"]);
        enqueueSnackbar("Order Placed Successfully", { variant: "success" });
        setOrderInfo(order);
        setShowInvoice(true);
      };

      if (order.tableId) {
        const tableData = {
          status: "Booked",
          orderId: order.id,
          tableId: order.tableId,
        };
        tableMutation.mutate(tableData, { onSuccess: handleSuccess });
      } else {
        handleSuccess();
      }
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to place order", { variant: "error" });
    },
  });

  const handlePlaceOrder = () => {
    const isAdmin = user?.role?.toLowerCase() === "admin";

    if (!activeShift && !isAdmin) {
      enqueueSnackbar("No active shift found. Please start a shift first.", { variant: "error" });
      return;
    }

    if (!user || !user.id) {
      enqueueSnackbar("User session invalid. Please re-login.", { variant: "error" });
      return;
    }

    const preparedItems = cartItems.map((item) => ({
      menuItemId: item.id,
      quantity: item.quantity,
      unitPrice: item.price,
      name: item.name,
    }));

    const baseOrderData = {
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },
      orderStatus: selectedPOSPoint?.settings?.enableTables !== false ? "In Progress" : "Completed",
      items: preparedItems,
      tableId: customerData.table?.tableId,
      paymentMethod: paymentMethod,
      branchId: selectedBranch?.id,
      posPointId: selectedPOSPoint?.id,
      shiftId: activeShift?.id,
      cashierId: user.id,
    };

    if (paymentMethod === "Razorpay") {
      razorpayMutation.mutate({ amount: totalWithTax });
    } else {
      orderMutation.mutate(baseOrderData);
    }
  };

  const razorpayMutation = useMutation({
    mutationFn: (data) => createOrderRazorpay(data),
    onSuccess: (res) => {
      const { data } = res;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: selectedBranch?.name || "POS Order",
        description: `POS Order - ${selectedPOSPoint?.name || "Terminal"}`,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            await verifyPaymentRazorpay(response);
            const orderData = {
              customerDetails: {
                name: customerData.customerName,
                phone: customerData.customerPhone,
                guests: customerData.guests,
              },
              orderStatus: selectedPOSPoint?.settings?.enableTables !== false ? "In Progress" : "Completed",
              items: cartItems.map((item) => ({
                menuItemId: item.id,
                quantity: item.quantity,
                unitPrice: item.price,
                name: item.name,
              })),
              tableId: customerData.table?.tableId,
              paymentMethod: paymentMethod,
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              branchId: selectedBranch?.id,
              posPointId: selectedPOSPoint?.id,
              shiftId: activeShift?.id,
              cashierId: user.id,
            };
            orderMutation.mutate(orderData);
          } catch (error) {
            enqueueSnackbar("Payment Verification Failed", { variant: "error" });
          }
        },
        prefill: {
          name: customerData.customerName,
          contact: customerData.customerPhone,
        },
        theme: { color: "#f6b100" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    },
  });

  if (showInvoice && orderInfo) {
    return <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />;
  }

  return (
    <div className="bg-[#262626] rounded-2xl border border-[#333] shadow-xl overflow-hidden">
      {/* Header — always visible, click to toggle */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-[#2e2e2e] transition-colors select-none"
        onClick={() => setIsMinimized((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-[#f5f5f5] text-sm font-black uppercase tracking-tighter">Bill Summary</h2>
          {isMinimized && (
            <span className="text-[#f6b100] text-sm font-black">₹{totalWithTax.toFixed(2)}</span>
          )}
        </div>
        <div className="text-[#ababab] hover:text-[#f6b100] transition-colors">
          {isMinimized ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
      </div>

      {/* Expanded content */}
      {!isMinimized && (
        <div className="px-5 pb-5">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-[#ababab] text-sm">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-[#f5f5f5]">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#ababab] text-sm">
              <span className="font-medium">Tax (5%)</span>
              <span className="font-bold text-[#f5f5f5]">₹{tax.toFixed(2)}</span>
            </div>
            <div className="h-px bg-[#333]"></div>
            <div className="flex justify-between text-[#f6b100]">
              <span className="text-base font-black uppercase">Total</span>
              <span className="text-lg font-black">₹{totalWithTax.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[#ababab] text-[10px] font-bold uppercase tracking-widest mb-2">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setPaymentMethod("Cash"); }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all border-2 ${
                  paymentMethod === "Cash"
                    ? "bg-[#f6b100]/10 border-[#f6b100] text-[#f6b100]"
                    : "bg-[#1a1a1a] border-[#333] text-[#ababab] hover:border-[#444]"
                }`}
              >
                Cash
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPaymentMethod("Razorpay"); }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all border-2 ${
                  paymentMethod === "Razorpay"
                    ? "bg-[#f6b100]/10 border-[#f6b100] text-[#f6b100]"
                    : "bg-[#1a1a1a] border-[#333] text-[#ababab] hover:border-[#444]"
                }`}
              >
                Online
              </button>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handlePlaceOrder(); }}
            disabled={cartItems.length === 0 || orderMutation.isPending || razorpayMutation.isPending}
            className="w-full bg-[#f6b100] hover:bg-[#e5a600] disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1a1a] font-black uppercase tracking-widest py-4 rounded-2xl transition-all transform active:scale-[0.98] shadow-2xl shadow-yellow-500/10 text-xs"
          >
            {orderMutation.isPending || razorpayMutation.isPending ? "Processing..." : "Place Order"}
          </button>
        </div>
      )}

      {/* Minimized: show Place Order only */}
      {isMinimized && (
        <div className="px-5 pb-4">
          <button
            onClick={(e) => { e.stopPropagation(); handlePlaceOrder(); }}
            disabled={cartItems.length === 0 || orderMutation.isPending || razorpayMutation.isPending}
            className="w-full bg-[#f6b100] hover:bg-[#e5a600] disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1a1a] font-black uppercase tracking-widest py-3 rounded-2xl transition-all transform active:scale-[0.98] shadow-xl shadow-yellow-500/10 text-xs"
          >
            {orderMutation.isPending || razorpayMutation.isPending ? "Processing..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Bill;
