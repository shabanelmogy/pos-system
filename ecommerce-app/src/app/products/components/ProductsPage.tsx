"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { ProductsToolbar } from "./toolbar/ProductsToolbar";
import { ProductCard } from "./products/ProductCard";
import { Pagination } from "./products/Pagination";
import { CategoryFilter } from "./sidebar/CategoryFilter";
import { PriceFilter } from "./sidebar/PriceFilter";
import { BrandFilter } from "./sidebar/BrandFilter";
import { RatingFilter } from "./sidebar/RatingFilter";
import { AvailabilityFilter } from "./sidebar/AvailabilityFilter";
import { DiscountFilter } from "./sidebar/DiscountFilter";
import { ShippingFilter } from "./sidebar/ShippingFilter";

export function ProductsPage() {
  const {
    products,
    categories,
    brands,
    pagination,
    filters,
    sort,
    viewMode,
    loading,
    setSort,
    setViewMode,
    setPage,
    setSearch,
    toggleCategory,
    toggleBrand,
    toggleAvailability,
    toggleDiscount,
    toggleShipping,
    setPriceRange,
    setRating,
    clearFilters,
    activeFilterCount,
  } = useProducts();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleMobileFilters = useCallback(() => {
    setMobileFiltersOpen((prev) => !prev);
  }, []);

  // Compute price range from all products
  const allPrices = products.length > 0
    ? { min: Math.min(...products.map((p) => p.price)), max: Math.max(...products.map((p) => p.price)) }
    : { min: 0, max: 1000 };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-black text-[var(--text-main)]">Products</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Browse our collection of premium products
          </p>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* ─── Desktop Sidebar ─── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--text-dim)]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-main)]">
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded-md">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter groups */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl overflow-hidden">
                <CategoryFilter
                  categories={categories}
                  selected={filters.categories}
                  onToggle={toggleCategory}
                />
                <PriceFilter
                  min={allPrices.min}
                  max={allPrices.max}
                  currentMin={filters.priceRange.min}
                  currentMax={filters.priceRange.max}
                  onApply={setPriceRange}
                />
                <BrandFilter
                  brands={brands}
                  selected={filters.brands}
                  onToggle={toggleBrand}
                />
                <RatingFilter
                  current={filters.rating}
                  onChange={setRating}
                />
                <AvailabilityFilter
                  selected={filters.availability}
                  onToggle={toggleAvailability}
                />
                <DiscountFilter
                  selected={filters.discounts}
                  onToggle={toggleDiscount}
                />
                <ShippingFilter
                  selected={filters.shipping}
                  onToggle={toggleShipping}
                />
              </div>
            </div>
          </aside>

          {/* ─── Mobile Filter Overlay ─── */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[var(--bg-main)] z-50 lg:hidden overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[var(--text-dim)]" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Filters</span>
                        {activeFilterCount > 0 && (
                          <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded-md">
                            {activeFilterCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                          <button
                            onClick={clearFilters}
                            className="text-[10px] font-bold text-[var(--text-dim)] hover:text-[var(--primary)] cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          onClick={() => setMobileFiltersOpen(false)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl overflow-hidden">
                      <CategoryFilter categories={categories} selected={filters.categories} onToggle={toggleCategory} />
                      <PriceFilter min={allPrices.min} max={allPrices.max} currentMin={filters.priceRange.min} currentMax={filters.priceRange.max} onApply={setPriceRange} />
                      <BrandFilter brands={brands} selected={filters.brands} onToggle={toggleBrand} />
                      <RatingFilter current={filters.rating} onChange={setRating} />
                      <AvailabilityFilter selected={filters.availability} onToggle={toggleAvailability} />
                      <DiscountFilter selected={filters.discounts} onToggle={toggleDiscount} />
                      <ShippingFilter selected={filters.shipping} onToggle={toggleShipping} />
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ─── Main Content ─── */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <ProductsToolbar
              search={filters.search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              pagination={pagination}
              activeFilterCount={activeFilterCount}
              onToggleMobileFilters={toggleMobileFilters}
            />

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {filters.categories.map((catId) => {
                  const cat = categories.find((c) => c.id === catId);
                  return cat ? (
                    <FilterChip key={`cat-${catId}`} label={cat.name.en} onRemove={() => toggleCategory(catId)} />
                  ) : null;
                })}
                {filters.brands.map((brandId) => {
                  const brand = brands.find((b) => b.id === brandId);
                  return brand ? (
                    <FilterChip key={`brand-${brandId}`} label={brand.name} onRemove={() => toggleBrand(brandId)} />
                  ) : null;
                })}
                {(filters.priceRange.min > 0 || filters.priceRange.max > 0) && (
                  <FilterChip
                    label={`$${filters.priceRange.min} - $${filters.priceRange.max}`}
                    onRemove={() => setPriceRange(0, 0)}
                  />
                )}
                {filters.rating && (
                  <FilterChip label={`${filters.rating}+ Stars`} onRemove={() => setRating(null)} />
                )}
                {filters.availability.map((a) => (
                  <FilterChip key={`avail-${a}`} label={a.replace("_", " ")} onRemove={() => toggleAvailability(a)} />
                ))}
                {filters.discounts.map((d) => (
                  <FilterChip key={`disc-${d}`} label={`${d}%+ off`} onRemove={() => toggleDiscount(d)} />
                ))}
                {filters.shipping.map((s) => (
                  <FilterChip key={`ship-${s}`} label={s.replace("_", " ")} onRemove={() => toggleShipping(s)} />
                ))}
              </div>
            )}

            {/* Products grid/list */}
            <div className="mt-4">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-card-alt)] flex items-center justify-center">
                    <SlidersHorizontal className="w-6 h-6 text-[var(--text-dim)]" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">No products found</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-fg)] text-[11px] font-black uppercase tracking-wider hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "flex flex-col gap-3"
                  }
                >
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={setPage} />
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold">
      {label}
      <button onClick={onRemove} className="hover:bg-[var(--primary)]/20 rounded-sm cursor-pointer" aria-label={`Remove ${label} filter`}>
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] overflow-hidden animate-pulse">
      <div className="aspect-square bg-[var(--bg-card-alt)]" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 w-16 bg-[var(--bg-card-alt)] rounded" />
        <div className="h-4 w-full bg-[var(--bg-card-alt)] rounded" />
        <div className="h-3 w-24 bg-[var(--bg-card-alt)] rounded" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 w-16 bg-[var(--bg-card-alt)] rounded" />
          <div className="h-9 w-9 bg-[var(--bg-card-alt)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
