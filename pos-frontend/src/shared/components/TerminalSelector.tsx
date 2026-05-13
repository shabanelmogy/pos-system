import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranches, getPOSPoints } from "../../features/pos/api/posApi";
import usePOSStore from "../../features/pos/store/usePOSStore";
import { motion } from "framer-motion";
import { MdStore, MdComputer, MdLock } from "react-icons/md";
import useAuth from "../../features/auth/hooks/useAuth";
import { Branch, POSPoint } from "../types";

const TerminalSelector: React.FC = () => {
  const { selectedBranch, setSelectedBranch, setSelectedPOSPoint } = usePOSStore();
  const { branchId, posPermissions, isAdmin } = useAuth();
  const [step, setStep] = useState<number>(1);

  const { data: branches } = useQuery<Branch[]>({ 
    queryKey: ["branches"], 
    queryFn: async () => (await getBranches()).data.data 
  });

  const { data: posPoints } = useQuery<POSPoint[]>({ 
    queryKey: ["posPoints", selectedBranch?.id], 
    queryFn: async () => (await getPOSPoints(selectedBranch?.id!)).data.data,
    enabled: !!selectedBranch
  });

  // Auto-select branch if user is restricted to one
  useEffect(() => {
    if (branches && branchId && !isAdmin) {
      const userBranch = branches.find(b => b.id === branchId);
      if (userBranch) {
        setSelectedBranch(userBranch);
        setStep(2);
      }
    }
  }, [branches, branchId, isAdmin, setSelectedBranch]);

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setStep(2);
  };

  const handlePOSSelect = (pos: POSPoint) => {
    setSelectedPOSPoint(pos);
  };

  // Filter terminals based on user permissions
  const filteredPOSPoints = (posPoints || []).filter(pos => {
    if (isAdmin || posPermissions.length === 0) return true;
    return posPermissions.some(p => p.posPointId === pos.id);
  });

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
            Terminal Setup
          </motion.h1>
          <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] text-xs">
            {step === 1 ? "Select physical branch location" : "Assign to register / device"}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {step === 1 ? (
            (branches || []).map((branch) => {
              const isDisabled = branchId && branch.id !== branchId && !isAdmin;
              return (
                <motion.button
                  whileHover={isDisabled ? {} : { scale: 1.02, y: -5 }}
                  whileTap={isDisabled ? {} : { scale: 0.98 }}
                  key={branch.id}
                  disabled={isDisabled}
                  onClick={() => handleBranchSelect(branch)}
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
              
              {filteredPOSPoints.length === 0 && (
                <div className="col-span-full py-10 bg-[var(--bg-card)] border border-red-500/20 rounded-3xl text-center">
                   <p className="text-red-500 font-black uppercase tracking-widest text-xs">Access Denied</p>
                   <p className="text-[var(--text-muted)] text-sm mt-2">You are not authorized to use any terminals in this branch.</p>
                </div>
              )}

              {!branchId && (
                <button 
                  onClick={() => setStep(1)}
                  className="col-span-full mt-10 text-[var(--text-muted)] hover:text-[var(--primary)] font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  Back to branch selection
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalSelector;
