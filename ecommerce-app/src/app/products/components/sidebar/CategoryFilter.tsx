"use client";

import { useState } from "react";
import { ChevronRight, Monitor, Smartphone, Laptop, Headphones, Shirt, User, Footprints, Sparkles, Home, ShoppingBasket, Trophy, Armchair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterGroup } from "../shared/FilterGroup";
import type { Category } from "../../types";

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-3.5 h-3.5" />,
  Smartphone: <Smartphone className="w-3.5 h-3.5" />,
  Laptop: <Laptop className="w-3.5 h-3.5" />,
  Headphones: <Headphones className="w-3.5 h-3.5" />,
  Shirt: <Shirt className="w-3.5 h-3.5" />,
  User: <User className="w-3.5 h-3.5" />,
  Footprints: <Footprints className="w-3.5 h-3.5" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Home: <Home className="w-3.5 h-3.5" />,
  ShoppingBasket: <ShoppingBasket className="w-3.5 h-3.5" />,
  Trophy: <Trophy className="w-3.5 h-3.5" />,
  Armchair: <Armchair className="w-3.5 h-3.5" />,
};

interface CategoryFilterProps {
  categories: Category[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function CategoryFilter({ categories, selected, onToggle }: CategoryFilterProps) {
  return (
    <FilterGroup title="Categories" icon={<Sparkles className="w-3.5 h-3.5" />}>
      <button
        onClick={() => selected.forEach((id) => onToggle(id))}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
          selected.length === 0
            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
            : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]"
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-card-alt)] flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold">All Categories</span>
        </div>
      </button>
      {categories.map((cat) => (
        <CategoryTreeItem
          key={cat.id}
          category={cat}
          selected={selected}
          onToggle={onToggle}
          depth={0}
        />
      ))}
    </FilterGroup>
  );
}

function CategoryTreeItem({
  category,
  selected,
  onToggle,
  depth,
}: {
  category: Category;
  selected: string[];
  onToggle: (id: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;
  const isSelected = selected.includes(category.id);

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onToggle(category.id);
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer group ${
          isSelected
            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
            : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        aria-expanded={expanded}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isSelected ? "bg-[var(--primary)]/20" : "bg-[var(--bg-card-alt)]"
        }`}>
          {iconMap[category.icon] || <Sparkles className="w-3.5 h-3.5" />}
        </div>
        <span className="text-[11px] font-bold flex-1 truncate">
          {category.name.en}
        </span>
        <span className="text-[9px] font-bold text-[var(--text-dim)] bg-[var(--bg-card-alt)] px-1.5 py-0.5 rounded-md">
          {category.productCount}
        </span>
        {hasChildren && (
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-3 h-3 text-[var(--text-dim)]" />
          </motion.div>
        )}
      </button>
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {category.children.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                selected={selected}
                onToggle={onToggle}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
