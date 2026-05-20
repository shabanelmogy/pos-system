import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose, IoMdArrowDropdown } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  addTable, addCategory, addItem, updateItem, updateCategory, getCategories,
  addBranch, updateBranch, addPOSPoint, updatePOSPoint, getBranches, updateTable,
  createUser, updateUser, assignPOS, getPOSPoints, addCoupon, updateCoupon,
  getKitchenStations
} from "@/shared/api/services/dashboardApi";
import { enqueueSnackbar } from "notistack";
import CustomDropdown from "@/shared/components/CustomDropdown";
import { MdCategory, MdStore, MdPerson, MdEmail, MdLock, MdPhone, MdShield, MdComputer } from "react-icons/md";
import useManagementForm from "../hooks/useManagementForm";
import useLocalize from "@/shared/hooks/useLocalize";
import { useTranslation } from "react-i18next";
import { uploadImage } from "@/shared/api/services/posApi";

import { TableForm } from "./management/forms/TableForm";
import { CategoryForm } from "./management/forms/CategoryForm";
import { DishForm } from "./management/forms/DishForm";
import { BranchForm } from "./management/forms/BranchForm";
import { POSPointForm } from "./management/forms/POSPointForm";
import { CouponForm } from "./management/forms/CouponForm";
import { UserForm } from "./management/forms/UserForm";

const QWERTY_TO_ARABIC_MAP: Record<string, string> = {
  'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح',
  '[': 'ج', ']': 'د', 'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن',
  'l': 'م', ';': 'ك', "'": 'ط', 'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة',
  ',': 'و', '.': 'ز', '/': 'ظ',
  'Q': 'َ', 'W': 'ً', 'E': 'ُ', 'R': 'ٌ', 'T': 'لإ', 'Y': 'إ', 'U': '`', 'I': '÷', 'O': '×', 'P': '؛',
  '{': '<', '}': '>', 'A': 'ِ', 'S': 'ٍ', 'D': 'إ', 'F': 'لأ', 'G': 'لأ', 'H': 'أ', 'J': 'ـ', 'K': '،',
  'L': '/', ':': ':', '"': '"', 'Z': '~', 'X': 'ْ', 'C': '}', 'V': '{', 'B': 'لآ', 'N': 'آ', 'M': '’',
  '<': ',', '>': '.', '?': '؟'
};

const ARABIC_TO_QWERTY_MAP: Record<string, string> = {
  'ض': 'q', 'ص': 'w', 'ث': 'e', 'ق': 'r', 'ف': 't', 'غ': 'y', 'ع': 'u', 'ه': 'i', 'خ': 'o', 'ح': 'p',
  'ج': '[', 'د': ']', 'ش': 'a', 'س': 's', 'ي': 'd', 'ب': 'f', 'ل': 'g', 'ا': 'h', 'ت': 'j', 'ن': 'k',
  'م': 'l', 'ك': ';', 'ط': "'", 'ئ': 'z', 'ء': 'x', 'ؤ': 'c', 'ر': 'v', 'لا': 'b', 'ى': 'n', 'ة': 'm',
  'و': ',', 'ز': '.', 'ظ': '/',
  'َ': 'Q', 'ً': 'W', 'ُ': 'E', 'ٌ': 'R', 'لإ': 'T', 'إ': 'Y', '`': 'U', '÷': 'I', '×': 'O', '؛': 'P',
  '<': '{', '>': '}', 'ِ': 'A', 'ٍ': 'S', 'لأ': 'F', 'أ': 'H', 'ـ': 'J', '،': 'K', '~': 'Z', 'ْ': 'X',
  'لآ': 'B', 'آ': 'N', '’': 'M', '؟': '?'
};

