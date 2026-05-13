import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../api/customerApi";
import { FaUserCircle, FaPhone, FaHistory, FaCrown, FaUsers } from "react-icons/fa";
import { formatDateAndTime } from "../../../shared/utils";
import { motion } from "framer-motion";

const CustomerList: React.FC = () => {
  const { data: resData, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await getCustomers();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {[1,2,3].map(i => (
          <div key={i} className="bg-[var(--bg-card)] h-64 rounded-[2.5rem] border border-[var(--border-main)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (resData?.length === 0) {
    return (
      <div className="py-40 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-main)] text-[var(--text-dim)]">
          <FaUsers size={40} />
        </div>
        <h3 className="text-[var(--text-main)] text-xl font-black uppercase tracking-tighter">No Customers Yet</h3>
        <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xs font-medium">When guests place orders, their details and loyalty points will appear here.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
    >
      {(resData || []).map((customer: any, index: number) => {
        const isLoyal = customer.totalOrders >= 5;
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            key={customer.id} 
            className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] hover:border-[var(--primary)]/30 transition-all shadow-2xl group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isLoyal ? 'from-yellow-500' : 'from-blue-500'} opacity-[0.02] blur-2xl`} />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-5">
                <div className={`p-5 rounded-2xl ${isLoyal ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'} shadow-inner`}>
                  <FaUserCircle size={36} />
                </div>
                <div>
                  <h2 className="text-[var(--text-main)] text-xl font-black tracking-tighter flex items-center gap-2 uppercase">
                    {customer.name}
                    {isLoyal && <FaCrown className="text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" size={16} />}
                  </h2>
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-bold mt-1.5 uppercase tracking-widest">
                    <FaPhone className="text-[var(--text-dim)]" size={10} />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </div>
              {isLoyal && (
                <span className="text-[9px] bg-yellow-500 text-black px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] shadow-lg shadow-yellow-500/20">
                  Premium
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5 mt-10 relative z-10">
              <div className="bg-[var(--bg-main)] p-5 rounded-3xl border border-[var(--border-main)] group-hover:border-[var(--border-main)] transition-colors shadow-inner">
                <p className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-[0.2em]">Visits</p>
                <p className="text-[var(--text-main)] text-3xl font-black mt-2 tracking-tighter">{customer.totalOrders}</p>
              </div>
              <div className="bg-[var(--bg-main)] p-5 rounded-3xl border border-[var(--border-main)] group-hover:border-[var(--border-main)] transition-colors shadow-inner">
                <p className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-[0.2em]">Spent</p>
                <p className="text-[var(--primary)] text-3xl font-black mt-2 tracking-tighter">₹{parseFloat(customer.totalSpent).toFixed(0)}</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--bg-card-alt)] flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-main)] flex items-center justify-center border border-[var(--bg-card-alt)]">
                   <FaHistory className="text-[var(--text-dim)]" size={12} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Last Visit</span>
                   <span className="text-[11px] text-[var(--text-muted)] font-bold">{customer.lastOrderAt ? formatDateAndTime(customer.lastOrderAt).split(',')[0] : 'First Timer'}</span>
                </div>
              </div>
              <button className="bg-[var(--bg-card-alt)] hover:bg-[var(--bg-hover)] px-4 py-2 rounded-xl text-[10px] text-[var(--text-main)] font-black uppercase tracking-widest transition-all border border-[var(--border-main)]">Details</button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default CustomerList;
