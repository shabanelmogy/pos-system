"use client";

import { Star } from "lucide-react";
import { FilterGroup } from "../shared/FilterGroup";

interface RatingFilterProps {
  current: number | null;
  onChange: (rating: number | null) => void;
}

const ratings = [
  { value: 5, label: "5 Stars" },
  { value: 4, label: "4 Stars & Up" },
  { value: 3, label: "3 Stars & Up" },
];

export function RatingFilter({ current, onChange }: RatingFilterProps) {
  return (
    <FilterGroup title="Rating" icon={<Star className="w-3.5 h-3.5" />}>
      <div className="space-y-1">
        {ratings.map((r) => (
          <button
            key={r.value}
            onClick={() => onChange(current === r.value ? null : r.value)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
              current === r.value
                ? "bg-[var(--primary)]/5 text-[var(--primary)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < r.value
                      ? "fill-amber-400 text-amber-400"
                      : "text-[var(--border-main)]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold">{r.label}</span>
          </button>
        ))}
      </div>
    </FilterGroup>
  );
}
