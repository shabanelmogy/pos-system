import React, { useEffect, useState } from "react";
import restaurant from "../../../assets/images/restaurant-img.jpg";
import logo from "../../../assets/images/logo.png";
import Register from "../components/Register";
import Login from "../components/Login";
import { motion, AnimatePresence } from "framer-motion";
import useThemeStore from "../../../shared/store/useThemeStore";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Auth: React.FC = () => {
  const { mode, toggleTheme } = useThemeStore();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "RestroPOS | Enterprise Secure Login";
  }, []);

  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-main)] overflow-hidden">
      {/* Visual Experience Section */}
      <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img className="w-full h-full object-cover grayscale-[0.3]" src={restaurant} alt="Experience" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </motion.div>

        <div className="relative z-10 ps-20 max-w-3xl">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[var(--primary)] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
              {t('auth.enterprise_v')}
            </div>
            <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-6">
              {t('auth.precision_performance')}
            </h1>
            <p className="text-[var(--text-muted)] text-lg font-medium max-w-lg leading-relaxed">
              The world's most intuitive point of sale architecture, designed for high-volume enterprise environments.
              Manage multiple branches, terminals, and your workforce from a single secure gateway.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 flex items-center gap-8"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-[var(--bg-card-alt)] flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-[var(--border-main)]" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest leading-tight">
              {t('auth.trust_text')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-20 start-20 w-40 h-1 bg-[var(--primary)]"></div>
      </div>

      {/* Authentication Section */}
      <div className="w-full lg:w-2/5 min-h-screen flex flex-col justify-center px-8 md:px-20 relative bg-[var(--bg-main)]">
        {/* Theme Toggle */}
        <button
          onClick={() => toggleTheme()}
          className="absolute top-10 end-8 md:end-20 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)] rounded-xl p-3 cursor-pointer transition-all shadow-sm flex items-center justify-center w-11 h-11 z-10"
          title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {mode === 'dark' ? <FaSun size={18} className="text-[var(--primary)]" /> : <FaMoon size={18} className="text-blue-500" />}
        </button>

        <div className="absolute top-12 start-8 md:start-20 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--primary)] p-2 rounded-xl"
          >
            <img src={logo} alt="Logo" className="h-6 w-6 brightness-0" />
          </motion.div>
          <span className="text-[var(--text-main)] font-black uppercase tracking-tighter text-xl">Restro<span className="text-[var(--primary)]">POS</span></span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? "register" : "login"}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-10">
                <h2 className="text-4xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-2">
                  {isRegister ? t('auth.register_title') : t('auth.login_title')}
                </h2>
                <p className="text-[var(--text-dim)] font-bold uppercase tracking-widest text-[10px]">
                  {isRegister ? t('auth.register_subtitle') : t('auth.login_subtitle')}
                </p>
              </div>

              {isRegister ? <Register setIsRegister={setIsRegister} /> : <Login />}

              <div className="mt-10 flex flex-col items-center gap-6">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-main)] to-transparent"></div>
                <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                  {isRegister ? t('auth.have_account') : t('auth.no_account')}
                  <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="ms-2 text-[var(--primary)] hover:text-[var(--text-main)] transition-colors underline underline-offset-4"
                  >
                    {isRegister ? t('auth.sign_in_instead') : t('auth.request_access')}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-10 inset-x-0 text-center">
          <p className="text-[9px] text-[var(--border-main)] font-black uppercase tracking-[0.4em]">
            &copy; 2026 RestroPOS Enterprise Logic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
