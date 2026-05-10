import React, { useState } from "react";
import { openShift, closeShift } from "../../https";
import { useDispatch, useSelector } from "react-redux";
import { setActiveShift, setShowShiftModal } from "../../redux/slices/posSlice";
import { motion } from "framer-motion";
import { MdPlayArrow, MdStop, MdAttachMoney, MdNotes, MdClose, MdTrendingUp, MdHistory } from "react-icons/md";
import { enqueueSnackbar } from "notistack";

const ShiftManager = () => {
  const dispatch = useDispatch();
  const { activeShift, selectedBranch, selectedPOSPoint } = useSelector((state) => state.pos);
  const [openingBalance, setOpeningBalance] = useState("0");
  const [closingBalance, setClosingBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await openShift({
        branchId: selectedBranch.id,
        posPointId: selectedPOSPoint.id,
        openingBalance: parseFloat(openingBalance || 0)
      });
      dispatch(setActiveShift(res.data.data));
      dispatch(setShowShiftModal(false));
      enqueueSnackbar("Shift started successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || "Failed to start shift", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await closeShift(activeShift.id, {
        closingBalance: parseFloat(closingBalance || 0)
      });
      dispatch(setActiveShift(null));
      dispatch(setShowShiftModal(false));
      enqueueSnackbar("Shift closed successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || "Failed to close shift", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    dispatch(setShowShiftModal(false));
  };

  if (!activeShift) {
    return (
      <div className="fixed inset-0 bg-[#0f0f0f] z-[3000] flex items-center justify-center p-6 overflow-y-auto">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1a1a1a] border border-[#333] p-8 lg:p-12 rounded-[3rem] max-w-xl w-full shadow-2xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#f6b100]/5 blur-[100px] rounded-full"></div>

          <header className="text-center mb-10 relative z-10">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <MdPlayArrow size={44} />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">Start New Shift</h1>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#262626] rounded-full border border-[#333]">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-[#ababab] text-[10px] font-black uppercase tracking-widest">{selectedPOSPoint?.name} • {selectedBranch?.name}</p>
            </div>
          </header>

          <form onSubmit={handleOpenShift} className="space-y-8 relative z-10">
            <div className="group">
              <label className="block text-[#555] text-[10px] font-black uppercase tracking-widest mb-4 ml-1 group-focus-within:text-[#f6b100] transition-colors">Opening Cash Balance (₹)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#f6b100] transition-colors">
                  <MdAttachMoney size={24} />
                </div>
                <input 
                  type="number" 
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#111] border border-[#333] rounded-[1.5rem] p-6 pl-16 text-white text-3xl font-black focus:outline-none focus:border-[#f6b100] transition-all shadow-inner tracking-tighter"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                disabled={loading}
                className="w-full bg-[#f6b100] text-[#1a1a1a] font-black py-6 rounded-[1.5rem] text-sm uppercase tracking-[0.2em] hover:bg-white transition-all shadow-2xl shadow-yellow-500/10 disabled:opacity-50"
              >
                {loading ? "Validating Ledger..." : "Open Terminal Session"}
              </button>


            </div>
          </form>

          <p className="text-center mt-8 text-[9px] text-[#333] font-bold uppercase tracking-widest leading-relaxed">
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
        className="bg-[#1a1a1a] border border-[#333] p-8 lg:p-12 rounded-[3.5rem] max-w-2xl w-full shadow-2xl relative"
      >
        <button onClick={closeModal} className="absolute top-8 right-8 text-[#444] hover:text-white transition-colors">
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



        <form onSubmit={handleCloseShift} className="space-y-8">
           <div className="group">
              <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1">Actual Cash in Drawer (₹)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#f6b100] transition-colors">
                  <MdAttachMoney size={24} />
                </div>
                <input 
                  type="number" 
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#222] border border-[#333] rounded-[1.5rem] p-6 pl-16 text-white text-3xl font-black focus:outline-none focus:border-[#f6b100] transition-all tracking-tighter shadow-inner"
                />
              </div>
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
