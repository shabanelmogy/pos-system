"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Eye,
  EyeOff,
  ShoppingBag,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function AuthPage() {
  const { user, login, register, loading } = useAuth();
  const router = useRouter();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // UI States
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [formLoading, setFormLoading] = useState<boolean>(false);

  // Route security: Redirect if authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password || (isRegister && !name)) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setFormLoading(true);

    try {
      if (isRegister) {
        const res = await register(name, email, password, phone || undefined);
        if (!res.success) {
          setErrorMsg(res.error || "Failed to create account.");
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "Invalid email or password.");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  // Preset demo account login helper
  const handleQuickDemo = async () => {
    setErrorMsg("");
    setFormLoading(true);
    try {
      const res = await login("admin@nexus.com", "Adam@2008");
      if (!res.success) {
        setErrorMsg(res.error || "Demo login failed.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the POS backend.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-[var(--primary)]">
            POS
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold tracking-[0.3em] text-zinc-500 uppercase animate-pulse">
          Synchronizing Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative w-full flex items-center justify-center bg-[var(--bg-main)] overflow-hidden px-4 py-12 font-sans select-none">
      {/* Visual Ambient Atmosphere (Floating Glowing Orbs) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--primary)]/8 rounded-full filter blur-[120px] animate-pulse delay-700"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--bg-main)_80%)]"></div>

      <div className="w-full max-w-[480px] relative z-10">
        {/* Theme Switcher — top right, identical to enterprise-frontend Auth */}
        <div className="absolute -top-10 right-0">
          <ThemeSwitcher />
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl px-4 py-2 mb-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-sm font-extrabold tracking-wider text-[var(--text-main)]">
              Nexus<span className="text-[var(--primary)]">ECommerce</span>
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-dim)] uppercase font-black tracking-[0.3em]">
            Premium Secure Auth Gateway
          </p>
        </div>

        {/* main credentials card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-2xl relative overflow-hidden group">
          {/* subtle glowing corner lines */}
          <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-24 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>

          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-main)] uppercase">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">
              {isRegister
                ? "Join us to manage premium restaurant and shopping systems"
                : "Sign in with your POS credentials to access ecommerce catalog"}
            </p>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="flex items-start gap-3 bg-[var(--status-error-bg)] border border-[var(--status-error)]/20 rounded-2xl p-4 mb-6 text-[var(--status-error)] text-xs font-semibold tracking-wide animate-shake">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[var(--text-dim)] block ms-1">
                  Full Name <span className="text-[var(--primary)]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-[var(--text-dim)]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold placeholder:text-[var(--text-dim)]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-[var(--text-dim)] block ms-1">
                Email Address <span className="text-[var(--primary)]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-zinc-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#0a071d]/60 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-violet-500 transition-all font-bold placeholder:text-zinc-600"
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[var(--text-dim)] block ms-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-[var(--text-dim)]">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold placeholder:text-[var(--text-dim)]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center ms-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-[var(--text-dim)]">
                  Password <span className="text-[var(--primary)]">*</span>
                </label>
                {!isRegister && (
                  <span className="text-[10px] font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] cursor-pointer transition-colors">
                    Forgot Password?
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-[var(--text-dim)]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded-2xl py-4 pl-12 pr-12 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold placeholder:text-[var(--text-dim)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] font-black py-4 rounded-2xl mt-6 flex items-center justify-center gap-2 shadow-[0_12px_24px_-6px_var(--primary)]/50 transition-all cursor-pointer uppercase tracking-widest text-xs disabled:opacity-50 active:scale-[0.98]"
            >
              {formLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegister ? "Register" : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Sandbox/Review */}
          {!isRegister && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10"></div>
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest whitespace-nowrap">
                  Or Sandbox Fast-Access
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10"></div>
              </div>

              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={formLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[var(--bg-card-alt)] border border-[var(--border-main)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-hover)] text-[10px] font-black uppercase tracking-wider text-[var(--primary)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sign In as Admin Demo</span>
              </button>
            </div>
          )}

          {/* Toggles between login and registration forms */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">

            <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
              {isRegister ? "Already have an account?" : "Need a shopping account?"}
              <button
                onClick={() => {
                  setErrorMsg("");
                  setIsRegister(!isRegister);
                }}
                className="ml-2 text-[var(--primary)] hover:text-[var(--text-main)] transition-colors underline underline-offset-4 cursor-pointer"
              >
                {isRegister ? "Sign In Instead" : "Create Account"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em] mt-8">
          © 2026 NEXUS SYSTEMS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
}
