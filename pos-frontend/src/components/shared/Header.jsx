import React from "react";
import { FaSearch, FaUserCircle, FaBell } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard, MdStore, MdComputer, MdSwapHoriz, MdStop, MdSettings } from "react-icons/md";
import { useSnackbar } from "notistack";
import useAuth from "../../hooks/useAuth";
import { clearPOS, setShowShiftModal } from "../../redux/slices/posSlice";

const Header = () => {
  const { role, name, canAccessDashboard } = useAuth();
  const { selectedBranch, selectedPOSPoint, activeShift } = useSelector((state) => state.pos);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      dispatch(clearPOS());
      navigate("/auth");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Logout failed. Please try again.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleChangeTerminal = () => {
    if (activeShift) {
      enqueueSnackbar("Please close your active shift before changing terminals.", { variant: "warning" });
      return;
    }
    logoutPOS();
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a] border-b border-[#333]">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-4 cursor-pointer group">
        <div className="bg-[#f6b100] p-1.5 rounded-lg transform group-hover:rotate-12 transition-transform">
          <img src={logo} className="h-6 w-6 brightness-0" alt="restro logo" />
        </div>
        <h1 className="text-xl font-black text-[#f5f5f5] tracking-tighter uppercase">
          Restro<span className="text-[#f6b100]">POS</span>
        </h1>
      </div>

      {/* CENTERED POS TERMINAL INFO */}
      {selectedBranch && selectedPOSPoint && (
        <div className="absolute left-1/2 -translate-x-1/2 hidden xl:flex items-center gap-6 px-6 py-2 bg-[#1f1f1f] border border-[#333] rounded-2xl shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="text-[#f6b100] bg-[#f6b100]/10 p-2 rounded-lg">
              <MdStore size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#ababab] font-bold uppercase tracking-widest">Branch</span>
              <span className="text-xs text-white font-bold">{selectedBranch.name}</span>
            </div>
          </div>
          
          <div className="w-px h-8 bg-[#333]"></div>

          <div className="flex items-center gap-3">
            <div className="text-[#f6b100] bg-[#f6b100]/10 p-2 rounded-lg">
              <MdComputer size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#ababab] font-bold uppercase tracking-widest">Terminal</span>
              <span className="text-xs text-white font-bold">{selectedPOSPoint.name}</span>
            </div>
          </div>

          {activeShift && (
            <>
              <div className="w-px h-8 bg-[#333]"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#ababab] font-bold uppercase tracking-widest">Session ID</span>
                <span className="text-[10px] text-[#f6b100] font-black tracking-tight">{activeShift.slug || "N/A"}</span>
              </div>
            </>
          )}

          <button 
            onClick={handleChangeTerminal}
            className="ml-2 p-2 hover:bg-[#333] rounded-lg text-[#ababab] hover:text-[#f6b100] transition-all tooltip"
            title="Change Terminal"
          >
            <MdSwapHoriz size={20} />
          </button>
        </div>
      )}

      {/* SHIFT ACTIONS (For Cashiers) */}
      {activeShift && (
        <button 
          onClick={() => dispatch(setShowShiftModal(true))}
          className="ml-auto mr-4 flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
        >
          <MdStop className="group-hover:animate-pulse" size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">End Shift</span>
        </button>
      )}

      {/* LOGGED USER DETAILS */}
      <div className="flex items-center gap-4">
        {canAccessDashboard && (
          <div onClick={() => navigate("/dashboard")} className="bg-[#1f1f1f] border border-[#333] hover:border-[#f6b100] rounded-xl p-3 cursor-pointer transition-all tooltip" title="Dashboard">
            <MdDashboard className="text-[#f5f5f5] text-2xl" />
          </div>
        )}
        <div onClick={() => navigate("/settings")} className="bg-[#1f1f1f] border border-[#333] hover:border-[#f6b100] rounded-xl p-3 cursor-pointer transition-all tooltip" title="POS Settings">
          <MdSettings className="text-[#f5f5f5] text-2xl" />
        </div>
        <div className="bg-[#1f1f1f] border border-[#333] rounded-xl p-3 cursor-pointer relative group">
          <FaBell className="text-[#f5f5f5] text-2xl" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-[#1f1f1f] rounded-full"></span>
        </div>
        
        <div className="h-10 w-px bg-[#333] mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <h1 className="text-sm text-[#f5f5f5] font-black tracking-tight uppercase">
              {name || "User"}
            </h1>
            <p className="text-[10px] text-[#f6b100] font-bold uppercase tracking-widest">
              {role || "Staff"}
            </p>
          </div>
          <div className="relative group cursor-pointer" onClick={handleLogout}>
            <div className="absolute inset-0 bg-[#f6b100] rounded-full scale-0 group-hover:scale-110 transition-transform blur-md opacity-20"></div>
            <FaUserCircle className="text-[#f5f5f5] text-4xl relative z-10" />
            <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <IoLogOut className="text-white" size={10} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
