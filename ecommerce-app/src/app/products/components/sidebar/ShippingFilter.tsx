"use client";

import { Truck } from "lucide-react";
import { FilterGroup } from "../shared/FilterGroup";

interface ShippingFilterProps {
  selected: string[];
  onToggle: (option: string) => void;
}

const options = [
  { value: "free", label: "Free Shipping", icon: "🚚" },
  { value: "fast", label: "Fast Delivery", icon: "⚡" },
  { value: "same_day", label: "Same Day Delivery", icon: "📦" },
];

export function ShippingFilter({ selected, onToggle }: ShippingFilterProps) {
  return (
    <FilterGroup title="Shipping" icon={<Truck className="w-3.5 h-3.5" />}>
      <div className="space-y-1">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-[var(--bg-hover)] ${
              selected.includes(opt.value) ? "bg-[var(--primary)]/5" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="w-3.5 h-3.5 rounded border-[var(--border-main)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 cursor-pointer accent-[var(--primary)]"
            />
            <span className="text-xs">{opt.icon}</span>
            <span className="flex-1 text-[11px] font-semibold text-[var(--text-muted)]">{opt.label}</span>
          </label>
        ))}
      </div>
    </FilterGroup>
  );
}
