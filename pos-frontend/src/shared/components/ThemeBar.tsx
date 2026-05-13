import React from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useThemeStore, Palette, Mode } from '../store/useThemeStore';

// ─── Palette config ────────────────────────────────────────────────────────
const PALETTES: { id: Palette; hex: string; lightHex?: string; label: string }[] = [
  { id: 'gold',  hex: '#f6b100',              label: 'Gold'  },
  { id: 'blue',  hex: '#3b82f6',              label: 'Blue'  },
  { id: 'green', hex: '#10b981',              label: 'Green' },
  { id: 'black', hex: '#ffffff', lightHex: '#111111', label: 'Mono'  },
];

// ─── ThemeBar ──────────────────────────────────────────────────────────────
const ThemeBar: React.FC = () => {
  const { palette, mode, setPalette, setMode } = useThemeStore();
  const isLight = mode === 'light';

  const swatchHex = (p: typeof PALETTES[0]) =>
    p.id === 'black' ? (isLight ? (p.lightHex ?? '#111') : p.hex) : p.hex;

  // foreground for the active-mode pill text/icon
  const pillFg = '#000';

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-main)',
        width: '100%',
        overflow: 'hidden',     // ← prevents any child from leaking outside
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          padding: '6px 20px',
          minHeight: 34,
        }}
      >
        {/* Label */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            color: 'var(--text-dim)',
            whiteSpace: 'nowrap',
          }}
          className="hidden sm:block"
        >
          Appearance
        </span>

        {/* Separator */}
        <div
          className="hidden sm:block"
          style={{ width: 1, height: 12, backgroundColor: 'var(--border-main)', flexShrink: 0 }}
        />

        {/* ── Palette Swatches ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {PALETTES.map((p) => {
            const active = palette === p.id;
            const hex = swatchHex(p);
            const size = active ? 20 : 15;
            return (
              <motion.button
                key={p.id}
                id={`theme-bar-palette-${p.id}`}
                onClick={() => setPalette(p.id)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.85 }}
                title={p.label}
                style={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  backgroundColor: hex,
                  flexShrink: 0,
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                  outline: 'none',
                  boxShadow: active
                    ? `0 0 0 2px var(--bg-card), 0 0 0 3.5px ${hex}`
                    : '0 0 0 1.5px var(--border-main)',
                  transition: 'box-shadow 0.2s, width 0.2s, height 0.2s',
                }}
              />
            );
          })}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 12, backgroundColor: 'var(--border-main)', flexShrink: 0 }} />

        {/* ── Mode Toggle ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '2px',
            borderRadius: 999,
            backgroundColor: 'var(--bg-card-alt)',
            border: '1px solid var(--border-main)',
            flexShrink: 0,
          }}
        >
          {(['dark', 'light'] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <motion.button
                key={m}
                id={`theme-bar-mode-${m}`}
                onClick={() => setMode(m)}
                whileTap={{ scale: 0.88 }}
                title={m === 'dark' ? 'Dark mode' : 'Light mode'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  whiteSpace: 'nowrap',
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  color: active ? pillFg : 'var(--text-dim)',
                  transition: 'background-color 0.25s, color 0.25s',
                }}
              >
                {m === 'dark'
                  ? <FaMoon size={9} />
                  : <FaSun size={9} />
                }
                <span className="hidden sm:block">
                  {m === 'dark' ? 'Dark' : 'Light'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeBar;
