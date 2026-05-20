import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";
import { getItems, deleteItem } from "@/shared/api/services/posApi";
import { CategoryTreeNode, MenuItem } from "@/shared/types";
import useLocalize from "@/shared/hooks/useLocalize";

interface Props {
  category: CategoryTreeNode | null;
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
}

const CategoryItemList: React.FC<Props> = ({ category, onAddItem, onEditItem }) => {
  const queryClient = useQueryClient();
  const { localize } = useLocalize();

  // If no category is selected, or a category with children (branch) is selected, show empty state
  const isBranch = category && category.children.length > 0;
  const canHaveItems = category && !isBranch;

  const { data: items = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["items", category?.id],
    queryFn: async () => {
      if (!category) return [];
      const res = await getItems(category.id);
      return res.data.data || res.data;
    },
    enabled: !!category && !isBranch,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", category?.id] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      enqueueSnackbar("Item deleted", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.response?.data?.message || "Cannot delete item", { variant: "error" });
    },
  });

  const handleDelete = (item: MenuItem) => {
    if (window.confirm(`Delete item "${localize(item.name)}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  if (!category) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 opacity-40">
        <MdRestaurantMenu size={48} className="text-[var(--text-dim)] mb-4" />
        <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-widest text-center">
          No Category Selected
        </h2>
        <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest text-center mt-2">
          Select a category from the tree on the left
        </p>
      </div>
    );
  }

  if (isBranch) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 opacity-40">
        <FaSearch size={48} className="text-[var(--text-dim)] mb-4" />
        <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-widest text-center">
          Branch Category
        </h2>
        <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest text-center mt-2 max-w-sm">
          "{localize(category.name)}" contains subcategories. <br />
          Select a leaf category (without subcategories) to view and add items.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
        <div>
          <h2 className="text-[var(--text-main)] font-black uppercase tracking-tight text-lg">
            {localize(category.name)} Items
          </h2>
          <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-0.5">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[var(--primary)]/20 active:scale-95"
        >
          <FaPlus size={12} /> Add Item
        </button>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-[var(--bg-card)] rounded-2xl animate-pulse border border-[var(--border-main)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="bg-[var(--bg-card)] p-6 rounded-full mb-4">
              <MdRestaurantMenu size={32} className="text-[var(--text-dim)]" />
            </div>
            <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm">
              No items in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 flex flex-col justify-between hover:border-[var(--primary)]/40 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-[var(--text-main)] line-clamp-2 leading-snug">
                      {localize(item.name)}
                    </h3>
                    <span className="text-[var(--primary)] font-black text-sm ms-2">
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
                    className="flex-1 bg-[var(--bg-main)] hover:bg-[var(--primary)] hover:text-black text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <FaEdit size={10} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deleteMutation.isPending}
                    className="flex-none bg-[var(--bg-main)] hover:bg-[var(--status-error-bg)] text-[var(--text-dim)] hover:text-[var(--status-error)] p-2.5 rounded-xl transition-all"
                    title="Delete item"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryItemList;
