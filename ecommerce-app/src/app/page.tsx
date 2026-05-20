"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Sparkles,
  User,
  Shield,
  LogOut,
  ArrowRight,
  TrendingUp,
  Store,
  Layers,
  Zap,
  CheckCircle,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)]">
        <div className="w-12 h-12 border-4 border-[var(--border-main)] border-t-[var(--primary)] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold tracking-widest text-[var(--text-dim)] uppercase">
          Verifying Identity...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden relative select-none font-sans">
      {/* Decorative Blur Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[var(--primary-light)] rounded-full filter blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[var(--primary-light)] rounded-full filter blur-[130px] animate-pulse opacity-50"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sleek Glassmorphism Header */}
        <header className="border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5 rounded-xl shadow-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-wider uppercase">
                Nexus<span className="text-amber-400">ECommerce</span>
              </span>
            </div>

            {/* Navigation / User Session Action */}
            <div className="flex items-center gap-3">
              {/* Always show ThemeSwitcher */}
              <ThemeSwitcher />

              {user ? (
                <div className="flex items-center gap-3">
                  {/* Active user state tag */}
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-extrabold text-[var(--text-main)]">{user.name}</span>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-bold">
                      {user.role || "ECommerce User"}
                    </span>
                  </div>

                  {/* Profile Symbol */}
                  <div className="bg-[var(--bg-card-alt)] border border-[var(--border-main)] p-2.5 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--primary)]" />
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 bg-[var(--status-error-bg)] border border-[var(--status-error)]/30 hover:bg-[var(--status-error)] hover:text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider text-[var(--status-error)] transition-all cursor-pointer active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Log Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/auth")}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Body Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col justify-center">
          {user ? (
            // Authenticated Dashboard Experience
            <div className="space-y-12 animate-fadeIn">
              {/* Profile Card Header */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary-light)] rounded-full filter blur-3xl"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-[var(--primary-light)] border border-[var(--primary)]/20 text-[var(--primary)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Zap className="w-3 h-3" /> Authorized POS Session Active
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text-main)] uppercase">
                      Welcome, {user.name}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] font-semibold max-w-xl">
                      Successfully signed in as <span className="text-[var(--text-main)]">{user.email}</span>. Your session is securely synchronized with the central Neon Postgres DB database cluster.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl p-4">
                    <div className="bg-[var(--status-success-bg)] border border-[var(--status-success)]/30 p-3 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-[var(--status-success)]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">Database</p>
                      <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Neon DB Connected</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Dashboard Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "POS Terminal Engine",
                    desc: "Direct access to table reservations, cashier drawer shifts, and kitchen orders dispatcher modules.",
                    icon: <Store className="w-6 h-6 text-[var(--primary)]" />,
                    tag: "POS ACTIVE",
                  },
                  {
                    title: "Unified Catalog",
                    desc: "Synchronized categories, menu items, modifier settings, and inventory analytics in real-time.",
                    icon: <Layers className="w-6 h-6 text-[var(--status-warning)]" />,
                    tag: "DB MAPPED",
                  },
                  {
                    title: "Live Operations",
                    desc: "Analytical monitoring including sales revenue records, loyalty logs, and transaction status.",
                    icon: <TrendingUp className="w-6 h-6 text-[var(--status-success)]" />,
                    tag: "SYNC OK",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/30 rounded-3xl p-6 transition-all shadow-xl group hover:translate-y-[-4px]"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-[var(--bg-card-alt)] border border-[var(--border-main)] p-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <span className="text-[9px] uppercase font-black tracking-widest bg-[var(--primary-light)] px-2.5 py-1 rounded-md text-[var(--primary)]">
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-wider mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[var(--text-muted)] font-semibold">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Guest Introduction Screen
            <div className="text-center max-w-3xl mx-auto space-y-8 animate-fadeIn">
              <div className="inline-flex items-center gap-2 bg-[var(--primary-light)] border border-[var(--primary)]/20 text-[var(--primary)] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Presenting Nexus v2.0 Platform
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] text-[var(--text-main)] uppercase">
                  UNIFIED RETAIL & <span className="text-[var(--primary)]">DINING ECOSYSTEM</span>
                </h1>
                <p className="text-base text-[var(--text-muted)] font-semibold max-w-xl mx-auto leading-relaxed">
                  High-speed, scalable e-commerce infrastructure fully synchronized with cash terminals, kitchen station screens, and restaurant analytics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] font-black py-4 px-8 rounded-2xl shadow-lg transition-all cursor-pointer uppercase tracking-widest text-xs flex items-center justify-center gap-2 group active:scale-95"
                >
                  <span>Access Platform</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full sm:w-auto bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/40 hover:bg-[var(--bg-hover)] text-[var(--text-main)] font-black py-4 px-8 rounded-2xl transition-all cursor-pointer uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95"
                >
                  <Shield className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Developer Sandbox</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[var(--border-main)] bg-[var(--bg-card)]/50 py-8 text-center">
          <p className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-[0.4em]">
            © 2026 NEXUS SYSTEMS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  );
}
