"use client";

import { useState, useCallback } from "react";
import { DollarSign } from "lucide-react";
import { FilterGroup } from "../shared/FilterGroup";

interface PriceFilterProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onApply: (min: number, max: number) => void;
}

export function PriceFilter({ min, max, currentMin, currentMax, onApply }: PriceFilterProps) {
  const [localMin, setLocalMin] = useState(currentMin || min);
  const [localMax, setLocalMax] = useState(currentMax || max);

  const handleApply = useCallback(() => {
    onApply(Math.min(localMin, localMax), Math.max(localMin, localMax));
  }, [localMin, localMax, onApply]);

  const handleReset = useCallback(() => {
    setLocalMin(min);
    setLocalMax(max);
    onApply(0, 0);
  }, [min, max, onApply]);

  const minPercent = ((localMin - min) / (max - min || 1)) * 100;
  const maxPercent = ((localMax - min) / (max - min || 1)) * 100;

  return (
    <FilterGroup title="Price Range" icon={<DollarSign className="w-3.5 h-3.5" />}>
      <div className="px-1 space-y-3">
        {/* Range slider */}
        <div className="relative h-6">
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--bg-card-alt)] rounded-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-[var(--primary)] rounded-full"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={localMin}
            onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax))}
            className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--bg-card)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--primary)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--bg-card)] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={localMax}
            onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin))}
            className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--bg-card)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--primary)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--bg-card)] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            aria-label="Maximum price"
          />
        </div>

        {/* Input fields */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-dim)]">$</span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(Number(e.target.value))}
              className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-lg py-1.5 pl-5 pr-2 text-[11px] font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              min={min}
              max={max}
              aria-label="Minimum price"
            />
          </div>
          <span className="text-[10px] font-bold text-[var(--text-dim)]">—</span>
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-dim)]">$</span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => setLocalMax(Number(e.target.value))}
              className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-lg py-1.5 pl-5 pr-2 text-[11px] font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              min={min}
              max={max}
              aria-label="Maximum price"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-fg)] text-[9px] font-black uppercase tracking-wider hover:bg-[var(--primary-hover)] transition-all cursor-pointer active:scale-95"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg border border-[var(--border-main)] text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </FilterGroup>
  );
}
