import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Branch, POSPoint, Shift } from "../../../shared/types";

interface POSState {
  selectedBranch: Branch | null;
  selectedPOSPoint: POSPoint | null;
  activeShift: Shift | null;
  showShiftModal: boolean;

  setSelectedBranch: (branch: Branch | null) => void;
  setSelectedPOSPoint: (posPoint: POSPoint | null) => void;
  setActiveShift: (shift: Shift | null) => void;
  setShowShiftModal: (show: boolean) => void;
  clearPOS: () => void;
}

const usePOSStore = create<POSState>()(
  persist(
    (set) => ({
      selectedBranch: null,
      selectedPOSPoint: null,
      activeShift: null,
      showShiftModal: false,

      setSelectedBranch: (branch) => set({ selectedBranch: branch }),
      setSelectedPOSPoint: (posPoint) => set({ selectedPOSPoint: posPoint }),
      setActiveShift: (shift) => set({ activeShift: shift }),
      setShowShiftModal: (show) => set({ showShiftModal: show }),

      clearPOS: () =>
        set({
          selectedBranch: null,
          selectedPOSPoint: null,
          activeShift: null,
          showShiftModal: false,
        }),
    }),
    {
      name: "pos-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default usePOSStore;
