import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose, IoMdArrowDropdown } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  addTable, addCategory, addItem, updateItem, updateCategory, getCategories,
  addBranch, updateBranch, addPOSPoint, updatePOSPoint, getBranches, updateTable,
  createUser, updateUser, assignPOS, getPOSPoints, addCoupon, updateCoupon,
  getKitchenStations
} from "../api/dashboardApi";
import { enqueueSnackbar } from "notistack";
import CustomDropdown from "../../../shared/components/CustomDropdown";
import { MdCategory, MdStore, MdPerson, MdEmail, MdLock, MdPhone, MdShield, MdComputer } from "react-icons/md";
import useManagementForm from "../hooks/useManagementForm";
import useLocalize from "../../../hooks/useLocalize";
import { useTranslation } from "react-i18next";

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
          case "dishes": return updateItem(id, { name: preparedData.name, price: preparedData.price, categoryId: preparedData.categoryId });
          case "category": return updateCategory(id, { name: preparedData.name, kitchenStationId: preparedData.kitchenStationId });
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`bg-[var(--bg-card-alt)] rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full ${type === "user" ? "max-w-3xl" : "max-w-xl"} border border-[var(--border-main)] flex flex-col relative overflow-hidden max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--border-main)]/50 flex justify-between items-center bg-[var(--bg-card-alt)]/50 backdrop-blur-xl z-10">
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <form id="management-form" onSubmit={handleSubmit(onSubmitHandler)} className="space-y-8">
            {type === "user" && (
              <div className="space-y-8">
                {/* Profile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div className="group">
                      <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1"><MdPerson /> {t('dashboard.management.modal.full_name')}</label>
                      <input {...register("name")} ref={(e) => { 
                        register("name").ref(e); 
                        if (e) firstInputRef.current = e; 
                      }} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold text-sm shadow-inner" />
                      {errors.name && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.name.message as string}</span>}
                    </div>
                    <div className="group">
                      <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1"><MdEmail /> {t('dashboard.management.modal.email')}</label>
                      <input {...register("email")} type="email" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner" />
                      {errors.email && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.email.message as string}</span>}
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="group">
                      <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1"><MdPhone /> {t('dashboard.management.modal.phone')}</label>
                      <input {...register("phone")} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner" />
                      {errors.phone && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.phone.message as string}</span>}
                    </div>
                    <div className="group">
                      <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1"><MdLock /> {isEdit ? t('dashboard.management.modal.new_password') : t('dashboard.management.modal.security_password')}</label>
                      <input {...register("password")} type="password" placeholder={isEdit ? t('dashboard.management.modal.optional') : ""} className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner" />
                    </div>
                  </div>
                </div>

                {/* Role & Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-card)]/50 p-6 rounded-3xl border border-[var(--border-main)]">
                  <div className="group">
                    <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1"><MdShield /> {t('dashboard.management.modal.role')}</label>
                    <CustomDropdown options={[{id: "cashier", name: t('dashboard.management.modal.roles.cashier')}, {id: "manager", name: t('dashboard.management.modal.roles.manager')}, {id: "admin", name: t('dashboard.management.modal.roles.admin')}, {id: "kitchen", name: "Kitchen Staff"}]} value={watchedRole} onChange={(val) => setValue("role", val)} placeholder={t('dashboard.management.modal.select_role')} />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1"><MdStore /> {t('dashboard.management.modal.assigned_branch')}</label>
                    <CustomDropdown options={(branches || []).map((b: any) => ({ id: b.id, name: localize(b.name) }))} value={watchedBranchId} onChange={(val) => setValue("branchId", val)} placeholder={t('dashboard.management.modal.select_branch')} />
                  </div>
                </div>

                {/* Collapsible Terminal Section */}
                {watchedBranchId && (
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showTerminals ? 'max-h-[800px] opacity-100' : 'max-h-20 opacity-90'}`}>
                    <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] overflow-hidden shadow-2xl">
                      <button 
                        type="button"
                        onClick={() => setShowTerminals(!showTerminals)}
                        className="w-full px-8 py-5 flex items-center justify-between hover:bg-[var(--bg-card-alt)] transition-colors group"
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showTerminals ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-[var(--text-dim)]/10 text-[var(--text-dim)]'}`}>
                               <MdComputer size={20} />
                            </div>
                            <div className="text-left">
                               <p className="text-[var(--text-main)] text-xs font-black uppercase tracking-widest leading-none mb-1">Terminal Restrictions</p>
                               <p className="text-[var(--text-dim)] text-[10px] font-bold">
                                 {selectedPOSPoints.length > 0 ? "1 Terminal Linked" : "No Terminals Assigned"}
                               </p>
                            </div>
                         </div>
                         <div className={`transition-transform duration-300 ${showTerminals ? 'rotate-180' : ''}`}>
                            <IoMdArrowDropdown size={24} />
                         </div>
                      </button>

                      <AnimatePresence>
                        {showTerminals && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-8 pb-8 space-y-6 overflow-hidden"
                          >
                            <div className="relative group">
                              <input 
                                type="text" 
                                placeholder="Search terminals..." 
                                value={posSearchQuery}
                                onChange={(e) => setPosSearchQuery(e.target.value)}
                                className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl px-5 py-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold placeholder:text-[var(--text-dim)] shadow-inner"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                               {(branchPOSPoints || [])
                                .filter((pos: any) => pos.name.toLowerCase().includes(posSearchQuery.toLowerCase()) || pos.code.toLowerCase().includes(posSearchQuery.toLowerCase()))
                                .map((pos: any) => (
                                 <label key={pos.id} className={`flex items-center gap-4 cursor-pointer group p-4 rounded-2xl border-2 transition-all ${selectedPOSPoints.includes(pos.id) ? 'bg-[var(--primary)]/5 border-[var(--primary)]' : 'bg-transparent border-[var(--border-main)] hover:border-[var(--text-dim)]'}`}>
                                   <input type="radio" name="posSelection" checked={selectedPOSPoints.includes(pos.id)} onChange={() => togglePOSSelection(pos.id)} className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)] bg-[var(--bg-card-alt)] border-[var(--border-main)]" />
                                   <div className="flex flex-col">
                                     <span className={`text-[10px] font-black uppercase tracking-tight leading-none mb-1 ${selectedPOSPoints.includes(pos.id) ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}>{pos.name}</span>
                                     <span className="text-[8px] text-[var(--text-dim)] font-bold">{pos.code}</span>
                                   </div>
                                 </label>
                               ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )}

            {type === "table" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-lg mx-auto py-10">
                <div className="group">
                  <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.table_no')}</label>
                  <input {...register("tableNo")} ref={(e) => { 
                    register("tableNo").ref(e); 
                    if (e) firstInputRef.current = e; 
                  }} type="number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-2xl font-black shadow-inner" />
                  {errors.tableNo && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.tableNo.message as string}</span>}
                </div>
                <div className="group">
                  <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.seats')}</label>
                  <input {...register("seats")} type="number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-2xl font-black shadow-inner" />
                  {errors.seats && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.seats.message as string}</span>}
                </div>
              </div>
            )}

            {(type === "category" || type === "dishes" || type === "branch" || type === "posPoint" || type === "coupon") && (
              <div className="space-y-8 max-w-lg mx-auto py-10">
                {type !== "coupon" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
                        {type === "posPoint" ? "Terminal Name (English)" : "Name (English)"}
                      </label>
                      <div className="relative flex items-center">
                        <input {...register("nameEn")} lang="en" dir="ltr" ref={(e) => { 
                          register("nameEn").ref(e); 
                          if (e && !i18n.language.startsWith('ar')) firstInputRef.current = e; 
                        }} type="text" className="peer w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 pr-14 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-black uppercase tracking-tighter text-xl shadow-inner" />
                        <span className="absolute right-4 text-[10px] font-black bg-[var(--bg-card-alt)] border border-[var(--border-main)] text-[var(--text-muted)] peer-focus:border-[var(--primary)] peer-focus:text-[var(--primary)] px-2.5 py-1 rounded-lg uppercase tracking-wider select-none pointer-events-none transition-all">EN</span>
                      </div>
                      {errors.nameEn && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.nameEn.message as string}</span>}
                    </div>
                    <div className="group">
                      <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1 text-right">
                        الاسم بالعربية
                      </label>
                      <div className="relative flex items-center">
                        <input {...register("nameAr")} lang="ar" dir="rtl" ref={(e) => { 
                          register("nameAr").ref(e); 
                          if (e && i18n.language.startsWith('ar')) firstInputRef.current = e; 
                        }} onKeyDown={handleArabicKeyPress} type="text" className="peer w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 pl-14 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-black text-xl shadow-inner text-right" />
                        <span className="absolute left-4 text-[10px] font-black bg-[var(--bg-card-alt)] border border-[var(--border-main)] text-[var(--text-muted)] peer-focus:border-[var(--primary)] peer-focus:text-[var(--primary)] px-2.5 py-1 rounded-lg select-none pointer-events-none transition-all">عربي</span>
                      </div>
                      {errors.nameAr && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.nameAr.message as string}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Name</label>
                    <input {...register("name")} ref={(e) => { 
                      register("name").ref(e); 
                      if (e) firstInputRef.current = e; 
                    }} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-black uppercase tracking-tighter text-xl shadow-inner" />
                    {errors.name && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.name.message as string}</span>}
                  </div>
                )}

                {type === "category" && (
                  <div className="group">
                    <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Kitchen Station (Routing)</label>
                    <CustomDropdown 
                      options={(kitchenStations || []).map((ks: any) => ({ id: ks.id, name: localize(ks.name) }))} 
                      value={watch("kitchenStationId")} 
                      onChange={(val) => setValue("kitchenStationId", val)} 
                      placeholder="Select Kitchen Station" 
                    />
                    <p className="text-[9px] text-[var(--text-dim)] mt-2 italic font-bold">Routing this category will send its items to the selected KDS screen.</p>
                  </div>
                )}

                {(type === "branch" || type === "posPoint") && (
                  <div className="group">
                    <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.unique_code')}</label>
                    <input {...register("code")} type="text" placeholder={type === 'branch' ? 'e.g. BR-01' : 'e.g. POS-01'} className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono text-base shadow-inner" />
                    {errors.code && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.code.message as string}</span>}
                  </div>
                )}

                {type === "branch" && (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.city')}</label>
                        <input {...register("city")} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner" />
                      </div>
                      <div className="group">
                        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.phone')}</label>
                        <input {...register("phone")} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.address')}</label>
                      <textarea {...register("address")} className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all h-24 custom-scrollbar text-sm shadow-inner" />
                    </div>

                    <div className="bg-[var(--bg-card)]/50 p-6 rounded-3xl border border-[var(--border-main)] space-y-6">
                      <p className="text-[var(--text-dim)] text-[9px] font-black uppercase tracking-[0.2em] mb-2 px-1">Financial Configuration</p>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Tax Rate (%)</label>
                          <input {...register("taxRate")} type="number" step="0.01" className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner" />
                        </div>
                        <div className="group">
                          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Service Charge (%)</label>
                          <input {...register("serviceChargeRate")} type="number" step="0.01" className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner" />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Base Currency</label>
                        <CustomDropdown options={[{id: "INR", name: "Indian Rupee (₹)"}, {id: "USD", name: "US Dollar ($)"}, {id: "AED", name: "UAE Dirham (AED)"}]} value={watch("currency")} onChange={(val) => setValue("currency", val)} placeholder="Select Currency" />
                      </div>
                    </div>
                  </>
                )}

                {type === "posPoint" && (
                  <div className="group">
                    <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.assign_branch')}</label>
                    <CustomDropdown options={(branches || []).map((b: any) => ({ id: b.id, name: localize(b.name) }))} value={watchedBranchId} onChange={(val) => setValue("branchId", val)} icon={<MdStore />} placeholder={t('dashboard.management.modal.select_branch')} />
                    {errors.branchId && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.branchId.message as string}</span>}
                  </div>
                )}

                {type === "dishes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                      <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.price')} (₹)</label>
                      <input {...register("price")} type="number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-2xl font-black shadow-inner" />
                      {errors.price && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.price.message as string}</span>}
                    </div>
                    <div className="group">
                      <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">{t('dashboard.management.modal.category')}</label>
                      <CustomDropdown options={(categories || []).map((c: any) => ({ id: c.id, name: localize(c.name) }))} value={watch("categoryId")} onChange={(val) => setValue("categoryId", val)} icon={<MdCategory />} placeholder={t('dashboard.management.modal.select_category')} />
                      {errors.categoryId && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.categoryId.message as string}</span>}
                    </div>
                  </div>
                )}

                {type === "coupon" && (
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Coupon Code</label>
                      <input {...register("code")} ref={(e) => { register("code").ref(e); if (e) firstInputRef.current = e; }} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-black uppercase tracking-widest text-2xl shadow-inner" />
                      {errors.code && <span className="text-[9px] text-red-500 font-bold mt-2 block">{errors.code.message as string}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Type</label>
                        <CustomDropdown options={[{id: "PERCENTAGE", name: "Percentage (%)"}, {id: "FIXED", name: "Fixed Amount (₹)"}]} value={watch("type")} onChange={(val) => setValue("type", val)} placeholder="Select Type" />
                      </div>
                      <div className="group">
                        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Value</label>
                        <input {...register("value")} type="number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold shadow-inner" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Min Order Amount (₹)</label>
                        <input {...register("minOrderAmount")} type="number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold shadow-inner" />
                      </div>
                      <div className="group">
                        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Max Discount (₹)</label>
                        <input {...register("maxDiscountAmount")} type="number" placeholder="Optional" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold shadow-inner" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">Expiry Date</label>
                      <input {...register("validUntil")} type="date" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold shadow-inner" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[var(--border-main)]/50 bg-[var(--bg-card)]/50 flex gap-4">
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
