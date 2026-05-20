"use client";

import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import type { SortOption, ViewMode, PaginationInfo } from "../../types";

interface ProductsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  pagination: PaginationInfo;
  activeFilterCount: number;
  onToggleMobileFilters: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "best_selling", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "highest_rated", label: "Highest Rated" },
];

export function ProductsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  pagination,
  activeFilterCount,
  onToggleMobileFilters,
}: ProductsToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label || "Featured";

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl py-3 pl-10 pr-10 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--text-dim)]"
          aria-label="Search products"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toolbar row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile filter toggle + results count */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileFilters}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[11px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--primary-fg)] text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <p className="text-[11px] text-[var(--text-dim)] font-semibold hidden sm:block">
            <span className="text-[var(--text-main)] font-bold">{pagination.totalItems}</span> products found
          </p>
        </div>

        {/* Right: Sort + View toggle */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[11px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
            >
              <span className="hidden sm:inline">Sort by:</span>
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[11px] font-semibold transition-all cursor-pointer ${
                        sort === option.value
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl overflow-hidden">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                  : "text-[var(--text-dim)] hover:text-[var(--text-main)]"
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                  : "text-[var(--text-dim)] hover:text-[var(--text-main)]"
              }`}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
