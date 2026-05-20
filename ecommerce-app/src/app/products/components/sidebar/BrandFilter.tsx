"use client";

import { useState } from "react";
import { Search, Building2 } from "lucide-react";
import { FilterGroup } from "../shared/FilterGroup";
import type { Brand } from "../../types";

interface BrandFilterProps {
  brands: Brand[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function BrandFilter({ brands, selected, onToggle }: BrandFilterProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : brands;

  return (
    <FilterGroup title="Brands" icon={<Building2 className="w-3.5 h-3.5" />}>
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-dim)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-lg py-1.5 pl-7 pr-2 text-[10px] font-semibold text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--text-dim)]"
          aria-label="Search brands"
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
        {filtered.map((brand) => (
          <label
            key={brand.id}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-[var(--bg-hover)] ${
              selected.includes(brand.id) ? "bg-[var(--primary)]/5" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(brand.id)}
              onChange={() => onToggle(brand.id)}
              className="w-3.5 h-3.5 rounded border-[var(--border-main)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 cursor-pointer accent-[var(--primary)]"
            />
            <span className="flex-1 text-[11px] font-semibold text-[var(--text-muted)]">{brand.name}</span>
            <span className="text-[9px] font-bold text-[var(--text-dim)] bg-[var(--bg-card-alt)] px-1.5 py-0.5 rounded-md">
              {brand.productCount}
            </span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="text-[10px] text-[var(--text-dim)] text-center py-3">No brands found</p>
        )}
      </div>
    </FilterGroup>
  );
}
