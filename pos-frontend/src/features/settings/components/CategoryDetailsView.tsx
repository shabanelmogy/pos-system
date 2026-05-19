import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  FaEdit, FaTrash, FaFolderPlus, FaPlus, FaFolder,
  FaFolderOpen, FaLeaf, FaUtensils, FaSearch, FaChevronRight,
} from "react-icons/fa";
import { deleteCategory, deleteItem, getItems } from "../../pos/api/posApi";
import { CategoryTreeNode, MenuItem } from "../../../shared/types";
import useLocalize from "../../../hooks/useLocalize";

interface Props {
  category: CategoryTreeNode;
  allCategories: CategoryTreeNode[];
  onEdit: () => void;
  onAddSubcategory: () => void;
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onSelectCategory: (node: CategoryTreeNode) => void;
}

const CategoryDetailsView: React.FC<Props> = ({
  category,
  allCategories,
  onEdit,
  onAddSubcategory,
  onAddItem,
  onEditItem,
  onSelectCategory,
}) => {
  const queryClient = useQueryClient();
  const { localize } = useLocalize();
  const [searchQuery, setSearchQuery] = useState("");

  const isBranch = category.children.length > 0;
  const hasItems = (category.itemCount ?? 0) > 0;

  // Query items if it is a leaf category
  const { data: items = [], isLoading: isItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["items", category.id],
    queryFn: async () => {
      const res = await getItems(category.id);
      return res.data.data || res.data;
    },
    enabled: !isBranch,
  });

  // Find parent category node
  const parentCategory = category.parentId
    ? allCategories.find((c) => c.id === category.parentId)
    : null;

  // Category delete mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: () => deleteCategory(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      enqueueSnackbar("Category deleted successfully", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(
        err?.response?.data?.message || "Cannot delete category",
        { variant: "error" }
      );
    },
  });

  // Item delete mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", category.id] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      enqueueSnackbar("Item deleted", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.response?.data?.message || "Cannot delete item", {
        variant: "error",
      });
    },
  });

  const handleDeleteCategory = () => {
    if (isBranch) {
      enqueueSnackbar("Remove all subcategories before deleting this category.", {
        variant: "warning",
      });
      return;
    }
    if (hasItems) {
      enqueueSnackbar("Remove all items from this category before deleting.", {
        variant: "warning",
      });
      return;
    }
    if (window.confirm(`Delete category "${localize(category.name)}"?`)) {
      deleteCategoryMutation.mutate();
    }
  };

  const handleDeleteItem = (item: MenuItem) => {
    if (window.confirm(`Delete item "${localize(item.name)}"?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    const term = searchQuery.toLowerCase();
    const nameEn = item.name.en.toLowerCase();
    const nameAr = item.name.ar?.toLowerCase() || "";
    const descEn = item.description?.en.toLowerCase() || "";
    const descAr = item.description?.ar?.toLowerCase() || "";
    return (
      nameEn.includes(term) ||
      nameAr.includes(term) ||
      descEn.includes(term) ||
      descAr.includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-main)] bg-[var(--bg-card)] flex-none">
        <div>
          <h2 className="text-[var(--text-main)] font-black uppercase tracking-tight text-lg">
            📁 {localize(category.name)}
          </h2>
          <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-0.5">
            Category Details & Structure
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 bg-[var(--bg-hover)] hover:bg-[var(--border-main)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all border border-[var(--border-main)] active:scale-95"
            title="Edit category details"
          >
            <FaEdit size={10} /> Edit Category
          </button>
          <button
            onClick={handleDeleteCategory}
            disabled={deleteCategoryMutation.isPending}
            className="flex items-center gap-1.5 bg-[var(--bg-hover)] hover:bg-[var(--status-error-bg)] text-[var(--text-dim)] hover:text-[var(--status-error)] text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all border border-[var(--border-main)] active:scale-95"
            title="Delete category"
          >
            <FaTrash size={10} /> Delete
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {/* Info Grid Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-5 flex flex-col md:flex-row gap-6 shadow-sm">
          {/* Visual Indicator */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 border border-[var(--primary)]/20 shadow-inner">
            {isBranch ? <FaFolderOpen size={36} /> : <FaLeaf size={32} />}
          </div>

          {/* Core Info */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Name (English)
              </span>
              <p className="font-bold text-[var(--text-main)]">{category.name.en}</p>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Name (Arabic)
              </span>
              <p className="font-bold text-[var(--text-main)]" dir="rtl">
                {category.name.ar || "—"}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Parent Category
              </span>
              <p className="font-bold text-[var(--text-main)]">
                {parentCategory ? `📁 ${localize(parentCategory.name)}` : "— Root Category"}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Structure Type
              </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border
                  ${
                    isBranch
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  }`}
              >
                {isBranch ? "Branch (Folder)" : "Leaf (Dishes)"}
              </span>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Contains
              </span>
              <p className="font-bold text-[var(--text-main)]">
                {isBranch
                  ? `${category.children.length} subcategories`
                  : `${category.itemCount ?? 0} items`}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Inner Content: Subcategories or Items Grid */}
        <div className="space-y-4">
          {isBranch ? (
            /* Subcategories list */
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h3 className="text-[var(--text-main)] font-black uppercase tracking-tight text-sm">
                    Subcategories
                  </h3>
                  <p className="text-[var(--text-dim)] text-[9px] font-bold uppercase tracking-widest mt-0.5">
                    Navigate sub-nodes in "{localize(category.name)}"
                  </p>
                </div>
                <button
                  onClick={onAddSubcategory}
                  className="flex items-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-md shadow-[var(--primary)]/15 active:scale-95"
                >
                  <FaFolderPlus size={10} /> Add Subcategory
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => onSelectCategory(child)}
                    className="group bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 flex items-center justify-between hover:border-[var(--primary)]/40 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-[var(--bg-hover)] text-amber-500 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-all">
                        <FaFolder size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[var(--text-main)] truncate">
                          {localize(child.name)}
                        </h4>
                        <p className="text-[var(--text-dim)] text-[9px] font-bold uppercase mt-0.5">
                          {child.children.length > 0
                            ? `${child.children.length} sub`
                            : `${child.itemCount ?? 0} items`}
                        </p>
                      </div>
                    </div>
                    <FaChevronRight size={10} className="text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Items list */
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3.5">
                <div>
                  <h3 className="text-[var(--text-main)] font-black uppercase tracking-tight text-sm">
                    Items & Dishes
                  </h3>
                  <p className="text-[var(--text-dim)] text-[9px] font-bold uppercase tracking-widest mt-0.5">
                    Manage food menu in this category
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-[var(--text-main)] outline-none transition-all placeholder-[var(--text-dim)] w-48"
                    />
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={10} />
                  </div>

                  <button
                    onClick={onAddItem}
                    className="flex items-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-md shadow-[var(--primary)]/15 active:scale-95 shrink-0"
                  >
                    <FaPlus size={10} /> Add Item
                  </button>
                </div>
              </div>

              {isItemsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 bg-[var(--bg-card)] rounded-2xl animate-pulse border border-[var(--border-main)]"
                    />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl opacity-40">
                  <FaUtensils size={24} className="text-[var(--text-dim)] mb-2" />
                  <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">
                    {searchQuery ? "No matching items found" : "No items in this category"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 flex flex-col justify-between hover:border-[var(--primary)]/40 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-bold text-xs text-[var(--text-main)] line-clamp-2 leading-snug">
                            {localize(item.name)}
                          </h4>
                          <span className="text-[var(--primary)] font-black text-xs shrink-0">
                            ₹{item.price}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[var(--text-dim)] text-[10px] line-clamp-2 mb-3">
                            {localize(item.description)}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 mt-auto pt-3 border-t border-[var(--border-main)]/50">
                        <button
                          onClick={() => onEditItem(item)}
                          className="flex-1 bg-[var(--bg-main)] hover:bg-[var(--primary)] hover:text-black text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <FaEdit size={10} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          disabled={deleteItemMutation.isPending}
                          className="flex-none bg-[var(--bg-main)] hover:bg-[var(--status-error-bg)] text-[var(--text-dim)] hover:text-[var(--status-error)] p-2.5 rounded-xl transition-all"
                          title="Delete item"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsView;
