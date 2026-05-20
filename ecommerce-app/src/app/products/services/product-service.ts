import type { Product, Category, Brand, FilterState, SortOption, PaginationInfo } from "../types";
import { mockProducts } from "../mock-data/products";
import { mockCategories } from "../mock-data/categories";
import { mockBrands } from "../mock-data/brands";

// ─── API-Ready Service ───────────────────────────────────
// Replace these with actual API calls when backend is ready

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

export async function fetchProducts(
  filters: FilterState,
  sort: SortOption,
  page: number,
  pageSize: number
): Promise<ProductsResponse> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));

  let result = [...mockProducts];

  // Category filter
  if (filters.categories.length > 0) {
    result = result.filter((p) => filters.categories.includes(p.category.id));
  }

  // Brand filter
  if (filters.brands.length > 0) {
    result = result.filter((p) => filters.brands.includes(p.brand.id));
  }

  // Price range filter
  if (filters.priceRange.min > 0 || filters.priceRange.max > 0) {
    result = result.filter(
      (p) =>
        p.price >= filters.priceRange.min &&
        (filters.priceRange.max === 0 || p.price <= filters.priceRange.max)
    );
  }

  // Rating filter
  if (filters.rating) {
    result = result.filter((p) => p.rating >= filters.rating!);
  }

  // Availability filter
  if (filters.availability.length > 0) {
    result = result.filter((p) => filters.availability.includes(p.status));
  }

  // Discount filter
  if (filters.discounts.length > 0) {
    result = result.filter((p) => {
      if (!p.discount) return false;
      return filters.discounts.some((d) => p.discount! >= d);
    });
  }

  // Shipping filter
  if (filters.shipping.length > 0) {
    result = result.filter((p) => {
      return filters.shipping.every((s) => {
        if (s === "free") return p.shipping.free;
        if (s === "fast") return p.shipping.fast;
        if (s === "same_day") return p.shipping.sameDay;
        return true;
      });
    });
  }

  // Search filter
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.en.toLowerCase().includes(q) ||
        p.name.ar?.toLowerCase().includes(q) ||
        p.description.en.toLowerCase().includes(q) ||
        p.brand.name.toLowerCase().includes(q)
    );
  }

  // Sorting
  switch (sort) {
    case "featured":
      break;
    case "best_selling":
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "newest":
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "highest_rated":
      result.sort((a, b) => b.rating - a.rating);
      break;
  }

  // Pagination
  const totalItems = result.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;
  const paginated = result.slice(start, start + pageSize);

  return {
    products: paginated,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

export async function fetchCategories(): Promise<Category[]> {
  await new Promise((r) => setTimeout(r, 100));
  return mockCategories;
}

export async function fetchBrands(): Promise<Brand[]> {
  await new Promise((r) => setTimeout(r, 100));
  return mockBrands;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  await new Promise((r) => setTimeout(r, 200));
  return mockProducts.find((p) => p.id === id) || null;
}

export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 1000 };
  const prices = products.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}