interface ManagementModalProps {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const ManagementModal: React.FC<ManagementModalProps> = ({ type, isOpen, onClose, initialData = null }) => {
  const { t, i18n } = useTranslation();
  const { localize } = useLocalize();
  const queryClient = useQueryClient();
  const isEdit = !!initialData;
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPOSPoints, setSelectedPOSPoints] = useState<string[]>([]);
  const [posSearchQuery, setPosSearchQuery] = useState("");
  const [showTerminals, setShowTerminals] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Image upload mutation
  const uploadMutation = useMutation({
    mutationFn: (base64: string) => uploadImage(base64),
    onMutate: () => setIsUploading(true),
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
    if (!file.type.startsWith("image/")) {
      enqueueSnackbar("Please select an image file", { variant: "warning" });
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => uploadMutation.mutate(reader.result as string);
  };

  const { register, handleSubmit, setValue, watch, errors } = useManagementForm(type, initialData, isOpen);

  const handleArabicKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const mappedChar = QWERTY_TO_ARABIC_MAP[e.key];
      if (mappedChar !== undefined) {
        e.preventDefault();
        const input = e.currentTarget;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const value = input.value;
        const newValue = value.substring(0, start) + mappedChar + value.substring(end);
        input.value = newValue;
        const newCursorPos = start + mappedChar.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  };

  const handleEnglishKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const mappedChar = ARABIC_TO_QWERTY_MAP[e.key];
      if (mappedChar !== undefined) {
        e.preventDefault();
        const input = e.currentTarget;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const value = input.value;
        const newValue = value.substring(0, start) + mappedChar + value.substring(end);
        input.value = newValue;
        const newCursorPos = start + mappedChar.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  };

  const handleEnglishInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;
    const cleaned = value.replace(/[\u0600-\u06FF]/g, "");
    if (cleaned !== value) {
      input.value = cleaned;
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  const watchedBranchId = watch("branchId");
  const watchedRole = watch("role");

  // Load Dependencies
  const { data: categories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: async () => { const res = await getCategories(); return res.data.data || res.data; },
    enabled: type === "dishes"
  });
  
  const { data: kitchenStations } = useQuery({
    queryKey: ["kitchenStations"],
    queryFn: async () => { const res = await getKitchenStations(); return res.data.data || res.data; },
    enabled: type === "category"
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => { const res = await getBranches(); return res.data.data || res.data; },
    enabled: type === "posPoint" || type === "user"
  });

  const { data: branchPOSPoints } = useQuery({
    queryKey: ["posPoints", watchedBranchId],
    queryFn: async () => { const res = await getPOSPoints(watchedBranchId); return res.data.data || res.data; },
    enabled: type === "user" && !!watchedBranchId
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
      if (type === "user" && initialData?.posPermissions) {
        const ids = initialData.posPermissions.map((p: any) => p.posPointId);
        setSelectedPOSPoints(ids);
        setShowTerminals(ids.length > 0);
      } else {
        setSelectedPOSPoints([]);
        setShowTerminals(false);
      }

      if ((type === "category" || type === "dishes") && initialData) {
        setImageUrl(initialData.images?.[0] || "");
      } else {
        setImageUrl("");
      }
    }
  }, [isOpen, initialData, type]);

  const recursiveFindId = (obj: any) => {
    if (!obj || typeof obj !== "object") return null;
    const directId = obj.id || obj.Id || obj.ID || obj.tableId || obj.categoryId || obj.itemId || obj.userId;
    if (directId) return directId;
    for (const key in obj) {
      if (key.toLowerCase().endsWith("id")) return obj[key];
    }
    return null;
  };

  const mutation = useMutation({
    mutationFn: async (preparedData: any) => {
      if (isEdit) {
        const id = recursiveFindId(initialData);
        if (!id) throw new Error("ID_NOT_FOUND");

        switch (type) {
          case "table": return updateTable(id, { tableNo: preparedData.tableNo, seats: preparedData.seats });
          case "dishes": return updateItem(id, { name: preparedData.name, price: preparedData.price, categoryId: preparedData.categoryId, images: preparedData.images });
          case "category": return updateCategory(id, { name: preparedData.name, kitchenStationId: preparedData.kitchenStationId, images: preparedData.images });
          case "branch": return updateBranch(id, { ...preparedData, id });
          case "posPoint": return updatePOSPoint(id, preparedData);
          case "coupon": return updateCoupon(id, preparedData);
          case "user":
            const userRes = await updateUser(id, preparedData);
            await assignPOS({ userId: id, posPointIds: selectedPOSPoints });
            return userRes;
          default: return null;
        }
      } else {
        switch (type) {
          case "table": return addTable(preparedData);
          case "category": return addCategory(preparedData);
          case "dishes": return addItem(preparedData);
          case "branch": return addBranch(preparedData);
          case "posPoint": return addPOSPoint(preparedData);
          case "coupon": return addCoupon(preparedData);
          case "user":
            const userRes = await createUser(preparedData);
            if (userRes.data.data.id) {
              await assignPOS({ userId: userRes.data.data.id, posPointIds: selectedPOSPoints });
            }
            return userRes;
          default: return null;
        }
      }
    },
    onSuccess: (res: any) => {
      const queryMap: { [key: string]: string } = { dishes: "items", table: "tables", category: "categories", branch: "branches", posPoint: "posPoints", user: "users" };
      queryClient.invalidateQueries({ queryKey: [queryMap[type] || type] });
      enqueueSnackbar(res.data.message || t('common.success'), { variant: "success" });
      onClose();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || t('common.error'), { variant: "error" });
    }
  });

  const onSubmitHandler = (data: any) => {
    if (type === "dishes" || type === "category" || type === "branch" || type === "posPoint") {
      data = {
        ...data,
        name: {
          en: data.nameEn || "",
          ar: data.nameAr || ""
        }
      };
    }
    if (type === "category" || type === "dishes") {
      data = {
        ...data,
        images: imageUrl ? [imageUrl] : []
      };
    }
    mutation.mutate(data);
  };

  const togglePOSSelection = (id: string) => {
    setSelectedPOSPoints(prev => prev.includes(id) ? [] : [id]);
  };

