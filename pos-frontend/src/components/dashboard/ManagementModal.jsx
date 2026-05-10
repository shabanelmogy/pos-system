import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  addTable, addCategory, addItem, updateItem, updateCategory, getCategories,
  addBranch, updateBranch, addPOSPoint, updatePOSPoint, getBranches, updateTable,
  createUser, updateUser, assignPOS, getPOSPoints
} from "../../https";
import { enqueueSnackbar } from "notistack";
import CustomDropdown from "../shared/CustomDropdown";
import { MdCategory, MdStore, MdPerson, MdEmail, MdLock, MdPhone, MdShield, MdComputer } from "react-icons/md";

const ManagementModal = ({ type, isOpen, onClose, initialData = null }) => {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const { data: categories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: async () => (await getCategories()).data.data,
    enabled: type === "dishes"
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => (await getBranches()).data.data,
    enabled: type === "posPoint" || type === "user"
  });

  const [formData, setFormData] = useState({
    tableNo: "", seats: "",
    name: "",
    price: "", categoryId: "",
    code: "", phone: "", email: "", address: "", city: "",
    branchId: "", role: "cashier", password: ""
  });

  const [selectedPOSPoints, setSelectedPOSPoints] = useState([]);

  const { data: branchPOSPoints } = useQuery({
    queryKey: ["posPoints", formData.branchId],
    queryFn: async () => (await getPOSPoints(formData.branchId)).data.data,
    enabled: type === "user" && !!formData.branchId
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        price: initialData.price?.toString() || "",
        password: "" // Don't show password
      });
      if (type === "user" && initialData.posPermissions) {
        setSelectedPOSPoints(initialData.posPermissions.map(p => p.posPointId));
      }
    } else {
      setFormData({ 
        tableNo: "", seats: "", name: "", price: "", categoryId: "",
        code: "", phone: "", email: "", address: "", city: "",
        branchId: "", role: "cashier", password: ""
      });
      setSelectedPOSPoints([]);
    }
  }, [initialData, isOpen, type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const preparedData = { ...data };
      if (preparedData.price) preparedData.price = parseFloat(preparedData.price);
      if (preparedData.tableNo) preparedData.tableNo = parseInt(preparedData.tableNo);
      if (preparedData.seats) preparedData.seats = parseInt(preparedData.seats);

      if (isEdit) {
        if (type === "dishes") return updateItem({ itemId: initialData.id, ...preparedData });
        if (type === "category") return updateCategory({ categoryId: initialData.id, ...preparedData });
        if (type === "table") return updateTable({ tableId: initialData.id, ...preparedData });
        if (type === "branch") return updateBranch({ id: initialData.id, ...preparedData });
        if (type === "posPoint") return updatePOSPoint({ id: initialData.id, ...preparedData });
        if (type === "user") {
          const res = await updateUser({ userId: initialData.id, ...preparedData });
          await assignPOS({ userId: initialData.id, posPointIds: selectedPOSPoints });
          return res;
        }
      } else {
        if (type === "table") return addTable(preparedData);
        if (type === "category") return addCategory(preparedData);
        if (type === "dishes") return addItem(preparedData);
        if (type === "branch") return addBranch(preparedData);
        if (type === "posPoint") return addPOSPoint(preparedData);
        if (type === "user") {
          const res = await createUser(preparedData);
          if (res.data.data.id) {
            await assignPOS({ userId: res.data.data.id, posPointIds: selectedPOSPoints });
          }
          return res;
        }
      }
    },
    onSuccess: (res) => {
      const queryMap = {
        dishes: "items",
        table: "tables",
        category: "categories",
        branch: "branches",
        posPoint: "posPoints",
        user: "users"
      };
      queryClient.invalidateQueries([queryMap[type] || type]);
      enqueueSnackbar(res.data.message || (isEdit ? "Updated successfully!" : "Added successfully!"), { variant: "success" });
      onClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Something went wrong", { variant: "error" });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const togglePOSSelection = (id) => {
    setSelectedPOSPoints(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#262626] p-8 rounded-[3rem] shadow-2xl w-full max-w-xl border border-[#444] max-h-[90vh] overflow-y-auto custom-scrollbar relative"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white text-3xl font-black uppercase tracking-tighter">
            {isEdit ? "Edit" : "Add"} {type === "dishes" ? "Dish" : type === "posPoint" ? "Terminal" : type === "user" ? "Staff" : type}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#333] rounded-full text-[#ababab] hover:text-white transition-colors">
            <IoMdClose size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === "user" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2"><MdPerson /> Full Name</label>
                  <input name="name" type="text" value={formData.name} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors font-bold" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2"><MdEmail /> Email Address</label>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2"><MdPhone /> Phone Number</label>
                  <input name="phone" type="text" value={formData.phone} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2"><MdLock /> {isEdit ? "New Password (Optional)" : "Security Password"}</label>
                  <input name="password" type="password" value={formData.password} onChange={handleInputChange} required={!isEdit} placeholder={isEdit ? "Leave blank to keep current" : ""} className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2"><MdShield /> Role</label>
                  <CustomDropdown 
                    options={[{id: "cashier", name: "Cashier"}, {id: "manager", name: "Manager"}, {id: "admin", name: "Global Admin"}]}
                    value={formData.role}
                    onChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                    placeholder="Select Role"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2"><MdStore /> Assigned Branch</label>
                  <CustomDropdown 
                    options={branches || []}
                    value={formData.branchId}
                    onChange={(val) => setFormData(prev => ({ ...prev, branchId: val }))}
                    placeholder="Select Branch"
                  />
                </div>
                
                {formData.branchId && (
                  <div className="bg-[#1a1a1a] p-5 rounded-3xl border border-[#333]">
                    <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-4"><MdComputer /> Restricted Terminals</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                       {(branchPOSPoints || []).map(pos => (
                         <label key={pos.id} className="flex items-center gap-3 cursor-pointer group">
                           <input 
                             type="checkbox" 
                             checked={selectedPOSPoints.includes(pos.id)} 
                             onChange={() => togglePOSSelection(pos.id)}
                             className="w-4 h-4 rounded border-[#333] bg-[#262626] text-[#f6b100] focus:ring-[#f6b100]"
                           />
                           <span className="text-xs text-[#ababab] group-hover:text-white transition-colors font-bold uppercase tracking-tight">{pos.name}</span>
                         </label>
                       ))}
                       {branchPOSPoints?.length === 0 && <p className="text-[10px] text-[#444] font-bold uppercase italic">No terminals in branch</p>}
                    </div>
                    <p className="text-[9px] text-[#444] mt-4 font-bold uppercase">If none selected, staff can use all terminals.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === "table" && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">Table Number</label>
                <input name="tableNo" type="number" value={formData.tableNo} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors text-xl font-black" />
              </div>
              <div>
                <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">Seats</label>
                <input name="seats" type="number" value={formData.seats} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors text-xl font-black" />
              </div>
            </div>
          )}

          {(type === "category" || type === "dishes" || type === "branch" || type === "posPoint") && (
            <div>
              <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">
                {type === "posPoint" ? "Terminal Name" : "Name"}
              </label>
              <input name="name" type="text" value={formData.name} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors font-bold uppercase tracking-tighter" />
            </div>
          )}

          {(type === "branch" || type === "posPoint") && (
            <div>
              <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">Unique Code</label>
              <input name="code" type="text" value={formData.code} onChange={handleInputChange} required placeholder={type === 'branch' ? 'e.g. BR-01' : 'e.g. POS-01'} className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors font-mono" />
            </div>
          )}

          {type === "branch" && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">City</label>
                  <input name="city" type="text" value={formData.city} onChange={handleInputChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
                </div>
                <div>
                  <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">Phone</label>
                  <input name="phone" type="text" value={formData.phone} onChange={handleInputChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors h-24 custom-scrollbar" />
              </div>
            </>
          )}

          {type === "posPoint" && (
            <div>
              <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">Assign to Branch</label>
              <CustomDropdown 
                options={branches || []}
                value={formData.branchId}
                onChange={(val) => setFormData(prev => ({ ...prev, branchId: val }))}
                icon={<MdStore />}
                placeholder="Select Branch"
              />
            </div>
          )}

          {type === "dishes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">Price (₹)</label>
                <input name="price" type="number" value={formData.price} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors text-2xl font-black italic" />
              </div>
              <div>
                <label className="block text-[#ababab] text-[10px] font-black uppercase tracking-widest mb-2">Category</label>
                <CustomDropdown 
                  options={categories || []}
                  value={formData.categoryId}
                  onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))}
                  icon={<MdCategory />}
                  placeholder="Select Category"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#f6b100] text-[#1a1a1a] font-black py-5 rounded-2xl mt-4 hover:bg-yellow-600 transition-all uppercase tracking-[0.3em] shadow-2xl shadow-yellow-500/20 disabled:opacity-50 text-xs"
          >
            {mutation.isPending ? "Syncing..." : `${isEdit ? 'Update' : 'Register'} ${type === "dishes" ? "Dish" : type === "posPoint" ? "Terminal" : type === "user" ? "Staff Member" : type}`}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ManagementModal;
