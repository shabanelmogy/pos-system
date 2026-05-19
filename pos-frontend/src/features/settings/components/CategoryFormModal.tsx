import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaTimes, FaFolderPlus, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { addCategory, updateCategory } from "../../pos/api/posApi";
import { CategoryTreeNode } from "../../../shared/types";
import useLocalize from "../../../hooks/useLocalize";

interface FormValues {
  name_en: string;
  name_ar: string;
  parentId: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** If provided, we are editing this category */
  editCategory?: CategoryTreeNode | null;
  /** Pre-fill as child of this category */
  parentCategory?: CategoryTreeNode | null;
  /** Flat list of all categories for parent dropdown */
  allCategories: CategoryTreeNode[];
}

const CategoryFormModal: React.FC<Props> = ({
  isOpen, onClose, editCategory, parentCategory, allCategories,
}) => {
  const queryClient = useQueryClient();
  const { localize } = useLocalize();
  const isEditing = !!editCategory;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name_en: "", name_ar: "", parentId: null },
  });

  // Prefill when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (isEditing && editCategory) {
      setValue("name_en", editCategory.name.en || "");
      setValue("name_ar", editCategory.name.ar || "");
      setValue("parentId", editCategory.parentId ?? null);
    } else {
      reset({ name_en: "", name_ar: "", parentId: parentCategory?.id ?? null });
    }
  }, [isOpen, isEditing, editCategory, parentCategory, reset, setValue]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: { en: values.name_en, ar: values.name_ar || undefined },
        parentId: values.parentId || null,
      };
      if (isEditing) {
        return updateCategory({ categoryId: editCategory!.id, ...payload });
      }
      return addCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      enqueueSnackbar(isEditing ? "Category updated!" : "Category created!", { variant: "success" });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Something went wrong";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  // Flatten tree for parent dropdown (exclude self, descendants, and categories that have items)
  const flattenExcluding = (nodes: CategoryTreeNode[], excludeId?: string): CategoryTreeNode[] => {
    const result: CategoryTreeNode[] = [];
    const walk = (items: CategoryTreeNode[]) => {
      for (const n of items) {
        if (n.id !== excludeId) {
          if ((n.itemCount ?? 0) === 0) {
            result.push(n);
          }
          walk(n.children);
        }
      }
    };
    walk(nodes);
    return result;
  };

  const parentOptions = flattenExcluding(allCategories, editCategory?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)]">
                  {isEditing ? <FaEdit size={18} /> : <FaFolderPlus size={18} />}
                </div>
                <div>
                  <h2 className="text-[var(--text-main)] font-black uppercase tracking-tight text-base">
                    {isEditing ? "Edit Category" : "New Category"}
                  </h2>
                  {parentCategory && !isEditing && (
                    <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-0.5">
                      Under: {localize(parentCategory.name)}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all">
                <FaTimes size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Name EN */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Name (English) <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  {...register("name_en", { required: "English name is required" })}
                  placeholder="e.g. Main Course"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 rounded-xl px-4 py-3 text-[var(--text-main)] text-sm font-bold outline-none transition-all placeholder-[var(--text-dim)]"
                />
                {errors.name_en && (
                  <p className="text-[var(--status-error)] text-[10px] font-bold">{errors.name_en.message}</p>
                )}
              </div>

              {/* Name AR */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Name (Arabic)
                </label>
                <input
                  {...register("name_ar")}
                  placeholder="e.g. الطبق الرئيسي"
                  dir="rtl"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 rounded-xl px-4 py-3 text-[var(--text-main)] text-sm font-bold outline-none transition-all placeholder-[var(--text-dim)]"
                />
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Parent Category <span className="text-[var(--text-dim)]">(optional – leave empty for root)</span>
                </label>
                <select
                  {...register("parentId")}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 rounded-xl px-4 py-3 text-[var(--text-main)] text-sm font-bold outline-none transition-all"
                >
                  <option value="">— Root Category (no parent) —</option>
                  {parentOptions.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parentId ? `  ↳ ` : ""}{localize(cat.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-[var(--border-main)] text-[var(--text-muted)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20"
                >
                  {mutation.isPending ? "Saving…" : isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryFormModal;
