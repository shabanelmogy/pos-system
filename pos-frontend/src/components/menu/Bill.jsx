import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  addOrder,
  createOrderRazorpay,
  updateTable,
  verifyPaymentRazorpay,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();

  const handleCancelOrder = () => {
    if (window.confirm("Are you sure you want to cancel this draft order?")) {
      dispatch(removeAllItems());
      dispatch(removeCustomer());
      enqueueSnackbar("Order cancelled", { variant: "info" });
      navigate("/");
    }
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });

      return;
    }

    if (paymentMethod === "Online") {
      // load the script
      try {
        const res = await loadScript(
          "https://checkout.razorpay.com/v1/checkout.js"
        );

        if (!res) {
          enqueueSnackbar("Razorpay SDK failed to load. Are you online?", {
            variant: "warning",
          });
          return;
        }

        if (!customerData.table) {
          enqueueSnackbar("Table information missing! Please select a table again.", {
            variant: "error",
          });
          navigate("/tables");
          return;
        }

        console.log("[Bill] Checking Customer Data:", customerData);
        if (!customerData.customerName || !customerData.customerPhone) {
          enqueueSnackbar("Customer details missing! Please restart the order.", {
            variant: "error",
          });
          navigate("/");
          return;
        }

        // create order
        const reqData = {
          amount: totalPriceWithTax.toFixed(2),
        };

        const { data } = await createOrderRazorpay(reqData);

        const options = {
          key: `${import.meta.env.VITE_RAZORPAY_KEY_ID}`,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "RESTRO",
          description: "Secure Payment for Your Meal",
          order_id: data.order.id,
          handler: async function (response) {
            const verification = await verifyPaymentRazorpay(response);
            console.log(verification);
            enqueueSnackbar(verification.data.message, { variant: "success" });

            // Place the order
            const orderData = {
              customerDetails: {
                name: customerData.customerName,
                phone: customerData.customerPhone,
                guests: customerData.guests,
              },
              orderStatus: "In Progress",
              bills: {
                total: total,
                tax: tax,
                totalWithTax: totalPriceWithTax,
              },
              items: cartData,
              table: customerData.table?.tableId,
              paymentMethod: paymentMethod,
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              },
            };

            setTimeout(() => {
              orderMutation.mutate(orderData);
            }, 1500);
          },
          prefill: {
            name: customerData.customerName,
            email: "",
            contact: customerData.customerPhone,
          },
          theme: { color: "#025cca" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Payment Failed!", {
          variant: "error",
        });
      }
    } else {
      if (!customerData.table) {
        enqueueSnackbar("Table information missing! Please select a table again.", {
          variant: "error",
        });
        navigate("/tables");
        return;
      }

      console.log("[Bill-Cash] Checking Customer Data:", customerData);
      if (!customerData.customerName || !customerData.customerPhone) {
        enqueueSnackbar("Customer details missing! Please restart the order.", {
          variant: "error",
        });
        navigate("/");
        return;
      }

      // Place the order
      const orderData = {
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
        },
        orderStatus: "In Progress",
        bills: {
          total: total,
          tax: tax,
          totalWithTax: totalPriceWithTax,
        },
        items: cartData,
        table: customerData.table?.tableId,
        paymentMethod: paymentMethod,
      };
      orderMutation.mutate(orderData);
    }
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      console.log(data);

      setOrderInfo(data);

      // Update Table
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };

      setTimeout(() => {
        tableUpdateMutation.mutate(tableData);
      }, 1500);

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });
      setShowInvoice(true);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: (resData) => {
      console.log(resData);
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center px-5 py-2">
        <h1 className="text-[#f5f5f5] text-lg font-bold tracking-wider">
          Bill
        </h1>
        <button 
          onClick={handleCancelOrder}
          className="text-red-500 hover:text-red-600 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-tighter"
        >
          <FaTrash size={10} /> Cancel
        </button>
      </div>

      <div className="space-y-1 px-5">
        <div className="flex items-center justify-between text-[13px]">
          <p className="text-[#ababab] font-medium">
            Items({cartData.length})
          </p>
          <h1 className="text-[#f5f5f5] font-bold">
            ₹{total.toFixed(2)}
          </h1>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <p className="text-[#ababab] font-medium">Tax (5.25%)</p>
          <h1 className="text-[#f5f5f5] font-bold">₹{tax.toFixed(2)}</h1>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[#2a2a2a] mt-1">
          <p className="text-[#f5f5f5] text-sm font-semibold">Total</p>
          <h1 className="text-[#f6b100] text-lg font-black">
            ₹{totalPriceWithTax.toFixed(2)}
          </h1>
        </div>
      </div>

      <div className="px-5 mt-3 space-y-2 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaymentMethod("Cash")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              paymentMethod === "Cash"
                ? "bg-[#f6b100] text-[#1a1a1a]"
                : "bg-[#262626] text-[#ababab]"
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setPaymentMethod("Online")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              paymentMethod === "Online"
                ? "bg-[#f6b100] text-[#1a1a1a]"
                : "bg-[#262626] text-[#ababab]"
            }`}
          >
            Online
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => orderInfo ? setShowInvoice(true) : enqueueSnackbar("Place order first!", { variant: "info" })}
            className="bg-[#025cca] py-3 rounded-lg text-[#f5f5f5] font-bold text-[11px] uppercase tracking-wide"
          >
            Print
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={orderMutation.isPending}
            className="bg-[#f6b100] py-3 rounded-lg text-[#1a1a1a] font-black text-[11px] uppercase tracking-wide disabled:opacity-50"
          >
            {orderMutation.isPending ? "..." : "Order"}
          </button>
        </div>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </div>
  );
};

export default Bill;
