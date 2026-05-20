// ─── Core Domain Types ───────────────────────────────────

export interface ProductImage {
  url: string;
  alt: Record<string, string>;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: Record<string, string>;
  sku: string;
  price: number;
  originalPrice?: number;
  currency: string;
  stock: number;
  color?: string;
  size?: string;
  images: string[];
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface ShippingInfo {
  free: boolean;
  fast: boolean;
  sameDay: boolean;
  estimatedDays: string;
}

export interface Product {
  id: string;
  sku: string;
  name: Record<string, string>;
  description: Record<string, string>;
  shortDescription: Record<string, string>;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  price: number;
  originalPrice?: number;
  currency: string;
  discount?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  status: AvailabilityStatus;
  tags: string[];
  variants: ProductVariant[];
  features: string[];
  shipping: ShippingInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: Record<string, string>;
  slug: string;
  icon: string;
  parentId: string | null;
  children: Category[];
  productCount: number;
  image?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount: number;
}

// ─── Filter Types ────────────────────────────────────────

export type AvailabilityStatus = "in_stock" | "out_of_stock" | "preorder";

export interface PriceRange {
  min: number;
  max: number;
}

export interface RatingFilter {
  minRating: number;
}

export interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: PriceRange;
  rating: number | null;
  availability: AvailabilityStatus[];
  discounts: number[];
  shipping: string[];
  search: string;
}

export type SortOption =
  | "featured"
  | "best_selling"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "highest_rated";

export type ViewMode = "grid" | "list";

// ─── Pagination ──────────────────────────────────────────

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ─── Storefront Config ───────────────────────────────────

export interface StorefrontConfig {
  locale: string;
  currency: string;
  currencySymbol: string;
  localeCode: string;
  dir: "ltr" | "rtl";
}

// ─── Filter Group Props ──────────────────────────────────

export interface FilterGroupProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}
