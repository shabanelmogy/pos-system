import React, { useState, useEffect } from "react";
import { FaUserCircle, FaBell, FaSun, FaMoon } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../features/auth/api/authApi";
import useUserStore from "../../features/auth/store/useUserStore";
import useThemeStore from "../../shared/store/useThemeStore";
import usePOSStore from "../../features/pos/store/usePOSStore";
import { useNavigate } from "react-router-dom";
import { MdDashboard, MdStore, MdComputer, MdSwapHoriz, MdStop, MdSettings } from "react-icons/md";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import useAuth from "../../features/auth/hooks/useAuth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";

const Header: React.FC = () => {
  const { role, name, canAccessDashboard, isAdmin } = useAuth();
  const { removeUser } = useUserStore();
  const { selectedBranch, selectedPOSPoint, activeShift, clearPOS, setShowShiftModal } = usePOSStore();
  const { mode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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
    onError: (error: any) => {
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
    <header className="sticky top-0 w-full flex justify-between items-center py-2.5 px-4 md:px-8 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-main)] relative z-50 transition-all duration-300 shadow-2xl shadow-black/5">
      {/* LEFT SECTION: LOGO & STATUS */}
      <div className="flex-1 flex items-center gap-6">
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

      {/* CENTER SECTION: STATUS BOARD */}
      <div className="hidden xl:flex items-center">
        <AnimatePresence mode="wait">
          {selectedBranch && selectedPOSPoint && (
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl p-1 shadow-inner"
            >
              {/* Branch Pill */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 border-e border-[var(--border-main)]/50">
                <div className="text-[var(--primary)] bg-[var(--primary)]/10 p-1.5 rounded-lg border border-[var(--primary)]/20">
                  <MdStore size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-none mb-0.5">Location</span>
                  <span className="text-[10px] text-[var(--text-main)] font-black leading-none">{selectedBranch.name}</span>
                </div>
              </div>

              {/* Terminal Pill */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 border-e border-[var(--border-main)]/50">
                <div className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20">
                  <MdComputer size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-none mb-0.5">Terminal</span>
                  <span className="text-[10px] text-[var(--text-main)] font-black leading-none">{selectedPOSPoint.name}</span>
                </div>
                <motion.button
                  whileHover={{ rotate: 180 }}
                  onClick={handleChangeTerminal}
                  className="ms-1 p-1 hover:bg-[var(--bg-card-alt)] rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                  title="Change Terminal"
                >
                  <MdSwapHoriz size={16} />
                </motion.button>
              </div>

              {/* Clock Pill (Integrated) */}
              <div className="flex items-center gap-3 px-4 py-1.5 min-w-[120px]">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black text-[var(--text-main)] tracking-tight leading-none mb-0.5">
                    {currentTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-[0.15em] leading-none">
                    {currentTime.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse shadow-[0_0_8px_var(--primary)]"></div>
              </div>

              {activeShift && (
                <div className="bg-[var(--primary)]/10 px-3 py-1.5 rounded-xl border-s border-[var(--border-main)]/50">
                  <span className="text-[9px] text-[var(--primary)] font-black tracking-widest uppercase">{activeShift.id.slice(0, 8)}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT SECTION: ACTION HUB */}
      <div className="flex-1 flex items-center gap-3 justify-end">
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
            <span className="absolute top-2 end-2 w-2 h-2 bg-red-500 border-2 border-[var(--bg-card)] rounded-full animate-ping"></span>
            <span className="absolute top-2 end-2 w-2 h-2 bg-red-500 border-2 border-[var(--bg-card)] rounded-full"></span>
          </div>
        </div>

        <div className="w-px h-8 bg-[var(--border-main)] mx-1 hidden sm:block"></div>

        {/* USER PROFILE */}
        <motion.div 
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 cursor-pointer group bg-[var(--bg-main)]/50 hover:bg-[var(--primary)]/10 p-1 rounded-2xl border border-transparent hover:border-[var(--primary)]/20 transition-all"
        >
          <div className="flex flex-col items-end hidden md:flex ps-2">
            <span className="text-[11px] text-[var(--text-main)] font-black uppercase tracking-tight leading-none mb-0.5">
              {name || "Guest"}
            </span>
            <span className="text-[8px] text-[var(--primary)] font-black uppercase tracking-widest leading-none">
              {role || "Staff"}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--primary)] rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--bg-card-alt)] to-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center relative z-10 overflow-hidden">
               <FaUserCircle className="text-[var(--text-muted)] text-xl group-hover:text-[var(--primary)] transition-colors" />
               <div className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--bg-card)] rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, onClick, title }) => (
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
