"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Palette as PaletteIcon, Sun, Moon, Check, X } from "lucide-react";
import { useTheme, Palette, Mode } from "@/context/ThemeContext";

const PANEL_WIDTH = 340;
const PANEL_GAP = 8;

const PALETTES: { id: Palette; label: string; hex: string; lightHex?: string }[] = [
  { id: "gold", label: "Gold", hex: "#f6b100" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "green", label: "Green", hex: "#10b981" },
  { id: "black", label: "Mono", hex: "#ffffff", lightHex: "#111111" },
];

export default function ThemeSwitcher() {
  const { palette, mode, setPalette, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  const isLight = mode === "light";

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let left = r.right - PANEL_WIDTH;
    if (left < PANEL_GAP) left = PANEL_GAP;
    if (left + PANEL_WIDTH > window.innerWidth - PANEL_GAP) {
      left = Math.max(PANEL_GAP, window.innerWidth - PANEL_WIDTH - PANEL_GAP);
    }
    setPanelPos({ top: r.bottom + PANEL_GAP, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onReposition = () => updatePanelPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePanelPosition]);

  const swatchHex = (p: typeof PALETTES[0]) =>
    p.id === "black" ? (isLight ? p.lightHex ?? "#111" : p.hex) : p.hex;

  const activeSwatch = swatchHex(PALETTES.find((p) => p.id === palette)!);

  if (!mounted) {
    return (
      <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
        <PaletteIcon className="w-3.5 h-3.5" />
        <span>Appearance</span>
      </button>
    );
  }

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
              zIndex: 9999,
              width: PANEL_WIDTH,
              maxHeight: `calc(100dvh - ${panelPos.top}px - ${PANEL_GAP}px)`,
              overflowY: "auto",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-main)",
              borderRadius: "1.5rem",
              boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 22px 14px",
                borderBottom: "1px solid var(--border-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: `linear-gradient(135deg, ${activeSwatch}14 0%, transparent 60%)`,
                borderRadius: "1.5rem 1.5rem 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${activeSwatch}20`,
                  }}
                >
                  <PaletteIcon style={{ color: activeSwatch, width: 15, height: 15 }} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--text-main)",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    Appearance
                  </p>
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      color: "var(--text-dim)",
                      margin: "3px 0 0",
                    }}
                  >
                    Palette & visual mode
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-dim)",
                  padding: 6,
                  borderRadius: 8,
                  lineHeight: 0,
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Visual Mode */}
              <section>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.28em",
                    color: "var(--text-dim)",
                    marginBottom: 10,
                  }}
                >
                  Visual Mode
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["dark", "light"] as Mode[]).map((m) => {
                    const active = mode === m;
                    return (
                      <button
                        key={m}
                        id={`mode-${m}`}
                        onClick={() => setMode(m)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 7,
                          padding: "16px 10px",
                          borderRadius: 14,
                          border: `2px solid ${active ? "var(--primary)" : "var(--border-main)"}`,
                          backgroundColor: active ? `${activeSwatch}10` : "var(--bg-card-alt)",
                          color: active ? "var(--primary)" : "var(--text-muted)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {m === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                          }}
                        >
                          {m === "dark" ? "Dark Night" : "Light Day"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Color Palette */}
              <section>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.28em",
                    color: "var(--text-dim)",
                    marginBottom: 10,
                  }}
                >
                  Color Palette
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {PALETTES.map((p) => {
                    const active = palette === p.id;
                    const swatch = swatchHex(p);
                    return (
                      <button
                        key={p.id}
                        id={`palette-${p.id}`}
                        onClick={() => setPalette(p.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: `2px solid ${active ? "var(--primary)" : "var(--border-main)"}`,
                          backgroundColor: "var(--bg-card-alt)",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            flexShrink: 0,
                            backgroundColor: swatch,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: active
                              ? `0 0 0 2px var(--bg-card), 0 0 0 3.5px ${swatch}`
                              : "0 0 0 1.5px rgba(0,0,0,0.1)",
                          }}
                        >
                          {active && <Check size={8} style={{ color: "#000" }} />}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: active ? "var(--text-main)" : "var(--text-muted)",
                          }}
                        >
                          {p.label}
                        </span>
                        {active && (
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 8,
                              fontWeight: 900,
                              color: "var(--primary)",
                              textTransform: "uppercase",
                            }}
                          >
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "12px 22px",
                borderTop: "1px solid var(--border-main)",
                backgroundColor: "var(--bg-card-alt)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "0 0 1.5rem 1.5rem",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "var(--text-dim)",
                }}
              >
                Saved to this terminal
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--primary)",
                }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        id="theme-switcher-trigger"
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10 px-3 py-2 text-zinc-400 hover:text-white transition-all cursor-pointer select-none active:scale-[0.98]"
        title="Appearance"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: activeSwatch,
            boxShadow: `0 0 0 2px var(--bg-card), 0 0 0 3px ${activeSwatch}`,
          }}
        />
        <PaletteIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span className="hidden text-[10px] font-black uppercase tracking-widest sm:block">
          Appearance
        </span>
      </button>

      {/* Render via Portal on the body */}
      {ReactDOM.createPortal(modal, document.body)}
    </>
  );
}
