import React, { useState, useEffect } from "react";
import { FaUserCircle, FaBell, FaSun, FaMoon, FaGlobeAmericas } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../features/auth/api/authApi";
import useUserStore from "../../features/auth/store/useUserStore";
import useThemeStore from "../../shared/store/useThemeStore";
import usePOSStore from "../../features/pos/store/usePOSStore";
import { useNavigate } from "react-router-dom";
import { MdDashboard, MdStore, MdComputer, MdSwapHoriz, MdStop, MdSettings, MdWifi, MdWifiOff } from "react-icons/md";
import { useSnackbar } from "notistack";
import useAuth from "../../features/auth/hooks/useAuth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { role, name, canAccessDashboard, isAdmin } = useAuth();
  const { removeUser } = useUserStore();
  const { selectedBranch, selectedPOSPoint, activeShift, clearPOS, setShowShiftModal } = usePOSStore();
  const { mode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(timer);
    };
  }, []);

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      removeUser();
      clearPOS();
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
    clearPOS();
  };

  return (
    <header className="sticky top-0 w-full flex justify-between items-center py-3 px-4 md:px-8 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-main)] relative z-50 transition-all duration-300 shadow-2xl shadow-black/5">
      {/* LEFT SECTION: LOGO & STATUS */}
      <div className="flex items-center gap-6">
        <motion.div 
          onClick={() => navigate("/")} 
          className="flex items-center gap-4 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="bg-gradient-to-br from-[var(--primary)] to-orange-600 p-2 rounded-xl transform group-hover:rotate-6 transition-all shadow-lg shadow-[var(--primary)]/30">
            <img src={logo} className="h-5 w-5 brightness-0 invert" alt="restro logo" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-[var(--text-main)] tracking-tighter uppercase leading-none">
              Restro<span className="text-[var(--primary)]">POS</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                {isOnline ? 'System Online' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CENTER SECTION: TERMINAL INFO */}
      <AnimatePresence mode="wait">
        {selectedBranch && selectedPOSPoint && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl px-6 py-2 shadow-inner"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-[var(--primary)] bg-[var(--primary)]/10 p-1.5 rounded-lg border border-[var(--primary)]/20">
                  <MdStore size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-none mb-0.5">Location</span>
                  <span className="text-[11px] text-[var(--text-main)] font-black leading-none">{selectedBranch.name}</span>
                </div>
              </div>

              <div className="w-px h-5 bg-[var(--border-main)]"></div>

              <div className="flex items-center gap-3">
                <div className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20">
                  <MdComputer size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-none mb-0.5">Terminal</span>
                  <span className="text-[11px] text-[var(--text-main)] font-black leading-none">{selectedPOSPoint.name}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ rotate: 180 }}
                onClick={handleChangeTerminal}
                className="ms-2 p-1.5 hover:bg-[var(--bg-card-alt)] rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                title="Change Terminal"
              >
                <MdSwapHoriz size={18} />
              </motion.button>
            </div>

            {activeShift && (
              <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-[var(--border-main)]/30 w-full justify-center">
                <div className="w-1 h-1 bg-[var(--primary)] rounded-full animate-bounce"></div>
                <span className="text-[9px] text-[var(--primary)] font-black tracking-[0.15em] uppercase">{activeShift.slug}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT SECTION: ACTIONS & USER */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* TIME DISPLAY (Premium Global Touch) */}
        <div className="hidden xl:flex flex-col items-end me-4 border-e border-[var(--border-main)] pe-4">
          <span className="text-[11px] font-black text-[var(--text-main)] tracking-tight">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {activeShift && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShiftModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all group shrink-0"
          >
            <MdStop className="group-hover:animate-pulse" size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.1em] hidden sm:block">Close Shift</span>
          </motion.button>
        )}

        <div className="flex items-center gap-1 bg-[var(--bg-main)]/50 p-1 rounded-2xl border border-[var(--border-main)]">
          <IconButton 
            onClick={() => toggleTheme()}
            title="Toggle Theme"
          >
            {mode === 'dark' ? <FaSun size={14} className="text-yellow-400" /> : <FaMoon size={14} className="text-blue-500" />}
          </IconButton>

          <LanguageSwitcher />

          {canAccessDashboard && (
            <IconButton onClick={() => navigate("/dashboard")} title="Analytics">
              <MdDashboard size={18} />
            </IconButton>
          )}
          
          {isAdmin && (
            <IconButton onClick={() => navigate("/settings")} title="System Settings">
              <MdSettings size={18} />
            </IconButton>
          )}

          <div className="relative group">
            <IconButton title="Notifications">
              <FaBell size={16} />
            </IconButton>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-[var(--bg-card)] rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-[var(--bg-card)] rounded-full"></span>
          </div>
        </div>

        <div className="w-px h-8 bg-[var(--border-main)] mx-2 hidden sm:block"></div>

        {/* USER PROFILE */}
        <motion.div 
          onClick={handleLogout}
          whileHover={{ x: 5 }}
          className="flex items-center gap-3 cursor-pointer group bg-[var(--bg-main)]/50 hover:bg-[var(--primary)]/10 p-1.5 rounded-2xl border border-transparent hover:border-[var(--primary)]/20 transition-all"
        >
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-[11px] text-[var(--text-main)] font-black uppercase tracking-tight leading-none mb-0.5">
              {name || "Guest"}
            </span>
            <span className="text-[8px] text-[var(--primary)] font-black uppercase tracking-widest leading-none">
              {role || "Staff"}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--primary)] rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--bg-card-alt)] to-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center relative z-10 overflow-hidden">
               <FaUserCircle className="text-[var(--text-muted)] text-2xl group-hover:text-[var(--primary)] transition-colors" />
               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--bg-card)] rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

const IconButton = ({ children, onClick, title }) => (
  <motion.button
    whileHover={{ scale: 1.1, backgroundColor: 'var(--bg-card-alt)' }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    title={title}
    className="p-2.5 text-[var(--text-muted)] hover:text-[var(--primary)] rounded-xl transition-all"
  >
    {children}
  </motion.button>
);

export default Header;
