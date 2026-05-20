"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Product, Category, Brand, FilterState, SortOption, PaginationInfo } from "../types";
import { fetchProducts, fetchCategories, fetchBrands } from "../services/product-service";

export interface UseProductsReturn {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  pagination: PaginationInfo;
  filters: FilterState;
  sort: SortOption;
  viewMode: "grid" | "list";
  loading: boolean;
  page: number;
  setFilters: (filters: FilterState) => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  setSort: (sort: SortOption) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  toggleCategory: (id: string) => void;
  toggleBrand: (id: string) => void;
  toggleAvailability: (status: FilterState["availability"][number]) => void;
  toggleDiscount: (discount: number) => void;
  toggleShipping: (option: string) => void;
  setPriceRange: (min: number, max: number) => void;
  setRating: (rating: number | null) => void;
  activeFilterCount: number;
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  brands: [],
  priceRange: { min: 0, max: 0 },
  rating: null,
  availability: [],
  discounts: [],
  shipping: [],
  search: "",
};

const PAGE_SIZE = 12;

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load categories and brands once
  useEffect(() => {
    async function loadMeta() {
      const [cats, brds] = await Promise.all([fetchCategories(), fetchBrands()]);
      setCategories(cats);
      setBrands(brds);
    }
    loadMeta();
  }, []);

  // Load products when filters/sort/page change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const result = await fetchProducts(filters, sort, page, PAGE_SIZE);
      if (!cancelled) {
        setProducts(result.products);
        setPagination(result.pagination);
        setLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [filters, sort, page]);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPage(1);
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
    setPage(1);
  }, []);

  const toggleBrand = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(id)
        ? prev.brands.filter((b) => b !== id)
        : [...prev.brands, id],
    }));
    setPage(1);
  }, []);

  const toggleAvailability = useCallback((status: FilterState["availability"][number]) => {
    setFilters((prev) => ({
      ...prev,
      availability: prev.availability.includes(status)
        ? prev.availability.filter((a) => a !== status)
        : [...prev.availability, status],
    }));
    setPage(1);
  }, []);

  const toggleDiscount = useCallback((discount: number) => {
    setFilters((prev) => ({
      ...prev,
      discounts: prev.discounts.includes(discount)
        ? prev.discounts.filter((d) => d !== discount)
        : [...prev.discounts, discount],
    }));
    setPage(1);
  }, []);

  const toggleShipping = useCallback((option: string) => {
    setFilters((prev) => ({
      ...prev,
      shipping: prev.shipping.includes(option)
        ? prev.shipping.filter((s) => s !== option)
        : [...prev.shipping, option],
    }));
    setPage(1);
  }, []);

  const setPriceRange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({ ...prev, priceRange: { min, max } }));
    setPage(1);
  }, []);

  const setRating = useCallback((rating: number | null) => {
    setFilters((prev) => ({ ...prev, rating }));
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.priceRange.min > 0 || filters.priceRange.max > 0) count += 1;
    if (filters.rating) count += 1;
    if (filters.availability.length > 0) count += filters.availability.length;
    if (filters.discounts.length > 0) count += filters.discounts.length;
    if (filters.shipping.length > 0) count += filters.shipping.length;
    if (filters.search) count += 1;
    return count;
  }, [filters]);

  return {
    products,
    categories,
    brands,
    pagination,
    filters,
    sort,
    viewMode,
    loading,
    page,
    setFilters,
    updateFilter,
    clearFilters,
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
    activeFilterCount,
  };
}
