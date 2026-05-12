import React from "react";
import { MdOutlineInventory2, MdRefresh } from "react-icons/md";

export const EmptyState = ({ label }) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
    <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-main)] text-[var(--text-dim)]">
      <MdOutlineInventory2 size={40} />
    </div>
    <h3 className="text-[var(--text-main)] text-xl font-bold uppercase tracking-tighter">No {label} Found</h3>
    <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xs">Start building your enterprise by adding your first {label.toLowerCase()}.</p>
  </div>
);

export const LoadingState = () => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mb-4" />
    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest animate-pulse">Establishing Connection...</p>
  </div>
);

export const ErrorState = ({ label, onRetry }) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 text-red-500">
      <MdRefresh size={32} className="animate-spin-slow" />
    </div>
    <h3 className="text-red-500 text-xl font-black uppercase tracking-tighter">Sync Failed</h3>
    <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xs">We couldn't retrieve the {label.toLowerCase()} data. Please verify your connection or permissions.</p>
    <button onClick={onRetry} className="mt-6 px-6 py-2.5 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20">Retry Sync</button>
  </div>
);
