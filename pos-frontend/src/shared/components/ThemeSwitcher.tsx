import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPalette, FaSun, FaMoon, FaCheck } from 'react-icons/fa';
import { useThemeStore, Palette, Mode } from '../store/useThemeStore';
import { useState } from 'react';

// ---- Palette definitions ----
const PALETTES: { id: Palette; label: string; color: string; darkColor?: string }[] = [
  { id: 'gold',  label: 'Gold',  color: '#f6b100' },
  { id: 'blue',  label: 'Blue',  color: '#3b82f6' },
  { id: 'green', label: 'Green', color: '#10b981' },
  { id: 'black', label: 'Mono',  color: '#ffffff', darkColor: '#111111' },
];

// ---- ThemeSwitcher ----
const ThemeSwitcher: React.FC = () => {
  const { palette, mode, setPalette, setMode } = useThemeStore();
  const [open, setOpen] = useState(false);

  const isLight = mode === 'light';

  const swatchColor = (p: typeof PALETTES[0]) =>
    p.id === 'black' ? (isLight ? (p.darkColor ?? '#111') : p.color) : p.color;

  const currentSwatch = swatchColor(PALETTES.find(p => p.id === palette)!);

  return (
    <>
      {/* Trigger */}
      <button
        id="theme-switcher-trigger"
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-card-alt)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--primary)] transition-all group"
        title="Appearance"
      >
        {/* live palette dot */}
        <span
          className="w-3 h-3 rounded-full shadow-sm ring-2 ring-[var(--border-main)] group-hover:ring-[var(--primary)] transition-all"
          style={{ backgroundColor: currentSwatch }}
        />
        <FaPalette size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">Appearance</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative z-10 w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[var(--border-main)] flex items-center gap-3 bg-gradient-to-r from-[var(--primary)]/10 to-transparent">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${currentSwatch}22` }}
                >
                  <FaPalette style={{ color: currentSwatch }} />
                </div>
                <div>
                  <h2 className="text-[var(--text-main)] text-sm font-black uppercase tracking-widest leading-none">
                    Appearance
                  </h2>
                  <p className="text-[var(--text-dim)] text-[9px] font-bold uppercase tracking-widest mt-0.5">
                    Palette & visual mode
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* — Visual Mode — */}
                <section>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] mb-3 block">
                    Visual Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['dark', 'light'] as Mode[]).map((m) => {
                      const active = mode === m;
                      return (
                        <button
                          key={m}
                          id={`mode-${m}`}
                          onClick={() => setMode(m)}
                          className={`flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 transition-all ${
                            active
                              ? 'border-[var(--primary)] text-[var(--primary)]'
                              : 'border-[var(--border-main)] bg-[var(--bg-card-alt)] text-[var(--text-muted)] hover:border-[var(--text-dim)]'
                          }`}
                          style={active ? { backgroundColor: `${currentSwatch}12` } : {}}
                        >
                          {m === 'dark' ? <FaMoon size={20} /> : <FaSun size={20} />}
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {m === 'dark' ? 'Dark Night' : 'Light Day'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* — Color Palette — */}
                <section>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] mb-3 block">
                    Color Palette
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {PALETTES.map((p) => {
                      const active = palette === p.id;
                      const swatch = swatchColor(p);
                      return (
                        <button
                          key={p.id}
                          id={`palette-${p.id}`}
                          onClick={() => setPalette(p.id)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${
                            active
                              ? 'border-[var(--primary)] bg-[var(--bg-card-alt)] shadow-md'
                              : 'border-[var(--border-main)] bg-[var(--bg-card-alt)] hover:border-[var(--text-dim)]'
                          }`}
                        >
                          {/* Swatch */}
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shadow-inner flex-shrink-0"
                            style={{ backgroundColor: swatch }}
                          >
                            {active && (
                              <FaCheck size={9} style={{ color: p.id === 'gold' ? '#000' : '#000' }} />
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              active ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                            }`}
                          >
                            {p.label}
                          </span>
                          {active && (
                            <span className="ms-auto text-[8px] font-black uppercase text-[var(--primary)] tracking-widest">
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
              <div className="px-6 py-4 bg-[var(--bg-card-alt)] border-t border-[var(--border-main)] flex items-center justify-between">
                <p className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest">
                  Saved to this terminal
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:opacity-70 transition-opacity"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeSwitcher;
