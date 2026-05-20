"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { getAllItems, getAllCategories } from "@/lib/api";
import type { Item, Category } from "@/types";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import {
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  LogOut,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Grid3X3,
  TrendingUp,
  Store,
  CheckCircle,
  Menu,
  Package,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────

function getLocalizedText(obj: Record<string, string> | undefined | null, fallback = ""): string {
  if (!obj) return fallback;
  if (typeof window !== "undefined") {
    const lang = navigator.language?.split("-")[0] || "en";
    return obj[lang] || obj["en"] || fallback;
  }
  return obj["en"] || fallback;
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function getItemImage(item: Item): string {
  if (item.images && item.images.length > 0) {
    return item.images[0];
  }
  return "";
}

function getCategoryImage(cat: Category): string {
  if (cat.images && cat.images.length > 0) {
    return cat.images[0];
  }
  return "";
}

// ─── Cart Sidebar ─────────────────────────────────────────

function CartSidebar() {
  const { items, totalItems, totalPrice, isCartOpen, setCartOpen, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[var(--bg-card)] border-l border-[var(--border-main)] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--primary-light)] p-2 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)]">Your Cart</h2>
                  <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-[var(--bg-card-alt)] p-6 rounded-full mb-4">
                    <ShoppingBag className="w-10 h-10 text-[var(--text-dim)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-muted)]">Your cart is empty</p>
                  <p className="text-[10px] text-[var(--text-dim)] font-semibold mt-1">Add some delicious items to get started</p>
                </div>
              ) : (
                items.map((ci) => (
                  <div key={ci.item.id} className="flex gap-3 bg-[var(--bg-card-alt)] rounded-2xl p-3 border border-[var(--border-main)] group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--bg-main)] flex-shrink-0">
                      {getItemImage(ci.item) ? (
                        <img src={getItemImage(ci.item)} alt={getLocalizedText(ci.item.name)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-[var(--text-dim)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-main)] truncate">{getLocalizedText(ci.item.name)}</p>
                      <p className="text-[10px] font-bold text-[var(--primary)] mt-0.5">{formatPrice(ci.item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)} className="w-6 h-6 rounded-lg bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all cursor-pointer">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-[var(--text-main)] w-5 text-center">{ci.quantity}</span>
                        <button onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)} className="w-6 h-6 rounded-lg bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all cursor-pointer">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeItem(ci.item.id)} className="ml-auto p-1.5 rounded-lg text-[var(--text-dim)] hover:text-[var(--status-error)] hover:bg-[var(--status-error-bg)] transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-[var(--text-main)]">{formatPrice((parseFloat(ci.item.price) * ci.quantity).toFixed(2))}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--border-main)] p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider">Subtotal</span>
                  <span className="text-lg font-black text-[var(--text-main)]">{formatPrice(totalPrice.toFixed(2))}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={clearCart} className="flex-1 py-3 rounded-2xl border border-[var(--border-main)] text-[10px] font-black uppercase tracking-wider text-[var(--text-dim)] hover:text-[var(--status-error)] hover:border-[var(--status-error)] transition-all cursor-pointer">Clear</button>
                  <button disabled={!user} className="flex-1 py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50">
                    {user ? "Checkout" : "Sign in to checkout"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Product Card ─────────────────────────────────────────

function ProductCard({ item, onAddToCart }: { item: Item; onAddToCart: (item: Item) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const imgSrc = getItemImage(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/5 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-card-alt)]">
        {imgSrc ? (
          <img src={imgSrc} alt={getLocalizedText(item.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-[var(--text-dim)]" />
          </div>
        )}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            >
              <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                <button onClick={() => onAddToCart(item)} className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95">
                  <Plus className="w-3 h-3" /> Add to Cart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute top-3 right-3 bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-main)] px-3 py-1.5 rounded-xl">
          <span className="text-xs font-black text-[var(--primary)]">{formatPrice(item.price)}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-[var(--text-main)] truncate">{getLocalizedText(item.name)}</h3>
        {item.description && (
          <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1 line-clamp-2 leading-relaxed">{getLocalizedText(item.description)}</p>
        )}
        <button onClick={() => onAddToCart(item)} className="mt-3 w-full py-2.5 rounded-xl bg-[var(--bg-card-alt)] border border-[var(--border-main)] hover:bg-[var(--primary)] hover:text-[var(--primary-fg)] hover:border-[var(--primary)] text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5">
          <ShoppingCart className="w-3 h-3" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}

// ─── Category Card ────────────────────────────────────────

function CategoryCard({ category, active, onClick }: { category: Category; active: boolean; onClick: () => void }) {
  const imgSrc = getCategoryImage(category);
  return (
    <button onClick={onClick} className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer min-w-[90px] ${
      active ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-main)]"
    }`}>
      <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${active ? "bg-[var(--primary-fg)]/10" : "bg-[var(--bg-card-alt)]"}`}>
        {imgSrc ? <img src={imgSrc} alt={getLocalizedText(category.name)} className="w-full h-full object-cover" /> : <Grid3X3 className="w-5 h-5" />}
      </div>
      <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">{getLocalizedText(category.name)}</span>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function Home() {
  const { user, token, logout, loading } = useAuth();
  const { addItem, totalItems, setCartOpen } = useCart();
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "newest">("newest");

  useEffect(() => {
    // Wait for auth to finish loading before fetching data
    if (loading) return;

    async function loadData() {
      try {
        const [itemsRes, catsRes] = await Promise.all([getAllItems(token), getAllCategories(token)]);
        if (itemsRes.success) setItems(itemsRes.data);
        if (catsRes.success) setCategories(catsRes.data);
      } catch (err) {
        console.error("Failed to load catalog data", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, [loading, token]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (activeCategory) result = result.filter((item) => item.categoryId === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = getLocalizedText(item.name).toLowerCase();
        const desc = getLocalizedText(item.description).toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }
    switch (sortBy) {
      case "name": result.sort((a, b) => getLocalizedText(a.name).localeCompare(getLocalizedText(b.name))); break;
      case "price-asc": result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break;
      case "price-desc": result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return result;
  }, [items, activeCategory, searchQuery, sortBy]);

  const handleSignOut = async () => {
    await logout();
    router.push("/auth");
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--border-main)] border-t-[var(--primary)] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-[var(--primary)]">NX</div>
        </div>
        <p className="mt-4 text-xs font-semibold tracking-[0.3em] text-[var(--text-dim)] uppercase animate-pulse">Loading Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-x-hidden relative select-none font-sans">
      {/* Subtle decorative background */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-[var(--primary-light)] rounded-full filter blur-[120px] opacity-30 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-[var(--primary-light)] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />

      {/* ─── HEADER ─────────────────────────────────────── */}
      <header className="relative z-30 border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="sm:hidden p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-dim)] cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div className="bg-gradient-to-br from-[var(--primary)] to-amber-500 p-2.5 rounded-xl shadow-lg">
              <ShoppingBag className="w-5 h-5 text-[var(--primary-fg)]" />
            </div>
            <span className="text-base sm:text-lg font-black tracking-wider uppercase">Nexus<span className="text-[var(--primary)]">Market</span></span>
          </div>

          {/* Navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button onClick={() => router.push("/")} className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 transition-all cursor-pointer">
              Home
            </button>
            <button onClick={() => router.push("/products")} className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer">
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1" />
              Products
            </button>
          </nav>

          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search menu items..." className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-semibold placeholder:text-[var(--text-dim)]" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher />
            <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-xl bg-[var(--bg-card-alt)] border border-[var(--border-main)] hover:border-[var(--primary)]/40 text-[var(--text-dim)] hover:text-[var(--primary)] transition-all cursor-pointer">
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--primary-fg)] text-[8px] font-black flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="bg-[var(--bg-card-alt)] border border-[var(--border-main)] p-2 rounded-xl">
                  <User className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <button onClick={handleSignOut} className="flex items-center gap-1.5 bg-[var(--status-error-bg)] border border-[var(--status-error)]/30 hover:bg-[var(--status-error)] hover:text-white rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-wider text-[var(--status-error)] transition-all cursor-pointer active:scale-95">
                  <LogOut className="w-3 h-3" /> <span className="hidden lg:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <button onClick={() => router.push("/auth")} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                <span className="hidden sm:inline">Sign In</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search menu items..." className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-semibold placeholder:text-[var(--text-dim)]" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── MOBILE MENU ────────────────────────────────── */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-0 z-20 bg-[var(--bg-card)]/95 backdrop-blur-md pt-20">
            <div className="p-6 space-y-4">
              {user ? (
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-card-alt)] rounded-2xl border border-[var(--border-main)]">
                  <div className="bg-[var(--primary-light)] p-3 rounded-xl"><User className="w-5 h-5 text-[var(--primary)]" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--text-main)]">{user.name}</p>
                    <p className="text-[10px] text-[var(--text-dim)] font-semibold">{user.email}</p>
                  </div>
                  <button onClick={handleSignOut} className="p-2.5 rounded-xl bg-[var(--status-error-bg)] text-[var(--status-error)] cursor-pointer"><LogOut className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => { router.push("/auth"); setShowMobileMenu(false); }} className="w-full py-4 rounded-2xl bg-[var(--primary)] text-[var(--primary-fg)] text-xs font-black uppercase tracking-wider cursor-pointer">Sign In</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO SECTION ───────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-6 sm:pb-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-card-alt)] border border-[var(--border-main)]">
          {/* Subtle glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[var(--primary-light)] rounded-full filter blur-[80px] opacity-40" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--primary-light)] rounded-full filter blur-[60px] opacity-30" />

          <div className="relative z-10 px-5 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex-1 space-y-3 sm:space-y-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-[var(--primary-light)] border border-[var(--primary)]/20 text-[var(--primary)] px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Premium Marketplace
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-[var(--text-main)]">
                  Taste the <span className="text-[var(--primary)]">Extraordinary</span>
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold max-w-lg leading-relaxed">
                  Explore gourmet dishes crafted by master chefs. Order online and enjoy restaurant-quality dining at home.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-2 sm:gap-3 pt-1">
                  <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1.5">
                    <CheckCircle className="w-3 h-3 text-[var(--status-success)]" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{items.length} Items</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1.5">
                    <Store className="w-3 h-3 text-[var(--primary)]" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{categories.length} Categories</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-2.5 py-1.5">
                    <TrendingUp className="w-3 h-3 text-[var(--status-warning)]" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Live Sync</span>
                  </div>
                </div>
              </div>

              {/* Featured items preview - compact */}
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                {items.slice(0, 3).map((item, i) => (
                  <div
                    key={item.id}
                    className={`w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-[var(--bg-card-alt)] border border-[var(--border-main)] shadow-sm transition-transform hover:scale-105 ${
                      i === 1 ? "-mt-3" : i === 2 ? "mt-3" : ""
                    }`}
                  >
                    {getItemImage(item) ? (
                      <img src={getItemImage(item)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-[var(--text-dim)]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES + FILTERS BAR ───────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--text-main)]">Browse Categories</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="appearance-none bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-3 py-2 pr-8 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider focus:outline-none focus:border-[var(--primary)] cursor-pointer">
                <option value="newest">Newest</option>
                <option value="name">Name</option>
                <option value="price-asc">Price: Low</option>
                <option value="price-desc">Price: High</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-dim)] pointer-events-none" />
            </div>
            <button className={`p-2 rounded-xl border transition-all cursor-pointer ${activeCategory ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-dim)]"}`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-4 sm:mx-0 px-4 sm:px-0">
          <button onClick={() => setActiveCategory(null)} className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer min-w-[90px] ${
            !activeCategory ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!activeCategory ? "bg-[var(--primary-fg)]/10" : "bg-[var(--bg-card-alt)]"}`}>
              <Grid3X3 className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">All Items</span>
          </button>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} active={activeCategory === cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)} />
          ))}
        </div>
      </section>

      {/* ─── PRODUCT GRID ───────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)] uppercase tracking-tight">
              {activeCategory ? getLocalizedText(categories.find((c) => c.id === activeCategory)?.name) : "All Items"}
            </h2>
            <p className="text-[10px] sm:text-xs text-[var(--text-dim)] font-semibold mt-0.5">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} available
              {searchQuery && <> for &ldquo;{searchQuery}&rdquo;</>}
            </p>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-[var(--bg-card-alt)] p-8 rounded-full mb-4">
              <Package className="w-12 h-12 text-[var(--text-dim)]" />
            </div>
            <h3 className="text-lg font-black text-[var(--text-main)] uppercase">No items found</h3>
            <p className="text-xs text-[var(--text-muted)] font-semibold mt-1 max-w-md">
              {searchQuery ? `No results match "${searchQuery}". Try a different search term.` : "No items available in this category yet."}
            </p>
            {(searchQuery || activeCategory) && (
              <button onClick={() => { setSearchQuery(""); setActiveCategory(null); }} className="mt-4 px-6 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-fg)] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer hover:bg-[var(--primary-hover)]">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} onAddToCart={addItem} />
            ))}
          </div>
        )}
      </section>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[var(--border-main)] bg-[var(--bg-card)]/50 py-8 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-[var(--primary)] to-amber-500 p-1.5 rounded-lg">
              <ShoppingBag className="w-3.5 h-3.5 text-[var(--primary-fg)]" />
            </div>
            <span className="text-sm font-black tracking-wider uppercase">Nexus<span className="text-[var(--primary)]">Market</span></span>
          </div>
          <p className="text-[10px] text-[var(--text-dim)] font-semibold">
            &copy; {new Date().getFullYear()} NexusMarket. All rights reserved. Powered by Nexus POS.
          </p>
        </div>
      </footer>

      {/* ─── CART SIDEBAR ───────────────────────────────── */}
      <CartSidebar />
    </div>
  );
}
