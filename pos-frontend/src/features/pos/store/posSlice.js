import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedBranch: JSON.parse(localStorage.getItem("selectedBranch")) || null,
  selectedPOSPoint: JSON.parse(localStorage.getItem("selectedPOSPoint")) || null,
  activeShift: null,
  showShiftModal: false,
};

const posSlice = createSlice({
  name: "pos",
  initialState,
  reducers: {
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
      localStorage.setItem("selectedBranch", JSON.stringify(action.payload));
    },
    setSelectedPOSPoint: (state, action) => {
      state.selectedPOSPoint = action.payload;
      localStorage.setItem("selectedPOSPoint", JSON.stringify(action.payload));
    },
    setActiveShift: (state, action) => {
      state.activeShift = action.payload;
    },
    setShowShiftModal: (state, action) => {
      state.showShiftModal = action.payload;
    },
    clearPOS: (state) => {
      state.selectedBranch = null;
      state.selectedPOSPoint = null;
      state.activeShift = null;
      localStorage.removeItem("selectedBranch");
      localStorage.removeItem("selectedPOSPoint");
    }
  },
});

export const { 
  setSelectedBranch, 
  setSelectedPOSPoint, 
  setActiveShift, 
  setShowShiftModal, 
  clearPOS 
} = posSlice.actions;

export default posSlice.reducer;
