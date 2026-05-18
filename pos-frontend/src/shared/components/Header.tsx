import React, { useState, useEffect } from "react";
import { FaUserCircle, FaBell } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../features/auth/api/authApi";
import useUserStore from "../../features/auth/store/useUserStore";
import usePOSStore from "../../features/pos/store/usePOSStore";
import { useNavigate } from "react-router-dom";
import { MdDashboard, MdStore, MdComputer, MdSwapHoriz, MdStop, MdSettings } from "react-icons/md";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import useAuth from "../../features/auth/hooks/useAuth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";
import useLocalize from "../../hooks/useLocalize";

/** Tailwind default `theme.screens` (px) — keep in sync with tailwind.config if you customize breakpoints */
const TW_SCREENS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 } as const;

function tailwindBreakpointLabel(width: number): string {
  if (width >= TW_SCREENS["2xl"]) return "2xl";
  if (width >= TW_SCREENS.xl) return "xl";
  if (width >= TW_SCREENS.lg) return "lg";
  if (width >= TW_SCREENS.md) return "md";
  if (width >= TW_SCREENS.sm) return "sm";
  return "base";
}

/** Dev-only: live viewport + Tailwind `md` / `xl` flags (matches default `theme.screens`). */
const ViewportDebugBanner: React.FC = () => {
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 0,
    h: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const update = () =>
      setViewport({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, []);

  const bp = tailwindBreakpointLabel(viewport.w);
  const mdUp = viewport.w >= TW_SCREENS.md;
  const xlUp = viewport.w >= TW_SCREENS.xl;

  return (
    <div
      className="pointer-events-auto flex min-w-0 max-w-[9rem] shrink-0 select-all flex-col gap-px rounded-xl border border-amber-600/70 bg-amber-300/95 px-1.5 py-1 font-mono text-amber-950 shadow ring-1 ring-amber-500/40 2xl:max-w-[14rem] 2xl:gap-1 2xl:rounded-2xl 2xl:px-3 2xl:py-2 2xl:shadow-md"
      title="Dev-only viewport / Tailwind breakpoints (updates on resize)"
      role="status"
      aria-live="polite"
    >
      <span className="text-[8px] font-black uppercase tracking-widest text-amber-900/90 2xl:text-[10px]">Debug</span>
      <span className="text-[10px] font-black tabular-nums leading-none 2xl:text-sm">
        {viewport.w}×{viewport.h}
      </span>
      <span className="text-[9px] font-bold leading-tight text-amber-900 2xl:text-xs">
        <span className="text-amber-950">{bp}</span>
        <span className="text-amber-700"> · </span>
        <span className={mdUp ? "text-green-800" : "text-red-800"}>md{mdUp ? "✓" : "✗"}</span>
        <span className="text-amber-700"> </span>
        <span className={xlUp ? "text-green-800" : "text-red-800"}>xl{xlUp ? "✓" : "✗"}</span>
      </span>
    </div>
  );
};

const Header: React.FC = () => {
  const { role, name, canAccessDashboard, isAdmin } = useAuth();
  const { removeUser } = useUserStore();
  const { selectedBranch, selectedPOSPoint, activeShift, clearPOS, setShowShiftModal } = usePOSStore();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { localize } = useLocalize();
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
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 px-2 py-1 shadow-2xl shadow-black/5 backdrop-blur-xl transition-all duration-300 2xl:px-8 2xl:py-2.5">
      {/* LEFT SECTION: LOGO & STATUS */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2 2xl:gap-6">
        <motion.div 
          onClick={() => navigate("/")} 
          className="group flex cursor-pointer items-center gap-2 2xl:gap-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="rounded-2xl bg-gradient-to-br from-[var(--primary)] to-orange-600 p-1.5 shadow-lg shadow-[var(--primary)]/30 transition-all group-hover:rotate-6 2xl:rounded-[1.35rem] 2xl:p-2">
            <img src={logo} className="h-4 w-4 brightness-0 invert 2xl:h-5 2xl:w-5" alt="restro logo" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black uppercase leading-none tracking-tighter text-[var(--text-main)] 2xl:text-lg">
              Restro<span className="text-[var(--primary)]">POS</span>
            </h1>
            <div className="mt-0.5 flex items-center gap-1 2xl:mt-1 2xl:gap-1.5">
              <div className={`h-1 w-1 rounded-full 2xl:h-1.5 2xl:w-1.5 ${isOnline ? 'animate-pulse bg-green-500' : 'bg-red-500'}`} />
              <span className="text-[7px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] 2xl:text-[8px] 2xl:tracking-[0.2em]">
                {isOnline ? 'System Online' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </motion.div>

        {import.meta.env.DEV && <ViewportDebugBanner />}
      </div>

      {/* CENTER SECTION: STATUS BOARD */}
      <div className="hidden items-center xl:flex">
        <AnimatePresence mode="wait">
          {selectedBranch && selectedPOSPoint && (
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)]/50 p-0.5 shadow-inner 2xl:rounded-2xl 2xl:p-1"
            >
              {/* Branch Pill */}
              <div className="flex items-center gap-1.5 border-e border-[var(--border-main)]/50 px-2 py-1 2xl:gap-2.5 2xl:px-3 2xl:py-1.5">
                <div className="rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/10 p-1 text-[var(--primary)] 2xl:rounded-xl 2xl:p-1.5">
                  <MdStore className="size-3 2xl:size-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="mb-px text-[6px] font-black uppercase leading-none tracking-widest text-[var(--text-muted)] 2xl:mb-0.5 2xl:text-[7px]">Location</span>
                  <span className="text-[9px] font-black leading-none text-[var(--text-main)] 2xl:text-[10px]">{localize(selectedBranch.name)}</span>
                </div>
              </div>

              {/* Terminal Pill */}
              <div className="flex items-center gap-1.5 border-e border-[var(--border-main)]/50 px-2 py-1 2xl:gap-2.5 2xl:px-3 2xl:py-1.5">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1 text-blue-500 2xl:rounded-xl 2xl:p-1.5">
                  <MdComputer className="size-3 2xl:size-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="mb-px text-[6px] font-black uppercase leading-none tracking-widest text-[var(--text-muted)] 2xl:mb-0.5 2xl:text-[7px]">Terminal</span>
                  <span className="text-[9px] font-black leading-none text-[var(--text-main)] 2xl:text-[10px]">{localize(selectedPOSPoint.name)}</span>
                </div>
                <motion.button
                  whileHover={{ rotate: 180 }}
                  onClick={handleChangeTerminal}
                  className="ms-0.5 rounded-lg p-0.5 text-[var(--text-muted)] transition-all hover:bg-[var(--bg-card-alt)] hover:text-[var(--primary)] 2xl:ms-1 2xl:p-1 2xl:rounded-xl"
                  title="Change Terminal"
                >
                  <MdSwapHoriz className="size-3.5 2xl:size-4" />
                </motion.button>
              </div>

              {/* Clock Pill (Integrated) */}
              <div className="flex min-w-[100px] items-center gap-2 px-2 py-1 2xl:min-w-[120px] 2xl:gap-3 2xl:px-4 2xl:py-1.5">
                <div className="flex flex-col items-end">
                  <span className="mb-px text-[10px] font-black leading-none tracking-tight text-[var(--text-main)] 2xl:mb-0.5 2xl:text-[11px]">
                    {currentTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[6px] font-black uppercase leading-none tracking-[0.12em] text-[var(--text-muted)] 2xl:text-[7px] 2xl:tracking-[0.15em]">
                    {currentTime.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="h-1 w-1 animate-pulse rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--primary)] 2xl:h-1.5 2xl:w-1.5 2xl:shadow-[0_0_8px_var(--primary)]" />
              </div>

              {activeShift && (
                <div className="rounded-xl border-s border-[var(--border-main)]/50 bg-[var(--primary)]/10 px-2 py-1 2xl:rounded-2xl 2xl:px-3 2xl:py-1.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[var(--primary)] 2xl:text-[9px]">{activeShift.id.slice(0, 8)}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT SECTION: ACTION HUB */}
      <div className="flex flex-1 items-center justify-end gap-1.5 2xl:gap-3">
        {activeShift && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShiftModal(true)}
            className="group flex shrink-0 items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-2 py-1 text-red-500 transition-all hover:bg-red-500 hover:text-white 2xl:gap-2 2xl:rounded-2xl 2xl:px-4 2xl:py-2"
          >
            <MdStop className="size-3.5 group-hover:animate-pulse 2xl:size-4" />
            <span className="hidden text-[8px] font-black uppercase tracking-[0.08em] sm:block 2xl:text-[9px] 2xl:tracking-[0.1em]">Close Shift</span>
          </motion.button>
        )}

        <div className="flex items-center gap-0.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)]/50 p-0.5 2xl:gap-1 2xl:rounded-2xl 2xl:p-1">
          <ThemeSwitcher />

          <LanguageSwitcher />

          {canAccessDashboard && (
            <IconButton onClick={() => navigate("/dashboard")} title="Analytics">
              <MdDashboard className="size-4 2xl:size-[18px]" />
            </IconButton>
          )}
          
          {isAdmin && (
            <IconButton onClick={() => navigate("/settings")} title="System Settings">
              <MdSettings className="size-4 2xl:size-[18px]" />
            </IconButton>
          )}

          <div className="group relative">
            <IconButton title="Notifications">
              <FaBell className="size-3.5 2xl:size-4" />
            </IconButton>
            <span className="absolute end-1.5 top-1.5 h-1.5 w-1.5 animate-ping rounded-full border-2 border-[var(--bg-card)] bg-red-500 2xl:end-2 2xl:top-2 2xl:h-2 2xl:w-2" />
            <span className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full border-2 border-[var(--bg-card)] bg-red-500 2xl:end-2 2xl:top-2 2xl:h-2 2xl:w-2" />
          </div>
        </div>

        <div className="mx-0.5 hidden h-6 w-px bg-[var(--border-main)] sm:block 2xl:mx-1 2xl:h-8" />

        {/* USER PROFILE */}
        <motion.div 
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          className="group flex cursor-pointer items-center gap-1.5 rounded-xl border border-transparent bg-[var(--bg-main)]/50 p-0.5 transition-all hover:border-[var(--primary)]/20 hover:bg-[var(--primary)]/10 2xl:gap-3 2xl:rounded-2xl 2xl:p-1"
        >
          <div className="hidden flex-col items-end ps-1 md:flex 2xl:ps-2">
            <span className="mb-px text-[10px] font-black uppercase leading-none tracking-tight text-[var(--text-main)] 2xl:mb-0.5 2xl:text-[11px]">
              {name || "Guest"}
            </span>
            <span className="text-[7px] font-black uppercase leading-none tracking-widest text-[var(--primary)] 2xl:text-[8px]">
              {role || "Staff"}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-0 blur-md transition-opacity group-hover:opacity-40" />
            <div className="relative z-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-main)] bg-gradient-to-br from-[var(--bg-card-alt)] to-[var(--bg-main)] 2xl:h-9 2xl:w-9 2xl:rounded-2xl">
               <FaUserCircle className="text-lg text-[var(--text-muted)] transition-colors group-hover:text-[var(--primary)] 2xl:text-xl" />
               <div className="absolute bottom-0 end-0 h-2 w-2 rounded-full border-2 border-[var(--bg-card)] bg-green-500 2xl:h-2.5 2xl:w-2.5" />
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
    whileHover={{ scale: 1.08, backgroundColor: 'var(--bg-card-alt)' }}
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    title={title}
    className="rounded-xl p-1.5 text-[var(--text-muted)] transition-all hover:text-[var(--primary)] 2xl:rounded-2xl 2xl:p-2.5"
  >
    {children}
  </motion.button>
);

export default Header;