  const getModalTitle = () => {
    const action = isEdit ? t('dashboard.management.modal.edit') : t('dashboard.management.modal.add');
    const entityMap: { [key: string]: string } = {
      dishes: t('dashboard.management.modal.dish'),
      posPoint: t('dashboard.management.modal.terminal'),
      user: t('dashboard.management.modal.staff'),
      table: t('dashboard.management.modal.table'),
      category: t('dashboard.management.modal.category'),
      branch: t('dashboard.management.modal.branch')
    };
    return `${action} ${entityMap[type] || type}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[250] p-4 sm:p-6">
      {/* Soft, premium glass backdrop with click-outside close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`bg-[var(--bg-card-alt)] rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full ${type === "user" ? "max-w-3xl" : "max-w-xl"} border border-[var(--border-main)] flex flex-col relative overflow-visible max-h-[90vh] z-10`}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--border-main)]/50 flex justify-between items-center bg-[var(--bg-card-alt)]/50 backdrop-blur-xl z-10 rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${type === 'user' ? 'bg-blue-500/10 text-blue-500' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
                {type === 'user' ? <MdPerson size={24} /> : type === 'branch' ? <MdStore size={24} /> : <MdCategory size={24} />}
             </div>
             <div>
               <p className="text-[var(--text-dim)] text-[9px] font-black uppercase tracking-[0.3em] mb-0.5">{isEdit ? "Secure Update" : "Registration"}</p>
               <h2 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tight">
                 {getModalTitle()}
               </h2>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 hover:bg-[var(--border-main)] rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className={`custom-scrollbar p-8 ${type === "user" || type === "branch" || type === "coupon" ? "flex-1 overflow-y-auto" : "overflow-visible"}`}>
          <form id="management-form" onSubmit={handleSubmit(onSubmitHandler)} className="space-y-8">
            {type === "user" && (
              <UserForm
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                branches={branches || []}
                branchPOSPoints={branchPOSPoints || []}
                selectedPOSPoints={selectedPOSPoints}
                togglePOSSelection={togglePOSSelection}
                showTerminals={showTerminals}
                setShowTerminals={setShowTerminals}
                posSearchQuery={posSearchQuery}
                setPosSearchQuery={setPosSearchQuery}
                firstInputRef={firstInputRef}
                isEdit={isEdit}
                localize={localize}
                t={t}
              />
            )}

            {type === "table" && (
              <TableForm
                register={register}
                errors={errors}
                firstInputRef={firstInputRef}
                t={t}
              />
            )}

            {type === "category" && (
              <CategoryForm
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                kitchenStations={kitchenStations || []}
                localize={localize}
                firstInputRef={firstInputRef}
                i18n={i18n}
                handleArabicKeyPress={handleArabicKeyPress}
                handleEnglishKeyDown={handleEnglishKeyDown}
                handleEnglishInput={handleEnglishInput}
                imageUrl={imageUrl}
                isUploading={isUploading}
                handleImageChange={handleImageChange}
              />
            )}

            {type === "dishes" && (
              <DishForm
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                categories={categories || []}
                localize={localize}
                firstInputRef={firstInputRef}
                i18n={i18n}
                handleArabicKeyPress={handleArabicKeyPress}
                handleEnglishKeyDown={handleEnglishKeyDown}
                handleEnglishInput={handleEnglishInput}
                t={t}
                imageUrl={imageUrl}
                isUploading={isUploading}
                handleImageChange={handleImageChange}
              />
            )}

            {type === "branch" && (
              <BranchForm
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                firstInputRef={firstInputRef}
                i18n={i18n}
                handleArabicKeyPress={handleArabicKeyPress}
                handleEnglishKeyDown={handleEnglishKeyDown}
                handleEnglishInput={handleEnglishInput}
                t={t}
              />
            )}

            {type === "posPoint" && (
              <POSPointForm
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                branches={branches || []}
                localize={localize}
                firstInputRef={firstInputRef}
                i18n={i18n}
                handleArabicKeyPress={handleArabicKeyPress}
                handleEnglishKeyDown={handleEnglishKeyDown}
                handleEnglishInput={handleEnglishInput}
                t={t}
              />
            )}

            {type === "coupon" && (
              <CouponForm
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                firstInputRef={firstInputRef}
              />
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[var(--border-main)]/50 bg-[var(--bg-card)]/50 flex gap-4 rounded-b-[2.5rem]">
           <button 
             type="button" 
             onClick={onClose}
             className="flex-1 px-8 py-4 text-[var(--text-muted)] hover:text-[var(--text-main)] font-black text-[10px] uppercase tracking-widest transition-all hover:bg-[var(--border-main)] rounded-2xl"
           >
             Cancel
           </button>
           <button
             form="management-form"
             type="submit"
             disabled={mutation.isPending}
             className="flex-[2] bg-[var(--primary)] text-[var(--bg-card)] font-black px-12 py-4 rounded-2xl transition-all uppercase tracking-[0.3em] shadow-2xl shadow-[var(--primary)]/20 disabled:opacity-50 text-[11px] hover:scale-[1.02] active:scale-[0.98]"
           >
             {mutation.isPending ? t('dashboard.management.modal.syncing') : `${isEdit ? t('dashboard.management.modal.update') : t('dashboard.management.modal.register')} ${type}`}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagementModal;
