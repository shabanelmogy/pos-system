import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface TicketProps {
  order: any;
  onStatusChange: (orderId: string, status: string) => void;
  isUpdating?: boolean;
}

const Ticket: React.FC<TicketProps> = ({ order, onStatusChange, isUpdating }) => {
  const [timeElapsed, setTimeElapsed] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const distance = formatDistanceToNow(new Date(order.createdAt), { addSuffix: false });
      setTimeElapsed(distance);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "border-l-4 border-yellow-500";
      case "PREPARING": return "border-l-4 border-blue-500";
      case "READY": return "border-l-4 border-green-500";
      default: return "";
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[var(--bg-card)] rounded-xl shadow-lg overflow-hidden mb-4 ${getStatusColor(order.fulfillmentStatus)}`}
    >
      <div className="p-4 border-b border-[var(--border-main)] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">#{order.orderNumber || order.id.slice(0, 4)}</h2>
          <p className="text-xs text-[var(--text-muted)] font-bold uppercase">
            {order.orderType === "DINE_IN" ? `Table ${order.table?.tableNo || "?"}` : 
             order.orderType === "TAKE_AWAY" ? "Takeaway" :
             order.orderType === "DELIVERY" ? "Delivery" : 
             order.orderType}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-bold text-orange-500">{timeElapsed}</p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Elapsed</p>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
        {order.orderItems?.map((item: any) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[var(--primary)]">{item.quantity}x</span>
                <span className="font-medium text-[var(--text-main)]">{item.menuItem?.name}</span>
              </div>
              {item.notes && (
                <p className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded mt-1 font-bold">
                  {item.notes.toUpperCase()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[var(--bg-main)] flex gap-2">
        {order.fulfillmentStatus === "PENDING" && (
          <button 
            disabled={isUpdating}
            onClick={() => onStatusChange(order.id, "PREPARING")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            START
          </button>
        )}
        {order.fulfillmentStatus === "PREPARING" && (
          <button 
            disabled={isUpdating}
            onClick={() => onStatusChange(order.id, "READY")}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            READY
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Ticket;
