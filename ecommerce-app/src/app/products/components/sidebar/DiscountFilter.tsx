"use client";

import { Percent } from "lucide-react";
import { FilterGroup } from "../shared/FilterGroup";

interface DiscountFilterProps {
  selected: number[];
  onToggle: (discount: number) => void;
}

const discounts = [10, 20, 30, 50];

export function DiscountFilter({ selected, onToggle }: DiscountFilterProps) {
  return (
    <FilterGroup title="Discounts" icon={<Percent className="w-3.5 h-3.5" />}>
      <div className="space-y-1">
        {discounts.map((d) => (
          <label
            key={d}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-[var(--bg-hover)] ${
              selected.includes(d) ? "bg-[var(--primary)]/5" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(d)}
              onChange={() => onToggle(d)}
              className="w-3.5 h-3.5 rounded border-[var(--border-main)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 cursor-pointer accent-[var(--primary)]"
            />
            <span className="flex-1 text-[11px] font-semibold text-[var(--text-muted)]">{d}% or more</span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              -{d}%
            </span>
          </label>
        ))}
      </div>
    </FilterGroup>
  );
}
