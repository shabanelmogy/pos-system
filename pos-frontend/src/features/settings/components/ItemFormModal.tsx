import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaTimes, FaUtensils, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { addItem, updateItem, uploadImage } from "../../pos/api/posApi";
import { MenuItem, CategoryTreeNode } from "../../../shared/types";
import useLocalize from "../../../hooks/useLocalize";

interface FormValues {
  name_en: string;
  name_ar: string;
  desc_en: string;
  desc_ar: string;
  price: string;
  categoryId: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editItem?: MenuItem | null;
  /** Pre-fill categoryId */
  defaultCategoryId?: string;
  /** Leaf categories only (no children) – valid targets for items */
  leafCategories: CategoryTreeNode[];
  onSuccess?: (item: MenuItem) => void;
}

const ItemFormModal: React.FC<Props> = ({
  isOpen, onClose, editItem, defaultCategoryId, leafCategories, onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { localize } = useLocalize();
  const isEditing = !!editItem;

  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name_en: "", name_ar: "", desc_en: "", desc_ar: "", price: "", categoryId: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditing && editItem) {
      setValue("name_en", editItem.name.en || "");
      setValue("name_ar", editItem.name.ar || "");
      setValue("desc_en", editItem.description?.en || "");
      setValue("desc_ar", editItem.description?.ar || "");
      setValue("price", String(editItem.price));
      setValue("categoryId", editItem.categoryId);
      setImageUrl(editItem.images?.[0] || "");
    } else {
      reset({ name_en: "", name_ar: "", desc_en: "", desc_ar: "", price: "", categoryId: defaultCategoryId || "" });
      setImageUrl("");
    }
  }, [isOpen, isEditing, editItem, defaultCategoryId, reset, setValue]);

  const uploadMutation = useMutation({
    mutationFn: (base64: string) => uploadImage(base64),
    onMutate: () => {
      setIsUploading(true);
    },
    onSuccess: (res: any) => {
      setIsUploading(false);
      const url = res.data?.url || res.data;
      setImageUrl(url);
      enqueueSnackbar("Image uploaded successfully!", { variant: "success" });
    },
    onError: (err: any) => {
      setIsUploading(false);
      enqueueSnackbar(err?.response?.data?.message || "Failed to upload image", { variant: "error" });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: client-side validation of file type/size
    if (!file.type.startsWith("image/")) {
      enqueueSnackbar("Please select an image file", { variant: "warning" });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = reader.result as string;
      uploadMutation.mutate(base64Data);
    };
  };

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: { en: values.name_en, ar: values.name_ar || undefined },
        description: { en: values.desc_en || undefined, ar: values.desc_ar || undefined },
        price: parseFloat(values.price),
        categoryId: values.categoryId,
        images: imageUrl ? [imageUrl] : [],
      };
      if (isEditing) return updateItem({ itemId: editItem!.id, ...payload });
      return addItem(payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items", variables.categoryId] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      enqueueSnackbar(isEditing ? "Item updated!" : "Item created!", { variant: "success" });
      
      const updatedItem = (_data as any)?.data?.data || (_data as any)?.data;
      if (updatedItem && onSuccess) {
        onSuccess(updatedItem);
      }
      
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Something went wrong";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  const inputClass = "w-full bg-[var(--bg-main)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 rounded-xl px-4 py-3 text-[var(--text-main)] text-sm font-bold outline-none transition-all placeholder-[var(--text-dim)]";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/40 flex-none">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)]">
                  {isEditing ? <FaEdit size={18} /> : <FaUtensils size={18} />}
                </div>
                <div>
                  <h2 className="text-[var(--text-main)] font-black uppercase tracking-tight text-base">
                    {isEditing ? "Edit Item" : "New Item"}
                  </h2>
                  <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    {isEditing ? "Update dish details" : "Add a dish to the menu"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all">
                <FaTimes size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {/* Image Upload Area */}
              <div className="space-y-1.5 flex flex-col items-center pb-2 border-b border-[var(--border-main)]/50">
                <label className={labelClass + " self-start"}>Item Image</label>
                <div className="relative group w-32 h-32 rounded-2xl border-2 border-dashed border-[var(--border-main)] hover:border-[var(--primary)]/60 bg-[var(--bg-main)] overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Uploading…</span>
                    </div>
                  ) : imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Item Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-[var(--text-dim)] group-hover:text-[var(--text-muted)] transition-colors">
                      <FaUtensils size={24} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-center px-2">Select Image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Name (EN) <span className="text-[var(--status-error)]">*</span></label>
                  <input {...register("name_en", { required: "Required" })} placeholder="e.g. Butter Chicken" className={inputClass} />
                  {errors.name_en && <p className="text-[var(--status-error)] text-[10px] font-bold">{errors.name_en.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Name (AR)</label>
                  <input {...register("name_ar")} placeholder="اسم الطبق" dir="rtl" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Description (EN)</label>
                  <input {...register("desc_en")} placeholder="Short description" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Description (AR)</label>
                  <input {...register("desc_ar")} placeholder="الوصف" dir="rtl" className={inputClass} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Price <span className="text-[var(--status-error)]">*</span></label>
                <input
                  {...register("price", { required: "Price is required", min: { value: 0.01, message: "Must be > 0" } })}
                  type="number" step="0.01" placeholder="0.00"
                  className={inputClass}
                />
                {errors.price && <p className="text-[var(--status-error)] text-[10px] font-bold">{errors.price.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Category <span className="text-[var(--status-error)]">*</span></label>
                <select
                  {...register("categoryId", { required: "Select a category" })}
                  className={inputClass}
                >
                  <option value="">— Select Category —</option>
                  {leafCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{localize(cat.name)}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-[var(--status-error)] text-[10px] font-bold">{errors.categoryId.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border-main)] text-[var(--text-muted)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={mutation.isPending} className="flex-1 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20">
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

export default ItemFormModal;
