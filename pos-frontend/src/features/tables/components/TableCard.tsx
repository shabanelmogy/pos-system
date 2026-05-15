import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../../shared/utils"
import useCustomerStore from "../../customers/store/useCustomerStore";
import useCartStore from "../../pos/store/useCartStore";
import usePOSStore from "../../pos/store/usePOSStore";
import { FaCircle, FaShoppingCart } from "react-icons/fa";
import useAuth from "../../auth/hooks/useAuth";

interface TableCardProps {
  id: string;
  name: string;
  status: string;
  initials: string | null;
  seats: number;
  order: any;
  onViewOrder: (order: any) => void;
}

const TableCard: React.FC<TableCardProps> = ({id, name, status, initials, seats, order, onViewOrder}) => {
  const navigate = useNavigate();
  const { canCompleteOrders } = useAuth();
  const { selectedPOSPoint } = usePOSStore();
  const { customerName, customerPhone, setCustomer, updateTable } = useCustomerStore();
  const { clearCart } = useCartStore();

  const handleClick = (name: string) => {
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
    const requireCustomer = selectedPOSPoint?.settings?.requireCustomerOnOrder;

    if (!customerName || !customerPhone) {
      if (!requireCustomer) {
        // Automatically start guest order if not required
        setCustomer({ 
          name: "Guest", 
          phone: "N/A", 
          guests: 1 
        });
      } else {
        // Force modal if required
        clearCart(); 
        window.dispatchEvent(new CustomEvent("open-create-order-modal"));
        return;
      }
    }

    const table = { tableId: id, tableNo: name }
    updateTable(table)
    // FINAL SAFETY: Clear cart before going to a fresh table menu
    clearCart(); 
    navigate(`/menu`);
  };

  return (
    <div 
      onClick={() => handleClick(name)} 
      key={id} 
      className={`w-full hover:bg-[var(--bg-hover)] bg-[var(--bg-card-alt)] p-4 rounded-xl cursor-pointer transition-all border-2 ${
        status === "Booked" ? "border-[var(--status-success)]" : "border-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[var(--text-main)] text-lg font-bold">T-{name}</h1>
        <div className="flex items-center gap-2">
           <span className="text-[var(--text-muted)] text-xs flex items-center gap-1">
             <FaShoppingCart size={10}/> -
           </span>
           <p className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
             status === "Booked" ? "bg-[var(--status-success-bg)] text-[var(--status-success)]" : "bg-[var(--border-main)] text-[var(--text-muted)]"
           }`}>
             {status}
           </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg mb-2"
          style={{backgroundColor : initials ? getBgColor() : "var(--bg-main)"}}
        >
          {getAvatarName(initials) || "?"}
        </div>
        <p className="text-[var(--text-main)] text-xs font-semibold truncate w-full text-center">
          {initials || "Available"}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-main)] flex items-center justify-between">
        <p className="text-[var(--text-muted)] text-[10px] font-medium">Seats: {seats}</p>
        {status === "Booked" && (
          <div className="flex items-center gap-1">
            <FaCircle className={`text-[8px] ${order?.fulfillmentStatus === "READY" ? "text-green-500 animate-pulse" : "text-yellow-500"}`} />
            <span className="text-[var(--text-main)] text-[10px] font-bold uppercase">
               {order?.lifecycle === "COMPLETED" ? "COMPLETED" : order?.fulfillmentStatus || "PREPARING"}
            </span>
          </div>
        )}
      </div>
      
      {status === "Booked" && (
        <div className="mt-2 text-right text-[var(--primary)] text-xs font-black">
          ₹{order?.bills?.totalWithTax?.toFixed(2) || "0.00"}
        </div>
      )}
    </div>
  );
};

export default TableCard;
