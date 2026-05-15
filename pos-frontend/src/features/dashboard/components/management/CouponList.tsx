import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCoupons } from "../../api/dashboardApi";
import { FaTag, FaPlus, FaCalendarAlt, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface CouponListProps {
  onAdd: () => void;
  onEdit: (coupon: any) => void;
}

const CouponList: React.FC<CouponListProps> = ({ onAdd, onEdit }) => {
  const { data: coupons, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const res = await getCoupons();
      return res.data.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center text-[var(--text-dim)] uppercase font-black tracking-widest animate-pulse">Loading Coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[var(--text-main)] text-sm font-black uppercase tracking-widest flex items-center gap-2">
           <FaTag className="text-[var(--primary)]" /> Promotional Coupons
        </h3>
        <button onClick={onAdd} className="bg-[var(--primary)] text-[var(--bg-card)] px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
          <FaPlus /> New Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons?.map((coupon: any) => (
          <div 
            key={coupon.id} 
            onClick={() => onEdit(coupon)}
            className="group bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-3xl hover:border-[var(--primary)] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                {coupon.code}
              </div>
              {coupon.isActive ? <FaToggleOn size={20} className="text-emerald-500" /> : <FaToggleOff size={20} className="text-[var(--text-dim)]" />}
            </div>

            <h4 className="text-white text-2xl font-black mb-1 tracking-tighter">
              {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
            </h4>
            <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mb-4">
              Min Order: ₹{coupon.minOrderAmount}
            </p>

            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
              <FaCalendarAlt /> {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "No Expiry"}
            </div>

            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[var(--primary)]/5 blur-xl group-hover:bg-[var(--primary)]/10 transition-all"></div>
          </div>
        ))}
      </div>

      {coupons?.length === 0 && (
        <div className="bg-[var(--bg-card)]/50 border-2 border-dashed border-[var(--border-main)] rounded-[3rem] p-12 text-center">
          <FaTag size={40} className="mx-auto text-[var(--text-dim)] mb-4 opacity-20" />
          <p className="text-[var(--text-dim)] text-xs font-black uppercase tracking-widest">No active coupons found.</p>
        </div>
      )}
    </div>
  );
};

export default CouponList;
