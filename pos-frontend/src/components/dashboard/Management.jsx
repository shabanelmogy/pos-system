import React, { useState } from "react";
import { MdTableBar, MdCategory, MdRestaurantMenu, MdAddCircle, MdEdit, MdDelete } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, getCategories, getItems, deleteCategory, deleteItem, deleteTable } from "../../https";
import { enqueueSnackbar } from "notistack";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../shared/ConfirmModal";
import ManagementModal from "./ManagementModal";

const Management = () => {
  const [activeSubTab, setActiveSubTab] = useState("Tables");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, name: "" });
  const [editModal, setEditModal] = useState({ isOpen: false, type: "", data: null });
  
  const queryClient = useQueryClient();

  const { data: tables } = useQuery({ queryKey: ["tables"], queryFn: async () => (await getTables()).data.data });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: async () => (await getCategories()).data.data });
  const { data: items } = useQuery({ queryKey: ["items"], queryFn: async () => (await getItems()).data.data });

  const deleteItemMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
      enqueueSnackbar("Item deleted successfully", { variant: "success" });
      closeConfirm();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete item", { variant: "error" });
      closeConfirm();
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      enqueueSnackbar("Category deleted successfully", { variant: "success" });
      closeConfirm();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete category", { variant: "error" });
      closeConfirm();
    }
  });

  const deleteTableMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries(["tables"]);
      enqueueSnackbar("Table deleted successfully", { variant: "success" });
      closeConfirm();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete table", { variant: "error" });
      closeConfirm();
    }
  });

  const openConfirm = (type, id, name) => {
    setConfirmModal({ isOpen: true, type, id, name });
  };

  const closeConfirm = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "item") {
      deleteItemMutation.mutate(confirmModal.id);
    } else if (confirmModal.type === "category") {
      deleteCategoryMutation.mutate(confirmModal.id);
    } else if (confirmModal.type === "table") {
      deleteTableMutation.mutate(confirmModal.id);
    }
  };

  const openEditModal = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const subTabs = [
    { id: "Tables", icon: <MdTableBar />, label: "Tables" },
    { id: "Categories", icon: <MdCategory />, label: "Categories" },
    { id: "Items", icon: <MdRestaurantMenu />, label: "Dishes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-[#333] pb-4">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeSubTab === tab.id ? "bg-[#f6b100] text-[#1a1a1a]" : "text-[#ababab] hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {activeSubTab === "Tables" && (
            <>
              {(tables || []).map((table) => (
                <div key={table.id} className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#333] flex justify-between items-center group transition-all hover:border-[#444]">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${table.status === 'Available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      <MdTableBar size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Table {table.tableNo}</h3>
                      <p className="text-[#ababab] text-xs">{table.seats} Seats • <span className={table.status === 'Available' ? 'text-green-500' : 'text-red-500'}>{table.status}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal("table", table)} className="p-2 hover:bg-[#333] rounded-lg text-[#ababab] hover:text-white"><MdEdit /></button>
                    <button onClick={() => openConfirm("table", table.id, `Table ${table.tableNo}`)} className="p-2 hover:bg-red-500/10 rounded-lg text-[#ababab] hover:text-red-500"><MdDelete /></button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => openEditModal("table", null)}
                className="border-2 border-dashed border-[#333] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#ababab] hover:border-[#f6b100] hover:text-[#f6b100] transition-all"
              >
                <MdAddCircle size={30} />
                <span className="font-bold text-sm">Add New Table</span>
              </button>
            </>
          )}

          {activeSubTab === "Categories" && (
            <>
              {(categories || []).map((cat) => (
                <div key={cat.id} className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#333] flex justify-between items-center group transition-all hover:border-[#444]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#262626] rounded-xl text-[#f6b100]">
                      <MdCategory size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{cat.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal("category", cat)} className="p-2 hover:bg-[#333] rounded-lg text-[#ababab] hover:text-white"><MdEdit /></button>
                    <button onClick={() => openConfirm("category", cat.id, cat.name)} className="p-2 hover:bg-red-500/10 rounded-lg text-[#ababab] hover:text-red-500"><MdDelete /></button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => openEditModal("category", null)}
                className="border-2 border-dashed border-[#333] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#ababab] hover:border-[#f6b100] hover:text-[#f6b100] transition-all"
              >
                <MdAddCircle size={30} />
                <span className="font-bold text-sm">Add New Category</span>
              </button>
            </>
          )}

          {activeSubTab === "Items" && (
            <>
              {(items || []).map((item) => (
                <div key={item.id} className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#333] flex justify-between items-center group transition-all hover:border-[#444]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#262626] rounded-xl text-[#f6b100]">
                      <MdRestaurantMenu size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{item.name}</h3>
                      <p className="text-[#f6b100] text-xs font-black">₹{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal("dishes", item)} className="p-2 hover:bg-[#333] rounded-lg text-[#ababab] hover:text-white"><MdEdit /></button>
                    <button onClick={() => openConfirm("item", item.id, item.name)} className="p-2 hover:bg-red-500/10 rounded-lg text-[#ababab] hover:text-red-500"><MdDelete /></button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => openEditModal("dishes", null)}
                className="border-2 border-dashed border-[#333] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#ababab] hover:border-[#f6b100] hover:text-[#f6b100] transition-all"
              >
                <MdAddCircle size={30} />
                <span className="font-bold text-sm">Add New Dish</span>
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${confirmModal.name}"? This action cannot be undone.`}
        confirmText={deleteItemMutation.isPending || deleteCategoryMutation.isPending || deleteTableMutation.isPending ? "Deleting..." : "Delete Permanently"}
        type="danger"
      />

      <ManagementModal
        isOpen={editModal.isOpen}
        type={editModal.type}
        initialData={editModal.data}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
      />
    </div>
  );
};

export default Management;
