import React from "react";
import { FaSearch, FaUserCircle, FaBell, FaSun, FaMoon } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../features/auth/api/authApi";
import { removeUser } from "../../features/auth/store/userSlice";
import { toggleTheme } from "../../shared/store/themeSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard, MdStore, MdComputer, MdSwapHoriz, MdStop, MdSettings } from "react-icons/md";
import { useSnackbar } from "notistack";
import useAuth from "../../features/auth/hooks/useAuth";
import { clearPOS, setShowShiftModal } from "../../features/pos/store/posSlice";

const Header = () => {
  const { role, name, canAccessDashboard, isAdmin } = useAuth();
  const { selectedBranch, selectedPOSPoint, activeShift } = useSelector((state) => state.pos);
  const { mode } = useSelector((state) => state.theme);
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
    dispatch(clearPOS());
  };

  return (
    <header className="flex justify-between items-center py-3 px-4 md:px-8 bg-[var(--bg-card)] border-b border-[var(--border-main)] relative z-50 transition-colors duration-300">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-4 cursor-pointer group">
        <div className="bg-[var(--primary)] p-1.5 rounded-lg transform group-hover:rotate-12 transition-transform shadow-lg shadow-[var(--primary)]/20">
          <img src={logo} className="h-6 w-6 brightness-0" alt="restro logo" />
        </div>
        <h1 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase hidden sm:block">
          Restro<span className="text-[var(--primary)]">POS</span>
        </h1>
      </div>

      {/* CENTERED POS TERMINAL INFO */}
      {selectedBranch && selectedPOSPoint && (
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl shadow-xl shadow-black/10 px-6 py-1.5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-[var(--primary)] bg-[var(--primary)]/10 p-1.5 rounded-lg">
                <MdStore size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none mb-0.5">Branch</span>
                <span className="text-xs text-[var(--text-main)] font-bold leading-none">{selectedBranch.name}</span>
              </div>
            </div>

            <div className="w-px h-6 bg-[var(--border-main)]"></div>

            <div className="flex items-center gap-3">
              <div className="text-[var(--primary)] bg-[var(--primary)]/10 p-1.5 rounded-lg">
                <MdComputer size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none mb-0.5">Terminal</span>
                <span className="text-xs text-[var(--text-main)] font-bold leading-none">{selectedPOSPoint.name}</span>
              </div>
            </div>

            <button
              onClick={handleChangeTerminal}
              className="ml-2 p-1.5 hover:bg-[var(--bg-card-alt)] rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
              title="Change Terminal"
            >
              <MdSwapHoriz size={18} />
            </button>
          </div>

          {activeShift && (
            <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-[var(--border-main)]/50 w-full justify-center">
              <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Active Session</span>
              <span className="text-[10px] text-[var(--primary)] font-black tracking-tight">{activeShift.slug || "N/A"}</span>
            </div>
          )}
        </div>
      )}

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* SHIFT ACTIONS (For Cashiers) */}
        {activeShift && (
          <button
            onClick={() => dispatch(setShowShiftModal(true))}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all group shrink-0"
          >
            <MdStop className="group-hover:animate-pulse" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">End Session</span>
          </button>
        )}

        {/* THEME TOGGLE */}
        <button 
          onClick={() => dispatch(toggleTheme())}
          className="bg-[var(--bg-main)] border border-[var(--border-main)] hover:border-[var(--primary)] text-[var(--text-main)] rounded-xl p-3 cursor-pointer transition-all shadow-sm flex items-center justify-center w-11 h-11"
          title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {mode === 'dark' ? <FaSun size={18} className="text-[var(--primary)]" /> : <FaMoon size={18} className="text-blue-500" />}
        </button>

        {canAccessDashboard && (
          <div onClick={() => navigate("/dashboard")} className="bg-[var(--bg-main)] border border-[var(--border-main)] hover:border-[var(--primary)] rounded-xl p-3 cursor-pointer transition-all shadow-sm hidden sm:block" title="Dashboard">
            <MdDashboard className="text-[var(--text-main)] text-xl md:text-2xl" />
          </div>
        )}
        
        {isAdmin && (
          <div onClick={() => navigate("/settings")} className="bg-[var(--bg-main)] border border-[var(--border-main)] hover:border-[var(--primary)] rounded-xl p-3 cursor-pointer transition-all shadow-sm" title="POS Settings">
            <MdSettings className="text-[var(--text-main)] text-xl md:text-2xl" />
          </div>
        )}

        <div className="bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl p-3 cursor-pointer relative group hidden md:block shadow-sm">
          <FaBell className="text-[var(--text-main)] text-2xl" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-[var(--bg-main)] rounded-full"></span>
        </div>

        <div className="h-8 w-px bg-[var(--border-main)] mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <h1 className="text-sm text-[var(--text-main)] font-black tracking-tight uppercase leading-none mb-1">
              {name || "User"}
            </h1>
            <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-widest leading-none">
              {role || "Staff"}
            </p>
          </div>
          <div className="relative group cursor-pointer" onClick={handleLogout}>
            <div className="absolute inset-0 bg-[var(--primary)] rounded-full scale-0 group-hover:scale-110 transition-transform blur-md opacity-20"></div>
            <FaUserCircle className="text-[var(--text-main)] text-3xl md:text-4xl relative z-10" />
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
