import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils"
import { useDispatch, useSelector } from "react-redux";
import { setOrder, updateTable } from "../../redux/slices/customerSlice";
import { setCart } from "../../redux/slices/cartSlice";
import { FaCircle, FaShoppingCart } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

const TableCard = ({id, name, status, initials, seats, order, onViewOrder}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { canCompleteOrders } = useAuth();
  const customerData = useSelector((state) => state.customer);

  const handleClick = (name) => {
    // 1. If Table is Booked, Show Quick Summary Modal
    if (status === "Booked" && order) {
      onViewOrder(order);
      return;
    }

    // 2. If Table is Free and user is Waiter, block order creation
    if (!canCompleteOrders) {
      return;
    }

    // 3. If Table is Free and user is Cashier, allow creating order
    if (!customerData.customerName || !customerData.customerPhone) {
      window.dispatchEvent(new CustomEvent("open-create-order-modal"));
      return;
    }

    const table = { tableId: id, tableNo: name }
    dispatch(updateTable({ table }))
    navigate(`/menu`);
  };

  return (
    <div 
      onClick={() => handleClick(name)} 
      key={id} 
      className={`w-full hover:bg-[#2c2c2c] bg-[#262626] p-4 rounded-xl cursor-pointer transition-all border-2 ${
        status === "Booked" ? "border-[#2e4a40]" : "border-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[#f5f5f5] text-lg font-bold">T-{name}</h1>
        <div className="flex items-center gap-2">
           <span className="text-[#ababab] text-xs flex items-center gap-1">
             <FaShoppingCart size={10}/> {order?.items?.length || 0}
           </span>
           <p className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
             status === "Booked" ? "bg-[#2e4a40] text-green-400" : "bg-[#333] text-[#ababab]"
           }`}>
             {status}
           </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg mb-2"
          style={{backgroundColor : initials ? getBgColor() : "#1f1f1f"}}
        >
          {getAvatarName(initials) || "?"}
        </div>
        <p className="text-[#f5f5f5] text-xs font-semibold truncate w-full text-center">
          {initials || "Available"}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#333] flex items-center justify-between">
        <p className="text-[#ababab] text-[10px] font-medium">Seats: {seats}</p>
        {status === "Booked" && (
          <div className="flex items-center gap-1">
            <FaCircle className={`text-[8px] ${order?.orderStatus === "Ready" ? "text-green-500 animate-pulse" : "text-yellow-500"}`} />
            <span className="text-[#f5f5f5] text-[10px] font-bold">
               {order?.orderStatus || "In Progress"}
            </span>
          </div>
        )}
      </div>
      
      {status === "Booked" && (
        <div className="mt-2 text-right text-[#f6b100] text-xs font-black">
          ₹{order?.bills?.totalWithTax?.toFixed(2) || "0.00"}
        </div>
      )}
    </div>
  );
};

export default TableCard;
