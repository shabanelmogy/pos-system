import React from "react";
import { FaEdit, FaTrash, FaArrowLeft, FaUtensils } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { deleteItem } from "../../pos/api/posApi";
import { MenuItem, CategoryTreeNode } from "../../../shared/types";
import useLocalize from "../../../hooks/useLocalize";

interface Props {
  item: MenuItem;
  category: CategoryTreeNode;
  onEdit: () => void;
  onClose: () => void;
}

const ItemDetailsView: React.FC<Props> = ({ item, category, onEdit, onClose }) => {
  const queryClient = useQueryClient();
  const { localize } = useLocalize();

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", category.id] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      enqueueSnackbar("Item deleted", { variant: "success" });
      onClose();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.response?.data?.message || "Cannot delete item", { variant: "error" });
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Delete item "${localize(item.name)}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl border border-[var(--border-main)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all flex items-center justify-center"
          title="Back to item list"
        >
          <FaArrowLeft size={12} />
        </button>
        <div>
          <h2 className="text-[var(--text-main)] font-black uppercase tracking-tight text-base truncate max-w-xs md:max-w-md">
            {localize(item.name)}
          </h2>
          <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-0.5">
            Dish Details & Preview
          </p>
        </div>
      </div>

      {/* Main Details Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left/Top: Visual Card */}
          <div className="w-full md:w-1/3 aspect-square max-h-[220px] rounded-3xl overflow-hidden border border-[var(--border-main)] flex flex-col items-center justify-center text-[var(--text-dim)] shadow-inner">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={localize(item.name)}
                className="w-full h-full object-cover animate-in fade-in duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="p-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  <FaUtensils size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">No Image</span>
              </div>
            )}
          </div>

          {/* Right/Bottom: Information fields */}
          <div className="flex-1 space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Category
              </span>
              <p className="text-sm font-bold text-[var(--text-main)] bg-[var(--bg-card-alt)] px-3 py-2 rounded-xl inline-block border border-[var(--border-main)]/50">
                📁 {localize(category.name)}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Price
              </span>
              <p className="text-2xl font-black text-[var(--primary)] leading-none">
                ₹{item.price}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Name (English)
              </span>
              <p className="text-sm font-bold text-[var(--text-main)]">
                {item.name.en}
              </p>
            </div>

            {item.name.ar && (
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                  Name (Arabic)
                </span>
                <p className="text-sm font-bold text-[var(--text-main)]" dir="rtl">
                  {item.name.ar}
                </p>
              </div>
            )}

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                Description
              </span>
              <p className="text-xs font-bold text-[var(--text-muted)] leading-relaxed">
                {item.description ? localize(item.description) : "No description provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex gap-4 p-6 border-t border-[var(--border-main)] bg-[var(--bg-card)]">
        <button
          onClick={onEdit}
          className="flex-1 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 active:scale-95"
        >
          <FaEdit size={12} /> Edit Details
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="py-3 px-6 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--status-error-bg)] text-[var(--text-muted)] hover:text-[var(--status-error)] border border-[var(--border-main)] transition-all flex items-center justify-center gap-1.5 active:scale-95"
          title="Delete Item"
        >
          <FaTrash size={12} />
        </button>
      </div>
    </div>
  );
};

export default ItemDetailsView;
