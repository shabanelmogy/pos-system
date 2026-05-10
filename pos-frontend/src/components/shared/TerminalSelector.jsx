import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranches, getPOSPoints } from "../../https";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedBranch, setSelectedPOSPoint } from "../../redux/slices/posSlice";
import { motion } from "framer-motion";
import { MdStore, MdComputer, MdCheckCircle, MdLock } from "react-icons/md";
import useAuth from "../../hooks/useAuth";

const TerminalSelector = () => {
  const dispatch = useDispatch();
  const { selectedBranch } = useSelector((state) => state.pos);
  const { branchId, posPermissions, isAdmin } = useAuth();
  const [step, setStep] = useState(1);

  const { data: branches } = useQuery({ 
    queryKey: ["branches"], 
    queryFn: async () => (await getBranches()).data.data 
  });

  const { data: posPoints } = useQuery({ 
    queryKey: ["posPoints", selectedBranch?.id], 
    queryFn: async () => (await getPOSPoints(selectedBranch?.id)).data.data,
    enabled: !!selectedBranch
  });

  // Auto-select branch if user is restricted to one
  useEffect(() => {
    if (branches && branchId && !isAdmin) {
      const userBranch = branches.find(b => b.id === branchId);
      if (userBranch) {
        dispatch(setSelectedBranch(userBranch));
        setStep(2);
      }
    }
  }, [branches, branchId, isAdmin]);

  const handleBranchSelect = (branch) => {
    dispatch(setSelectedBranch(branch));
    setStep(2);
  };

  const handlePOSSelect = (pos) => {
    dispatch(setSelectedPOSPoint(pos));
  };

  // Filter terminals based on user permissions
  const filteredPOSPoints = (posPoints || []).filter(pos => {
    if (isAdmin || posPermissions.length === 0) return true;
    return posPermissions.some(p => p.posPointId === pos.id);
  });

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] z-[200] flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-4xl w-full py-20">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#f6b100]/10 text-[#f6b100] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[#f6b100]/20">
             <MdLock /> Security Enforcement Active
          </div>
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-black text-white uppercase tracking-tighter mb-2"
          >
            Terminal Setup
          </motion.h1>
          <p className="text-[#ababab] font-bold uppercase tracking-[0.2em] text-xs">
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
                  className={`bg-[#1a1a1a] border p-8 rounded-[2.5rem] text-left transition-all group relative ${
                    isDisabled ? 'opacity-30 grayscale cursor-not-allowed border-[#222]' : 'border-[#333] hover:border-[#f6b100]'
                  }`}
                >
                  <div className={`w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mb-8 transition-all ${
                    isDisabled ? 'text-[#333]' : 'text-[#f6b100] group-hover:bg-[#f6b100] group-hover:text-[#1a1a1a]'
                  }`}>
                    <MdStore size={36} />
                  </div>
                  <h3 className="text-white text-2xl font-black tracking-tighter mb-1 uppercase">{branch.name}</h3>
                  <p className="text-[#ababab] text-xs uppercase tracking-widest font-black">{branch.code}</p>
                  
                  {isDisabled && (
                    <div className="absolute top-6 right-6 text-[#444]">
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
                  className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] text-left hover:border-[#f6b100] transition-all group"
                >
                  <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center text-[#f6b100] mb-8 group-hover:bg-[#f6b100] group-hover:text-[#1a1a1a] transition-all">
                    <MdComputer size={36} />
                  </div>
                  <h3 className="text-white text-2xl font-black tracking-tighter mb-1 uppercase">{pos.name}</h3>
                  <p className="text-[#ababab] text-xs uppercase tracking-widest font-black">{pos.code}</p>
                </motion.button>
              ))}
              
              {filteredPOSPoints.length === 0 && (
                <div className="col-span-full py-10 bg-[#1a1a1a] border border-red-500/20 rounded-3xl text-center">
                   <p className="text-red-500 font-black uppercase tracking-widest text-xs">Access Denied</p>
                   <p className="text-[#ababab] text-sm mt-2">You are not authorized to use any terminals in this branch.</p>
                </div>
              )}

              {!branchId && (
                <button 
                  onClick={() => setStep(1)}
                  className="col-span-full mt-10 text-[#ababab] hover:text-[#f6b100] font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
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
