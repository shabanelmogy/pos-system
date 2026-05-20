import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getShifts } from "@/shared/api/services/dashboardApi";
import { motion } from "framer-motion";
import { FaWallet, FaExclamationTriangle, FaCheckCircle, FaSearch, FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface ShortageMonitorProps {
  branchId?: string;
}

const ShortageMonitor: React.FC<ShortageMonitorProps> = ({ branchId }) => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState("closed"); // Usually we check closed shifts for shortages

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ["shifts", branchId, filterStatus],
    queryFn: async () => {
      const params: any = { status: filterStatus };
      if (branchId && branchId !== "all") params.branchId = branchId;
      const res = await getShifts(params);
      return res.data.data || [];
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const getVarianceColor = (variance: string | number) => {
    const v = parseFloat(variance.toString());
    if (v < 0) return "text-red-500 bg-red-500/10";
    if (v > 0) return "text-emerald-500 bg-emerald-500/10";
    return "text-blue-500 bg-blue-500/10";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
        <p className="text-[var(--text-muted)] animate-pulse uppercase text-xs font-black tracking-widest">{t('dashboard.orders.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
           <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-red-500/10 text-red-500">
                 <FaExclamationTriangle size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">{t('dashboard.shortage.total_shortages')}</p>
                 <h2 className="text-2xl font-black text-[var(--text-main)]">
                    ₹{shifts.reduce((acc: number, s: any) => acc + Math.min(0, parseFloat(s.variance || 0)), 0).toFixed(2).replace('-', '')}
                 </h2>
              </div>
           </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
           <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
                 <FaCheckCircle size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">{t('dashboard.shortage.total_overages')}</p>
                 <h2 className="text-2xl font-black text-[var(--text-main)]">
                    ₹{shifts.reduce((acc: number, s: any) => acc + Math.max(0, parseFloat(s.variance || 0)), 0).toFixed(2)}
                 </h2>
              </div>
           </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
           <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                 <FaWallet size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">{t('dashboard.shortage.net_variance')}</p>
                 <h2 className="text-2xl font-black text-[var(--text-main)]">
                    ₹{shifts.reduce((acc: number, s: any) => acc + parseFloat(s.variance || 0), 0).toFixed(2)}
                 </h2>
              </div>
           </div>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="p-6 bg-[var(--bg-card-alt)] flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">{t('dashboard.shortage.tracking_title')}</h3>
                 <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-tighter animate-pulse border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Live
                 </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">{t('dashboard.shortage.tracking_desc')}</p>
           </div>
           
           <div className="flex items-center gap-3">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[var(--bg-card-alt)] border border-[var(--border-main)] text-[var(--text-main)] text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-[var(--primary)]"
              >
                 <option value="closed">{t('dashboard.shortage.closed_shifts')}</option>
                 <option value="open">{t('dashboard.shortage.open_shifts')}</option>
                 <option value="all">{t('dashboard.shortage.all_shifts')}</option>
              </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-card-alt)]/50 text-[var(--text-dim)] text-[10px] font-black uppercase tracking-widest border-b border-[var(--border-main)]">
                <th className="px-6 py-4 text-left">{t('dashboard.shortage.table.shift_date')}</th>
                <th className="px-6 py-4 text-left">{t('dashboard.shortage.table.cashier_pos')}</th>
                <th className="px-6 py-4 text-right">{t('dashboard.shortage.table.opening')}</th>
                <th className="px-6 py-4 text-right">{t('dashboard.shortage.table.cash_sales')}</th>
                <th className="px-6 py-4 text-right">{t('dashboard.shortage.table.expected')}</th>
                <th className="px-6 py-4 text-right">{t('dashboard.shortage.table.actual')}</th>
                <th className="px-6 py-4 text-center">{t('dashboard.shortage.table.variance')}</th>
              </tr>
            </thead>
            <tbody className="">
              {shifts.length > 0 ? shifts.map((shift: any, index: number) => (
                <tr key={shift.id} className="transition-colors hover:bg-[var(--bg-card-alt)]/50 group border-b border-[var(--bg-card-alt)]">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--text-main)]">{shift.slug}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{new Date(shift.openedAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--text-main)]">{shift.cashier?.name || 'Unknown'}</span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">{shift.posPoint?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-[var(--text-main)]">
                    ₹{parseFloat(shift.openingBalance || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-emerald-500 font-bold">
                    +₹{parseFloat(shift.cashSales || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-[var(--text-main)] font-bold">
                    ₹{parseFloat(shift.expectedBalance || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-[var(--text-main)]">
                    ₹{parseFloat(shift.closingBalance || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black font-mono shadow-sm ${getVarianceColor(shift.variance)}`}>
                      {parseFloat(shift.variance || 0) > 0 ? '+' : ''}{parseFloat(shift.variance || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-[var(--text-muted)] italic text-sm">
                    {t('dashboard.shortage.no_discrepancies')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShortageMonitor;
