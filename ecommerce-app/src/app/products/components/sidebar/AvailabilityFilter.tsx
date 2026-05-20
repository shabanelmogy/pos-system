"use client";

import { Package } from "lucide-react";
import { FilterGroup } from "../shared/FilterGroup";
import type { AvailabilityStatus } from "../../types";

interface AvailabilityFilterProps {
  selected: AvailabilityStatus[];
  onToggle: (status: AvailabilityStatus) => void;
}

const options: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "in_stock", label: "In Stock", color: "text-emerald-500" },
  { value: "out_of_stock", label: "Out of Stock", color: "text-red-500" },
  { value: "preorder", label: "Preorder", color: "text-amber-500" },
];

export function AvailabilityFilter({ selected, onToggle }: AvailabilityFilterProps) {
  return (
    <FilterGroup title="Availability" icon={<Package className="w-3.5 h-3.5" />}>
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
            <span className={`w-2 h-2 rounded-full ${opt.color.replace("text-", "bg-")}`} />
            <span className="flex-1 text-[11px] font-semibold text-[var(--text-muted)]">{opt.label}</span>
          </label>
        ))}
      </div>
    </FilterGroup>
  );
}
