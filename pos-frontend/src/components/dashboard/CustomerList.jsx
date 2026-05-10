import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../../https";
import { FaUserCircle, FaPhone, FaHistory, FaCrown } from "react-icons/fa";
import { formatDateAndTime } from "../../utils";

const CustomerList = () => {
  const { data: resData, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await getCustomers();
      return res.data.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-20 text-[#ababab]">Loading customer database...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {(resData || []).map((customer) => {
        const isLoyal = customer.totalOrders >= 5;
        return (
          <div key={customer.id} className="bg-[#1a1a1a] p-6 rounded-3xl border border-[#333] hover:border-[#444] transition-all shadow-xl group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${isLoyal ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  <FaUserCircle size={32} />
                </div>
                <div>
                  <h2 className="text-[#f5f5f5] text-lg font-bold flex items-center gap-2">
                    {customer.name}
                    {isLoyal && <FaCrown className="text-yellow-500" size={14} />}
                  </h2>
                  <div className="flex items-center gap-2 text-[#ababab] text-sm mt-1">
                    <FaPhone size={12} />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </div>
              {isLoyal && (
                <span className="text-[10px] bg-yellow-500 text-black px-2 py-1 rounded font-black uppercase tracking-widest">
                  Premium
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-[#121212] p-3 rounded-2xl border border-[#333]">
                <p className="text-[#ababab] text-[10px] uppercase font-bold tracking-widest">Total Orders</p>
                <p className="text-[#f5f5f5] text-xl font-black mt-1">{customer.totalOrders}</p>
              </div>
              <div className="bg-[#121212] p-3 rounded-2xl border border-[#333]">
                <p className="text-[#ababab] text-[10px] uppercase font-bold tracking-widest">Total Spent</p>
                <p className="text-[#f6b100] text-xl font-black mt-1">₹{parseFloat(customer.totalSpent).toFixed(0)}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#333] flex items-center justify-between text-[#ababab] text-xs">
              <div className="flex items-center gap-2">
                <FaHistory size={12} />
                <span>Last Visit: {customer.lastOrderAt ? formatDateAndTime(customer.lastOrderAt).split(',')[0] : 'N/A'}</span>
              </div>
              <button className="text-blue-500 font-bold hover:underline">View History</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerList;
