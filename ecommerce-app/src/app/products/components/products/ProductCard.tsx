"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star, Truck, Zap, Clock } from "lucide-react";
import type { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  index: number;
  viewMode: "grid" | "list";
}

export function ProductCard({ product, index, viewMode }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const discount = product.discount;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group flex gap-4 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/30 hover:shadow-lg transition-all"
      >
        {/* Image */}
        <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--bg-card-alt)]">
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt.en}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="160px"
          />
          {discount && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
              -{discount}%
            </div>
          )}
          <button
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-[var(--text-dim)]">{product.brand.name}</span>
              <span className="text-[var(--border-main)]">·</span>
              <span className="text-[10px] font-semibold text-[var(--text-dim)]">{product.category.name.en}</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-main)] mb-1 line-clamp-1">{product.name.en}</h3>
            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mb-2">{product.shortDescription.en}</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-bold text-[var(--text-main)]">{product.rating}</span>
                <span className="text-[9px] text-[var(--text-dim)]">({product.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                {product.shipping.free && <Truck className="w-3 h-3 text-emerald-500" />}
                {product.shipping.fast && <Zap className="w-3 h-3 text-amber-500" />}
                {product.shipping.sameDay && <Clock className="w-3 h-3 text-blue-500" />}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[var(--text-main)]">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-[11px] text-[var(--text-dim)] line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-fg)] text-[10px] font-black uppercase tracking-wider hover:bg-[var(--primary-hover)] transition-all cursor-pointer active:scale-95"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/30 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[var(--bg-card-alt)] overflow-hidden">
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt.en}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {discount && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
            -{discount}%
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

        {/* Quick actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white cursor-pointer shadow-sm"
            aria-label="Quick view"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white cursor-pointer shadow-sm"
            aria-label="Add to wishlist"
          >
            <Heart className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">{product.brand.name}</span>
        </div>

        <h3 className="text-[12px] font-bold text-[var(--text-main)] mb-1.5 line-clamp-2 leading-snug">
          {product.name.en}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-[var(--text-main)]">{product.rating}</span>
          <span className="text-[9px] text-[var(--text-dim)]">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-1.5 mb-2.5">
          {product.shipping.free && (
            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Free Shipping</span>
          )}
          {product.shipping.fast && (
            <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">Fast</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-[var(--text-main)]">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-[var(--text-dim)] line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--primary)] text-[var(--primary-fg)] hover:bg-[var(--primary-hover)] transition-all cursor-pointer active:scale-95"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
