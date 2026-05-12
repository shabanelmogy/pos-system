import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const usePOSStore = create(
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
