import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { addOrder, createOrderRazorpay, updateTable, verifyPaymentRazorpay } from "../../https";
import { useSnackbar } from "notistack";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";

const Bill = () => {
  const cartItems = useSelector((state) => state.cart);
  const customerData = useSelector((state) => state.customer);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

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
      // Update Table
      const tableData = {
        status: "Booked",
        orderId: order.id,
        tableId: order.tableId,
      };

      tableMutation.mutate(tableData, {
        onSuccess: () => {
          enqueueSnackbar("Order Placed Successfully", { variant: "success" });
          setOrderInfo(order);
          setShowInvoice(true);
        },
      });
    },
  });

  const razorpayMutation = useMutation({
    mutationFn: (data) => createOrderRazorpay(data),
    onSuccess: (res) => {
      const { data } = res;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "RESTRO",
        description: "Secure Payment for Your Meal",
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
              orderStatus: "In Progress",
              items: cartItems.map(item => ({
                menuItemId: item.id,
                quantity: item.quantity,
                unitPrice: item.price,
                name: item.name
              })),
              tableId: customerData.table?.tableId,
              paymentMethod: paymentMethod,
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
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
        theme: {
          color: "#f6b100",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
  });

  const handlePlaceOrder = () => {
    const preparedItems = cartItems.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
      unitPrice: item.price,
      name: item.name
    }));

    if (paymentMethod === "Razorpay") {
      razorpayMutation.mutate({ amount: totalWithTax });
    } else {
      const orderData = {
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
        },
        orderStatus: "In Progress",
        items: preparedItems,
        tableId: customerData.table?.tableId,
        paymentMethod: paymentMethod,
      };

      orderMutation.mutate(orderData);
    }
  };

  if (showInvoice && orderInfo) {
    return <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />;
  }

  return (
    <div className="bg-[#262626] p-6 rounded-lg h-full flex flex-col">
      <h2 className="text-[#f5f5f5] text-xl font-black uppercase tracking-tighter mb-6">Bill Summary</h2>
      
      <div className="flex-1 space-y-4">
        <div className="flex justify-between text-[#ababab]">
          <span className="font-medium">Subtotal</span>
          <span className="font-bold text-[#f5f5f5]">₹{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#ababab]">
          <span className="font-medium">Tax (5%)</span>
          <span className="font-bold text-[#f5f5f5]">₹{tax.toFixed(2)}</span>
        </div>
        <div className="h-px bg-[#333] my-4"></div>
        <div className="flex justify-between text-[#f6b100]">
          <span className="text-lg font-black uppercase">Total</span>
          <span className="text-xl font-black">₹{totalWithTax.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[#ababab] text-xs font-bold uppercase tracking-widest mb-3">Payment Method</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod("Cash")}
            className={`py-3 rounded-lg font-bold text-sm transition-all border-2 ${
              paymentMethod === "Cash"
                ? "bg-[#f6b100]/10 border-[#f6b100] text-[#f6b100]"
                : "bg-[#1a1a1a] border-[#333] text-[#ababab] hover:border-[#444]"
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setPaymentMethod("Razorpay")}
            className={`py-3 rounded-lg font-bold text-sm transition-all border-2 ${
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
        onClick={handlePlaceOrder}
        disabled={cartItems.length === 0 || orderMutation.isPending || razorpayMutation.isPending}
        className="w-full bg-[#f6b100] hover:bg-[#e5a600] disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1a1a] font-black uppercase tracking-widest py-4 rounded-lg mt-8 transition-all transform active:scale-[0.98]"
      >
        {orderMutation.isPending || razorpayMutation.isPending ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
};

export default Bill;
