import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  addTable, addCategory, addItem, updateItem, updateCategory, getCategories,
  addBranch, updateBranch, addPOSPoint, updatePOSPoint, getBranches, updateTable,
  createUser, updateUser, assignPOS, getPOSPoints
} from "../api/dashboardApi";
import { enqueueSnackbar } from "notistack";
import CustomDropdown from "../../../shared/components/CustomDropdown";
import { MdCategory, MdStore, MdPerson, MdEmail, MdLock, MdPhone, MdShield, MdComputer } from "react-icons/md";
import useManagementForm from "../hooks/useManagementForm";

const ManagementModal = ({ type, isOpen, onClose, initialData = null }) => {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;
  const firstInputRef = useRef(null);
  const [selectedPOSPoints, setSelectedPOSPoints] = useState([]);

  const { register, handleSubmit, setValue, watch, errors } = useManagementForm(type, initialData, isOpen);

  const watchedBranchId = watch("branchId");
  const watchedRole = watch("role");

  // Load Dependencies
  const { data: categories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: async () => { const res = await getCategories(); return res.data.data || res.data; },
    enabled: type === "dishes"
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
        setSelectedPOSPoints(initialData.posPermissions.map(p => p.posPointId));
      } else {
        setSelectedPOSPoints([]);
      }
    }
  }, [isOpen, initialData, type]);

  const recursiveFindId = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    const directId = obj.id || obj.Id || obj.ID || obj.tableId || obj.categoryId || obj.itemId || obj.userId;
    if (directId) return directId;
    for (const key in obj) {
      if (key.toLowerCase().endsWith("id")) return obj[key];
    }
    return null;
  };

  const mutation = useMutation({
    mutationFn: async (preparedData) => {
      if (isEdit) {
        const id = recursiveFindId(initialData);
        if (!id) throw new Error("ID_NOT_FOUND");

        switch (type) {
          case "table": return updateTable(id, { tableNo: preparedData.tableNo, seats: preparedData.seats });
          case "dishes": return updateItem(id, { itemId: id, name: preparedData.name, price: preparedData.price, categoryId: preparedData.categoryId });
          case "category": return updateCategory(id, { categoryId: id, name: preparedData.name });
          case "branch": return updateBranch(id, { ...preparedData, id });
          case "posPoint": return updatePOSPoint(id, preparedData);
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
    onSuccess: (res) => {
      const queryMap = { dishes: "items", table: "tables", category: "categories", branch: "branches", posPoint: "posPoints", user: "users" };
      queryClient.invalidateQueries({ queryKey: [queryMap[type] || type] });
      enqueueSnackbar(res.data.message || "Success", { variant: "success" });
      onClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Something went wrong", { variant: "error" });
    }
  });

  const onSubmitHandler = (data) => mutation.mutate(data);

  const togglePOSSelection = (id) => {
    setSelectedPOSPoints(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-card-alt)] p-6 rounded-3xl shadow-2xl w-full max-w-xl border border-[var(--border-main)] max-h-[90vh] overflow-y-auto custom-scrollbar relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tighter">
            {isEdit ? "Edit" : "Add"} {type === "dishes" ? "Dish" : type === "posPoint" ? "Terminal" : type === "user" ? "Staff" : type}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--border-main)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {type === "user" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5"><MdPerson /> Full Name</label>
                  <input {...register("name")} ref={(e) => { register("name").ref(e); firstInputRef.current = e; }} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors font-bold text-sm" />
                  {errors.name && <span className="text-[9px] text-red-500 font-bold">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5"><MdEmail /> Email Address</label>
                  <input {...register("email")} type="email" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm" />
                  {errors.email && <span className="text-[9px] text-red-500 font-bold">{errors.email.message}</span>}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5"><MdPhone /> Phone Number</label>
                  <input {...register("phone")} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm" />
                  {errors.phone && <span className="text-[9px] text-red-500 font-bold">{errors.phone.message}</span>}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5"><MdLock /> {isEdit ? "New Password" : "Security Password"}</label>
                  <input {...register("password")} type="password" placeholder={isEdit ? "Optional" : ""} className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm" />
                  {errors.password && <span className="text-[9px] text-red-500 font-bold">{errors.password.message}</span>}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5"><MdShield /> Role</label>
                  <CustomDropdown options={[{id: "cashier", name: "Cashier"}, {id: "manager", name: "Manager"}, {id: "admin", name: "Global Admin"}]} value={watchedRole} onChange={(val) => setValue("role", val)} placeholder="Select Role" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5"><MdStore /> Assigned Branch</label>
                  <CustomDropdown options={branches || []} value={watchedBranchId} onChange={(val) => setValue("branchId", val)} placeholder="Select Branch" />
                </div>
                {watchedBranchId && (
                  <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-main)]">
                    <label className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-3"><MdComputer /> Restricted Terminals</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                       {(branchPOSPoints || []).map(pos => (
                         <label key={pos.id} className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" checked={selectedPOSPoints.includes(pos.id)} onChange={() => togglePOSSelection(pos.id)} className="w-4 h-4 rounded border-[var(--border-main)] bg-[var(--bg-card-alt)] text-[var(--primary)] focus:ring-[var(--primary)]" />
                           <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors font-bold uppercase tracking-tight">{pos.name}</span>
                         </label>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === "table" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">Table Number</label>
                <input {...register("tableNo")} ref={(e) => { register("tableNo").ref(e); firstInputRef.current = e; }} type="number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors text-lg font-black" />
                {errors.tableNo && <span className="text-[9px] text-red-500 font-bold">{errors.tableNo.message}</span>}
              </div>
              <div>
                <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">Seats</label>
                <input {...register("seats")} type="number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors text-lg font-black" />
                {errors.seats && <span className="text-[9px] text-red-500 font-bold">{errors.seats.message}</span>}
              </div>
            </div>
          )}

          {(type === "category" || type === "dishes" || type === "branch" || type === "posPoint") && (
            <div>
              <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">{type === "posPoint" ? "Terminal Name" : "Name"}</label>
              <input {...register("name")} ref={(e) => { register("name").ref(e); firstInputRef.current = e; }} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors font-bold uppercase tracking-tighter text-sm" />
              {errors.name && <span className="text-[9px] text-red-500 font-bold">{errors.name.message}</span>}
            </div>
          )}

          {(type === "branch" || type === "posPoint") && (
            <div>
              <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">Unique Code</label>
              <input {...register("code")} type="text" placeholder={type === 'branch' ? 'e.g. BR-01' : 'e.g. POS-01'} className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-sm" />
              {errors.code && <span className="text-[9px] text-red-500 font-bold">{errors.code.message}</span>}
            </div>
          )}

          {type === "branch" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">City</label>
                  <input {...register("city")} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">Phone</label>
                  <input {...register("phone")} type="text" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">Address</label>
                <textarea {...register("address")} className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors h-20 custom-scrollbar text-sm" />
              </div>
            </>
          )}

          {type === "posPoint" && (
            <div>
              <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">Assign to Branch</label>
              <CustomDropdown options={branches || []} value={watchedBranchId} onChange={(val) => setValue("branchId", val)} icon={<MdStore />} placeholder="Select Branch" />
              {errors.branchId && <span className="text-[9px] text-red-500 font-bold">{errors.branchId.message}</span>}
            </div>
          )}

          {type === "dishes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">Price (₹)</label>
                <input {...register("price")} type="number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors text-xl font-black italic" />
                {errors.price && <span className="text-[9px] text-red-500 font-bold">{errors.price.message}</span>}
              </div>
              <div>
                <label className="block text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1.5">Category</label>
                <CustomDropdown options={categories || []} value={watch("categoryId")} onChange={(val) => setValue("categoryId", val)} icon={<MdCategory />} placeholder="Select Category" />
                {errors.categoryId && <span className="text-[9px] text-red-500 font-bold">{errors.categoryId.message}</span>}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[var(--primary)] text-[var(--bg-card)] font-black py-4 rounded-xl mt-2 hover:bg-yellow-600 transition-all uppercase tracking-[0.3em] shadow-2xl shadow-yellow-500/20 disabled:opacity-50 text-[10px]"
          >
            {mutation.isPending ? "Syncing..." : `${isEdit ? 'Update' : 'Register'} ${type === "dishes" ? "Dish" : type === "posPoint" ? "Terminal" : type === "user" ? "Staff Member" : type}`}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ManagementModal;
