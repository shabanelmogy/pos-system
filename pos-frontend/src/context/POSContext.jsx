import React, { createContext, useContext, useState, useEffect } from "react";
import { getActiveShift } from "../https";
import { useSelector } from "react-redux";

const POSContext = createContext();

export const POSProvider = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const [selectedBranch, setSelectedBranch] = useState(() => JSON.parse(localStorage.getItem("selectedBranch")));
  const [selectedPOSPoint, setSelectedPOSPoint] = useState(() => JSON.parse(localStorage.getItem("selectedPOSPoint")));
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Auto-assign Branch and POS for Cashiers on login
  useEffect(() => {
    if (user && user.role === "cashier") {
       const assignedBranch = user.branch;
       const assignedPOS = user.posPermissions?.[0]?.posPoint;

       if (assignedBranch && (!selectedBranch || selectedBranch.id !== assignedBranch.id)) {
         setSelectedBranch(assignedBranch);
       }
       if (assignedPOS && (!selectedPOSPoint || selectedPOSPoint.id !== assignedPOS.id)) {
         setSelectedPOSPoint(assignedPOS);
       }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("selectedBranch", JSON.stringify(selectedBranch));
  }, [selectedBranch]);

  useEffect(() => {
    localStorage.setItem("selectedPOSPoint", JSON.stringify(selectedPOSPoint));
    
    // Only check active shift if BOTH user and POS point are ready 
    if (selectedPOSPoint && user) {
      // Logic: Only fetch from server if we don't have ANY active shift in state
      // OR if the current active shift belongs to a DIFFERENT POS point
      const currentActiveId = activeShift?.posPointId || activeShift?.pos_point_id;
      if (!activeShift || currentActiveId !== selectedPOSPoint.id) {
        checkActiveShift(selectedPOSPoint.id);
      }
    } else {
      setActiveShift(null);
      setLoading(false);
    }
  }, [selectedPOSPoint, user, activeShift]); // Added activeShift to prevent stale closure

  const checkActiveShift = async (posPointId) => {
    try {
      setLoading(true);
      const res = await getActiveShift(posPointId);
      setActiveShift(res.data.data);
    } catch (error) {
      console.error("Failed to fetch active shift:", error);
      setActiveShift(null);
    } finally {
      setLoading(false);
    }
  };

  const logoutPOS = () => {
    setSelectedBranch(null);
    setSelectedPOSPoint(null);
    setActiveShift(null);
    localStorage.removeItem("selectedBranch");
    localStorage.removeItem("selectedPOSPoint");
  };

  return (
    <POSContext.Provider value={{ 
      selectedBranch, setSelectedBranch, 
      selectedPOSPoint, setSelectedPOSPoint, 
      activeShift, setActiveShift,
      loading, checkActiveShift,
      showShiftModal, setShowShiftModal,
      logoutPOS
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error("usePOS must be used within a POSProvider");
  return context;
};
