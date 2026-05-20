import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUser, FaShoppingCart, FaCreditCard, FaEdit, FaCheckCircle } from "react-icons/fa";
import { getAvatarName, getBgColor } from "@/shared/utils";
import useAuth from "@/features/system/auth/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderFulfillment } from "@/shared/api/services/orderApi";
import { useSnackbar } from "notistack";

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdate: (order: any) => void;
}

const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({ isOpen, onClose, order, onUpdate }) => {
  const { canCompleteOrders } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (data: { orderId: string; fulfillmentStatus: string }) => updateOrderFulfillment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      enqueueSnackbar("Order marked as Ready!", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to update status", { variant: "error" });
    }
  });

  if (!order) return null;

  const handleMarkAsReady = () => {
    statusMutation.mutate({ orderId: order.id, fulfillmentStatus: "READY" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[var(--bg-card)] w-full max-w-md rounded-2xl border border-[var(--border-main)] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-card-alt)]">
              <div className="flex items-center gap-3">
                 <div 
                   className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner"
                   style={{ backgroundColor: getBgColor() }}
                 >
                   {getAvatarName(order?.customerDetails?.name)}
                 </div>
                 <div>
                   <h2 className="text-[var(--text-main)] text-lg font-bold">{order?.customerDetails?.name}</h2>
                   <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">Order Summary</p>
                 </div>
              </div>
              <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[400px] overflow-y-auto scrollbar-hide">
              {/* Order Status Badge */}
              <div className="mb-4 flex items-center justify-between bg-[var(--bg-card-alt)] p-3 rounded-xl border border-[var(--border-main)]">
                <div className="flex items-center gap-2">
                   <FaUser className="text-[var(--primary)] text-xs" />
                   <span className="text-[var(--text-muted)] text-xs">Table {order?.table?.tableNo} • {order?.customerDetails?.guests} Guests</span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                  order?.fulfillmentStatus === "READY" ? "bg-[var(--status-success-bg)] text-[var(--status-success)]" : "bg-[var(--status-warning-bg)] text-[var(--status-warning)]"
                }`}>
                  {order?.lifecycle === "COMPLETED" ? "COMPLETED" : order?.fulfillmentStatus || "PREPARING"}
                </span>
              </div>

              {/* Items List */}
              <h3 className="text-[var(--text-main)] text-sm font-bold mb-3 flex items-center gap-2">
                 <FaShoppingCart size={14} className="text-[var(--primary)]" />
                 Items Details
              </h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 bg-[var(--bg-hover)] rounded-lg">
                    <span className="text-[var(--text-muted)] text-xs font-bold italic">Detailed item list optimized for performance. See full receipt for details.</span>
                 </div>
              </div>
            </div>

            {/* Footer / Total */}
            <div className="px-6 py-6 bg-[var(--bg-card-alt)] border-t border-[var(--border-main)]">
              
              {/* Mark as Ready Button (For Waiters/Cashiers) */}
              {order?.fulfillmentStatus !== "READY" && order?.lifecycle !== "COMPLETED" && order?.lifecycle !== "VOIDED" && (
                <button
                  onClick={handleMarkAsReady}
                  disabled={statusMutation.isPending}
                  className="w-full bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success)]/30 py-3 rounded-xl font-bold mb-4 flex items-center justify-center gap-2 hover:bg-[var(--status-success)] hover:text-black transition-all disabled:opacity-50"
                >
                  <FaCheckCircle /> {statusMutation.isPending ? "Updating..." : "MARK AS READY"}
                </button>
              )}

              <div className="flex justify-between items-center mb-6">
                 <div>
                   <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase">Total Bill (incl. tax)</p>
                   <h3 className="text-[var(--primary)] text-3xl font-black tracking-tighter">₹{order?.bills?.totalWithTax?.toFixed(2)}</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase">Payment</p>
                    <div className="flex items-center gap-2 text-[var(--text-main)] font-bold">
                       <FaCreditCard className="text-xs text-[var(--text-muted)]" />
                       {order?.paymentMethod || "Unpaid"}
                    </div>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={onClose}
                   className={`${canCompleteOrders ? "flex-1" : "w-full"} bg-transparent border border-[var(--border-main)] text-[var(--text-main)] py-3 rounded-xl font-bold hover:bg-[var(--bg-hover)] transition-colors`}
                 >
                   Close Summary
                 </button>
                 {canCompleteOrders && (
                    <button 
                      onClick={() => onUpdate(order)}
                      className="flex-1 bg-[var(--primary)] text-[var(--bg-card)] py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <FaEdit /> UPDATE
                    </button>
                 )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderSummaryModal;
