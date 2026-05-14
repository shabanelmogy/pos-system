import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranches, getPOSPoints } from "../../features/pos/api/posApi";
import usePOSStore from "../../features/pos/store/usePOSStore";
import { motion } from "framer-motion";
import { MdStore, MdComputer, MdLock } from "react-icons/md";
import useAuth from "../../features/auth/hooks/useAuth";
import useUserStore from "../../features/auth/store/useUserStore";
import { Branch, POSPoint } from "../types";

const TerminalSelector: React.FC = () => {
  const { selectedBranch, setSelectedBranch, selectedPOSPoint, setSelectedPOSPoint, clearPOS } = usePOSStore();
  const { branchId, posPermissions, isAdmin } = useAuth();
  const { removeUser } = useUserStore();
  
  // Internal step for users who ARE allowed to pick a branch (Global Admins)
  const [internalStep, setInternalStep] = useState<number>(1);
  
  // Effective step: Always 2 if user is assigned to a branch
  const step = branchId ? 2 : internalStep;

  const { data: branches, isLoading: isBranchesLoading } = useQuery<Branch[]>({ 
    queryKey: ["branches"], 
    queryFn: async () => (await getBranches()).data.data 
  });

  const { data: posPoints, isLoading: isPOSLoading } = useQuery<POSPoint[]>({ 
    queryKey: ["posPoints", selectedBranch?.id], 
    queryFn: async () => (await getPOSPoints(selectedBranch?.id!)).data.data,
    enabled: !!selectedBranch
  });

  // Auto-select branch if user has an assigned branchId
  useEffect(() => {
    if (branches && branchId && !selectedBranch) {
      const userBranch = branches.find(b => b.id === branchId);
      if (userBranch) {
        setSelectedBranch(userBranch);
      }
    }
  }, [branches, branchId, selectedBranch, setSelectedBranch]);

  const handlePOSSelect = (pos: POSPoint) => {
    setSelectedPOSPoint(pos);
  };

  const handleLogout = () => {
    removeUser();
    clearPOS();
  };

  // Auto-select if user has exactly ONE assigned POS point
  useEffect(() => {
    if (!isAdmin && posPermissions.length === 1 && posPoints && !selectedPOSPoint) {
      const targetPosId = posPermissions[0].posPointId;
      const targetPos = posPoints.find(p => p.id === targetPosId);
      if (targetPos) {
        setSelectedPOSPoint(targetPos);
      }
    }
  }, [isAdmin, posPermissions, posPoints, selectedPOSPoint, setSelectedPOSPoint]);

  // Filter terminals based on user permissions
  const filteredPOSPoints = (posPoints || []).filter(pos => {
    if (isAdmin) return true;
    return posPermissions.some(p => p.posPointId === pos.id);
  });

  // IMMEDIATE SECURITY CHECK: If non-admin has NO permissions, show error direct.
  if (!isAdmin && posPermissions.length === 0) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-main)] z-[200] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[var(--bg-card)] border border-red-500/20 p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden"
        >
           <div className="absolute -top-24 -end-24 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full"></div>
           <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
              <MdLock size={40} />
           </div>
           <p className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Security Alert</p>
           <h2 className="text-[var(--text-main)] text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">Access Restricted</h2>
           <p className="text-[var(--text-muted)] text-sm font-medium mb-10 leading-relaxed">
             Your account is not linked to any active POS terminal.<br/>
             <span className="text-[var(--text-dim)] text-xs mt-2 block italic">Please contact your system administrator.</span>
           </p>
           
           <button 
             onClick={handleLogout}
             className="w-full bg-[var(--bg-card-alt)] hover:bg-red-500/10 text-[var(--text-main)] hover:text-red-500 font-black py-4 rounded-2xl transition-all border border-[var(--border-main)] hover:border-red-500/50 uppercase tracking-widest text-[10px] mb-8"
           >
             Log Out & Switch Account
           </button>

           <div className="pt-8 border-t border-[var(--border-main)]">
              <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Global Security Check Active</p>
           </div>
        </motion.div>
      </div>
    );
  }

  // Check if we are still waiting for the assigned branch to be synchronized into state
  const isBranchSyncing = !!(branchId && !selectedBranch);

  // 1. Loading View
  if (isBranchesLoading || isBranchSyncing || (step === 2 && isPOSLoading)) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-main)] z-[200] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mb-6"></div>
        <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.2em] text-[10px]">
          {step === 1 ? "Initializing Locations..." : "Verifying Permissions..."}
        </p>
      </div>
    );
  }

  // 2. Error View - Show immediately if unassigned
  if (step === 2 && !isPOSLoading && filteredPOSPoints.length === 0) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-main)] z-[200] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[var(--bg-card)] border border-red-500/20 p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden"
        >
           <div className="absolute -top-24 -end-24 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full"></div>
           <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
              <MdLock size={40} />
           </div>
           <p className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Security Alert</p>
           <h2 className="text-[var(--text-main)] text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">Access Restricted</h2>
           <p className="text-[var(--text-muted)] text-sm font-medium mb-10 leading-relaxed">
             Your account is not linked to any active POS terminal in this branch.<br/>
             <span className="text-[var(--text-dim)] text-xs mt-2 block italic">Please contact your system administrator.</span>
           </p>
           
           <button 
             onClick={handleLogout}
             className="w-full bg-[var(--bg-card-alt)] hover:bg-red-500/10 text-[var(--text-main)] hover:text-red-500 font-black py-4 rounded-2xl transition-all border border-[var(--border-main)] hover:border-red-500/50 uppercase tracking-widest text-[10px] mb-8"
           >
             Log Out & Switch Account
           </button>

           <div className="pt-8 border-t border-[var(--border-main)]">
              <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Context: {selectedBranch?.name || 'Assigned Branch'}</p>
           </div>
        </motion.div>
      </div>
    );
  }

  // 3. Selection View
  return (
    <div className="fixed inset-0 bg-[var(--bg-main)] z-[200] flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-4xl w-full py-20">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[var(--primary)]/20">
             <MdLock /> Security Enforcement Active
          </div>
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-2"
          >
            {step === 1 ? "Branch Selection" : "Terminal Selection"}
          </motion.h1>
          <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] text-xs">
            {step === 1 ? "Select physical branch location" : "Assign to register / device"}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {step === 1 ? (
            (branches || []).map((branch) => {
              const isDisabled = !!(branchId && branch.id !== branchId && !isAdmin);
              return (
                <motion.button
                  whileHover={isDisabled ? {} : { scale: 1.02, y: -5 }}
                  whileTap={isDisabled ? {} : { scale: 0.98 }}
                  key={branch.id}
                  disabled={isDisabled}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setInternalStep(2);
                  }}
                  className={`bg-[var(--bg-card)] border p-8 rounded-[2.5rem] text-start transition-all group relative ${
                    isDisabled ? 'opacity-30 grayscale cursor-not-allowed border-[var(--bg-card-alt)]' : 'border-[var(--border-main)] hover:border-[var(--primary)]'
                  }`}
                >
                  <div className={`w-16 h-16 bg-[var(--bg-card-alt)] rounded-2xl flex items-center justify-center mb-8 transition-all ${
                    isDisabled ? 'text-[var(--border-main)]' : 'text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--bg-card)]'
                  }`}>
                    <MdStore size={36} />
                  </div>
                  <h3 className="text-[var(--text-main)] text-2xl font-black tracking-tighter mb-1 uppercase">{branch.name}</h3>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-black">{branch.code}</p>
                  {isDisabled && (
                    <div className="absolute top-6 end-6 text-[#444]">
                       <MdLock size={20} />
                    </div>
                  )}
                </motion.button>
              );
            })
          ) : (
            <>
              {filteredPOSPoints.map((pos) => (
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  key={pos.id}
                  onClick={() => handlePOSSelect(pos)}
                  className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] text-start hover:border-[var(--primary)] transition-all group"
                >
                  <div className="w-16 h-16 bg-[var(--bg-card-alt)] rounded-2xl flex items-center justify-center text-[var(--primary)] mb-8 group-hover:bg-[var(--primary)] group-hover:text-[var(--bg-card)] transition-all">
                    <MdComputer size={36} />
                  </div>
                  <h3 className="text-[var(--text-main)] text-2xl font-black tracking-tighter mb-1 uppercase">{pos.name}</h3>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-black">{pos.code}</p>
                </motion.button>
              ))}
              {!branchId && isAdmin && (
                <button 
                  onClick={() => setInternalStep(1)}
                  className="col-span-full mt-10 text-[var(--text-muted)] hover:text-[var(--primary)] font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  Back to branch selection
                </button>
              )}
            </>
          )}
        </div>

        <div className="mt-20 pt-10 border-t border-[var(--border-main)]/50 text-center">
            <button 
              onClick={handleLogout}
              className="text-[var(--text-dim)] hover:text-red-500 font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 mx-auto group"
            >
              <span className="w-10 h-px bg-[var(--border-main)] group-hover:bg-red-500/50"></span>
              Exit POS & Log Out
              <span className="w-10 h-px bg-[var(--border-main)] group-hover:bg-red-500/50"></span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalSelector;
