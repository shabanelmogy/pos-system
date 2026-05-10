import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addTable, addCategory, addItem, updateItem, updateCategory, getCategories } from "../../https";
import { enqueueSnackbar } from "notistack";

const ManagementModal = ({ type, isOpen, onClose, initialData = null }) => {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const { data: categories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: async () => (await getCategories()).data.data,
    enabled: type === "dishes"
  });

  const [formData, setFormData] = useState({
    tableNo: "", seats: "",
    name: "",
    price: "", categoryId: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        price: initialData.price?.toString() || "",
      });
    } else {
      setFormData({ tableNo: "", seats: "", name: "", price: "", categoryId: "" });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      const preparedData = { ...data };
      if (preparedData.price) preparedData.price = parseFloat(preparedData.price);
      if (preparedData.tableNo) preparedData.tableNo = parseInt(preparedData.tableNo);
      if (preparedData.seats) preparedData.seats = parseInt(preparedData.seats);

      if (isEdit) {
        if (type === "dishes") return updateItem({ itemId: initialData.id, ...preparedData });
        if (type === "category") return updateCategory({ categoryId: initialData.id, ...preparedData });
        if (type === "table") return updateTable({ tableId: initialData.id, ...preparedData });
      } else {
        if (type === "table") return addTable(preparedData);
        if (type === "category") return addCategory(preparedData);
        if (type === "dishes") return addItem(preparedData);
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries([type === "dishes" ? "items" : type === "table" ? "tables" : "categories"]);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#262626] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-[#444]"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter">
            {isEdit ? "Edit" : "Add"} {type === "dishes" ? "Dish" : type}
          </h2>
          <button onClick={onClose} className="text-[#ababab] hover:text-white transition-colors">
            <IoMdClose size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {type === "table" && (
            <>
              <div>
                <label className="block text-[#ababab] text-xs font-bold uppercase mb-2">Table Number</label>
                <input name="tableNo" type="number" value={formData.tableNo} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
              </div>
              <div>
                <label className="block text-[#ababab] text-xs font-bold uppercase mb-2">Seats</label>
                <input name="seats" type="number" value={formData.seats} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
              </div>
            </>
          )}

          {(type === "category" || type === "dishes") && (
            <div>
              <label className="block text-[#ababab] text-xs font-bold uppercase mb-2">{type === "category" ? "Category" : "Dish"} Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
            </div>
          )}

          {type === "dishes" && (
            <>
              <div>
                <label className="block text-[#ababab] text-xs font-bold uppercase mb-2">Price (₹)</label>
                <input name="price" type="number" value={formData.price} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors" />
              </div>
              <div>
                <label className="block text-[#ababab] text-xs font-bold uppercase mb-2">Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-[#f6b100] transition-colors">
                  <option value="">Select Category</option>
                  {(categories || []).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#f6b100] text-[#1a1a1a] font-black py-4 rounded-xl mt-4 hover:bg-yellow-600 transition-all uppercase tracking-widest shadow-lg shadow-yellow-500/20 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : `${isEdit ? 'Update' : 'Create'} ${type === "dishes" ? "Dish" : type}`}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ManagementModal;
