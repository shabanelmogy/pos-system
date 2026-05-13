import React from "react";
import { motion } from "framer-motion";
import { MdPlayArrow, MdStop, MdAttachMoney, MdClose } from "react-icons/md";
import useShiftManager from "../hooks/useShiftManager";

const ShiftManager = () => {
  const { 
    activeShift, 
    selectedBranch, 
    selectedPOSPoint, 
    setShowShiftModal, 
    loading,
    openForm,
    closeForm
  } = useShiftManager();

  const closeModal = () => {
    setShowShiftModal(false);
  };

  if (!activeShift) {
    return (
      <div className="fixed inset-0 bg-[#0f0f0f] z-[3000] flex items-center justify-center p-6 overflow-y-auto">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 lg:p-12 rounded-[3rem] max-w-xl w-full shadow-2xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -end-24 w-64 h-64 bg-[var(--primary)]/5 blur-[100px] rounded-full"></div>

          <header className="text-center mb-10 relative z-10">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <MdPlayArrow size={44} />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">Start New Shift</h1>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card-alt)] rounded-full border border-[var(--border-main)]">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">{selectedPOSPoint?.name} • {selectedBranch?.name}</p>
            </div>
          </header>

          <form onSubmit={openForm.onSubmit} className="space-y-8 relative z-10">
            <div className="group">
              <label className="block text-[#555] text-[10px] font-black uppercase tracking-widest mb-4 ms-1 group-focus-within:text-[var(--primary)] transition-colors">Opening Cash Balance (₹)</label>
              <div className="relative">
                <div className="absolute start-6 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[var(--primary)] transition-colors">
                  <MdAttachMoney size={24} />
                </div>
                <input 
                  type="number" 
                  {...openForm.register("openingBalance")}
                  placeholder="0.00"
                  className={`w-full bg-[#111] border ${openForm.errors.openingBalance ? 'border-red-500' : 'border-[var(--border-main)]'} rounded-[1.5rem] p-6 ps-16 text-white text-3xl font-black focus:outline-none focus:border-[var(--primary)] transition-all shadow-inner tracking-tighter`}
                />
              </div>
              {openForm.errors.openingBalance && (
                <span className="text-[10px] text-red-500 font-black mt-2 ms-2 block uppercase tracking-widest">{openForm.errors.openingBalance.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                disabled={loading}
                className="w-full bg-[var(--primary)] text-[var(--bg-card)] font-black py-6 rounded-[1.5rem] text-sm uppercase tracking-[0.2em] hover:bg-white transition-all shadow-2xl shadow-yellow-500/10 disabled:opacity-50"
              >
                {loading ? "Validating Ledger..." : "Open Terminal Session"}
              </button>
            </div>
          </form>

          <p className="text-center mt-8 text-[9px] text-[var(--border-main)] font-bold uppercase tracking-widest leading-relaxed">
            Shift tracking ensures financial integrity.<br/>
            All sessions are logged for audit purposes.
          </p>
        </motion.div>
      </div>
    );
  }

  // CLOSE SHIFT UI
  return (
    <div className="fixed inset-0 bg-black/95 z-[3000] flex items-center justify-center p-6 backdrop-blur-xl">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 lg:p-12 rounded-[3.5rem] max-w-2xl w-full shadow-2xl relative"
      >
        <button onClick={closeModal} className="absolute top-8 end-8 text-[#444] hover:text-white transition-colors">
           <MdClose size={32} />
        </button>

        <header className="mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-500/10 text-red-500 rounded-full mb-6 border border-red-500/10">
             <MdStop size={20} />
             <span className="text-[10px] font-black uppercase tracking-widest">End Session</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">Closing Reconciliation</h1>
          <p className="text-[#555] text-xs font-bold uppercase tracking-widest mt-2">Finalize your counts before drawer handoff</p>
        </header>

        <form onSubmit={closeForm.onSubmit} className="space-y-8">
           <div className="group">
              <label className="block text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mb-4 ms-1">Actual Cash in Drawer (₹)</label>
              <div className="relative">
                <div className="absolute start-6 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[var(--primary)] transition-colors">
                  <MdAttachMoney size={24} />
                </div>
                <input 
                  type="number" 
                  {...closeForm.register("closingBalance")}
                  placeholder="0.00"
                  className={`w-full bg-[var(--bg-input)] border ${closeForm.errors.closingBalance ? 'border-red-500' : 'border-[var(--border-main)]'} rounded-[1.5rem] p-6 ps-16 text-[var(--text-main)] text-3xl font-black focus:outline-none focus:border-[var(--primary)] transition-all tracking-tighter shadow-inner`}
                />
              </div>
              {closeForm.errors.closingBalance && (
                <span className="text-[10px] text-red-500 font-black mt-2 ms-2 block uppercase tracking-widest">{closeForm.errors.closingBalance.message}</span>
              )}
              <p className="mt-4 text-[9px] text-[#444] font-black uppercase tracking-widest">Include the opening balance in your total count</p>
           </div>

           <button 
             disabled={loading}
             className="w-full bg-red-600 text-white font-black py-6 rounded-[1.5rem] text-sm uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-2xl shadow-red-500/10 disabled:opacity-50"
           >
             {loading ? "Auditing Ledger..." : "Finalize & Close Shift"}
           </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ShiftManager;
