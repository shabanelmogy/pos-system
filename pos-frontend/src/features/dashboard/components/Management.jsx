import React, { useState } from "react";
import { MdTableBar, MdCategory, MdRestaurantMenu, MdAddCircle, MdEdit, MdDelete, MdStore, MdComputer, MdOutlineInventory2, MdPeople, MdEmail, MdPhone, MdChevronRight, MdShield, MdSearch, MdRefresh } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, getCategories, getItems, getBranches, getPOSPoints, getUsers, deleteCategory, deleteItem, deleteTable, deleteUser } from "../api/dashboardApi";
import { enqueueSnackbar } from "notistack";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import ManagementModal from "./ManagementModal";

const Management = () => {
  const [activeSubTab, setActiveSubTab] = useState("Tables");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, name: "" });
  const [editModal, setEditModal] = useState({ isOpen: false, type: "", data: null });
  const [searchQuery, setSearchQuery] = useState("");
  
  const queryClient = useQueryClient();

  const { data: tables, refetch: refetchTables } = useQuery({ queryKey: ["tables"], queryFn: async () => (await getTables()).data.data });
  const { data: categories, refetch: refetchCategories } = useQuery({ queryKey: ["categories"], queryFn: async () => (await getCategories()).data.data });
  const { data: items, refetch: refetchItems } = useQuery({ queryKey: ["items"], queryFn: async () => (await getItems()).data.data });
  const { data: branches, refetch: refetchBranches } = useQuery({ queryKey: ["branches"], queryFn: async () => (await getBranches()).data.data });
  const { data: posPoints, refetch: refetchPOSPoints } = useQuery({ queryKey: ["posPoints"], queryFn: async () => (await getPOSPoints()).data.data });
  const { data: usersData, refetch: refetchUsers } = useQuery({ queryKey: ["users"], queryFn: async () => (await getUsers()).data.data });

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

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      enqueueSnackbar("Staff member deleted successfully", { variant: "success" });
      closeConfirm();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete user", { variant: "error" });
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
    } else if (confirmModal.type === "user") {
      deleteUserMutation.mutate(confirmModal.id);
    }
  };

  const openEditModal = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleManualRefresh = () => {
    if (activeSubTab === "Tables") refetchTables();
    if (activeSubTab === "Categories") refetchCategories();
    if (activeSubTab === "Items") refetchItems();
    if (activeSubTab === "Branches") refetchBranches();
    if (activeSubTab === "POSPoints") refetchPOSPoints();
    if (activeSubTab === "Users") refetchUsers();
    enqueueSnackbar("Syncing data...", { variant: "info", autoHideDuration: 1000 });
  };

  const subTabs = [
    { id: "Tables", icon: <MdTableBar />, label: "Tables" },
    { id: "Categories", icon: <MdCategory />, label: "Categories" },
    { id: "Items", icon: <MdRestaurantMenu />, label: "Dishes" },
    { id: "Branches", icon: <MdStore />, label: "Branches" },
    { id: "POSPoints", icon: <MdComputer />, label: "Terminals" },
    { id: "Users", icon: <MdPeople />, label: "Staff" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const renderEmptyState = (label) => (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-main)] text-[var(--text-dim)]">
        <MdOutlineInventory2 size={40} />
      </div>
      <h3 className="text-[var(--text-main)] text-xl font-bold uppercase tracking-tighter">No {label} Found</h3>
      <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xs">Start building your enterprise by adding your first {label.toLowerCase()}.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-4">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeSubTab === tab.id 
                  ? "bg-[var(--primary)] text-[var(--bg-card)] shadow-lg shadow-[var(--primary)]/20" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
           {activeSubTab === "Users" && (
              <div className="relative group flex-1 lg:flex-none">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl py-2.5 pl-10 pr-4 text-[var(--text-main)] text-xs focus:outline-none focus:border-[var(--primary)] w-full lg:w-48 transition-all"
                />
             </div>
           )}
           <div className="flex items-center gap-2">
              <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={handleManualRefresh}
                 title="Refresh Data"
                 className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
              >
                 <MdRefresh size={20} />
              </motion.button>
              <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => openEditModal(activeSubTab === "Users" ? "user" : activeSubTab.toLowerCase(), null)}
                 className="bg-[var(--primary)] text-[var(--bg-card)] px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                 <MdAddCircle size={16} /> New {activeSubTab === "Users" ? "Staff" : activeSubTab.slice(0, -1)}
              </motion.button>
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="hidden"
           className={activeSubTab === "Users" ? "w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}
        >
          {/* TABLES SECTION */}
          {activeSubTab === "Tables" && (
            <>
               {(tables || []).map((table) => (
                <motion.div variants={itemVariants} key={table.id} className="relative bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-main)] flex flex-col gap-4 group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl hover:shadow-[var(--primary)]/5">
                  <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl ${table.status === 'Available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      <MdTableBar size={32} />
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal("table", table)} className="p-3 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><MdEdit size={18} /></button>
                      <button onClick={() => openConfirm("table", table.id, `Table ${table.tableNo}`)} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors"><MdDelete size={18} /></button>
                    </div>
                   </div>
                  <div>
                    <h3 className="text-[var(--text-main)] text-xl font-black tracking-tighter">TABLE {table.tableNo}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">{table.seats} Seats</span>
                      <span className="w-1 h-1 bg-[var(--border-main)] rounded-full"></span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${table.status === 'Available' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {table.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {tables?.length === 0 && renderEmptyState("Tables")}
            </>
          )}

          {/* CATEGORIES SECTION */}
          {activeSubTab === "Categories" && (
            <>
               {(categories || []).map((cat) => (
                <motion.div variants={itemVariants} key={cat.id} className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-main)] flex items-center justify-between group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-gradient-to-br from-[var(--bg-card-alt)] to-[var(--bg-card)] rounded-2xl text-[var(--primary)] shadow-xl">
                      <MdCategory size={30} />
                    </div>
                    <div>
                      <h3 className="text-[var(--text-main)] text-lg font-black tracking-tighter uppercase">{cat.name}</h3>
                      <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">Category</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal("category", cat)} className="p-2.5 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><MdEdit size={16} /></button>
                    <button onClick={() => openConfirm("category", cat.id, cat.name)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors"><MdDelete size={16} /></button>
                  </div>
                </motion.div>
              ))}
              {categories?.length === 0 && renderEmptyState("Categories")}
            </>
          )}

          {/* ITEMS SECTION */}
          {activeSubTab === "Items" && (
            <>
               {(items || []).map((item) => (
                <motion.div variants={itemVariants} key={item.id} className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-main)] flex flex-col gap-3 group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-gradient-to-br from-[var(--bg-card-alt)] to-[var(--bg-card)] rounded-2xl text-[var(--primary)] shadow-xl">
                      <MdRestaurantMenu size={32} />
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal("dishes", item)} className="p-2.5 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]"><MdEdit size={16} /></button>
                      <button onClick={() => openConfirm("item", item.id, item.name)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500"><MdDelete size={16} /></button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[var(--text-main)] text-xl font-black tracking-tighter uppercase line-clamp-1">{item.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[var(--primary)] text-lg font-black italic">₹{item.price}</p>
                      <span className="text-[10px] bg-[var(--bg-card-alt)] text-[var(--text-muted)] px-3 py-1 rounded-full font-black uppercase tracking-widest">Dish</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {items?.length === 0 && renderEmptyState("Dishes")}
            </>
          )}

          {/* BRANCHES SECTION */}
          {activeSubTab === "Branches" && (
            <>
               {(branches || []).map((branch) => (
                <motion.div variants={itemVariants} key={branch.id} className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-main)] flex flex-col gap-4 group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 text-[var(--primary)] rounded-2xl border border-[var(--primary)]/20 shadow-lg">
                      <MdStore size={32} />
                    </div>
                    <button onClick={() => openEditModal("branch", branch)} className="p-3 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all"><MdEdit size={18} /></button>
                   </div>
                  <div>
                    <h3 className="text-[var(--text-main)] text-xl font-black tracking-tighter uppercase">{branch.name}</h3>
                    <p className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.2em] mt-1">{branch.code}</p>
                    <div className="mt-4 flex flex-col gap-1">
                       <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          {branch.city || "Primary Location"}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {branches?.length === 0 && renderEmptyState("Branches")}
            </>
          )}

          {/* POS POINTS SECTION */}
          {activeSubTab === "POSPoints" && (
            <>
               {(posPoints || []).map((pos) => (
                <motion.div variants={itemVariants} key={pos.id} className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-main)] flex flex-col gap-4 group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-lg">
                      <MdComputer size={32} />
                    </div>
                    <button onClick={() => openEditModal("posPoint", pos)} className="p-3 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all"><MdEdit size={18} /></button>
                   </div>
                  <div>
                    <h3 className="text-[var(--text-main)] text-xl font-black tracking-tighter uppercase">{pos.name}</h3>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{pos.code}</p>
                    <div className="mt-4 flex items-center gap-2">
                       <span className="px-3 py-1 bg-[var(--bg-card-alt)] rounded-full text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Active Terminal</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {posPoints?.length === 0 && renderEmptyState("Terminals")}
            </>
          )}

          {/* USERS SECTION (DATA GRID) */}
           {activeSubTab === "Users" && (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-card-alt)]/50 border-b border-[var(--border-main)]">
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">Staff Member</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">Role & Access</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">Location</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">Contact Info</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(usersData || []).filter(u => 
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((user, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        key={user.id} 
                         className="border-b border-[var(--bg-card-alt)] hover:bg-[var(--bg-card-alt)]/30 transition-all group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-400 border border-emerald-500/10 shadow-lg">
                               <MdPeople size={20} />
                            </div>
                            <div>
                              <p className="text-[var(--text-main)] font-black uppercase tracking-tight text-sm group-hover:text-emerald-400 transition-colors">{user.name}</p>
                              <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest mt-0.5">ID: {user.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                <MdShield className="text-[var(--primary)]" size={14} />
                                <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-[var(--primary)]/10">
                                  {user.role}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight">
                                <MdComputer size={14} className="text-indigo-400" />
                                {user.posPermissions?.length || "All"} Terminals Authorized
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                 <MdStore size={18} />
                              </div>
                              <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest">{user.branch?.name || "Global"}</p>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                              <MdEmail size={14} className="text-[var(--text-dim)]" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                              <MdPhone size={14} className="text-[var(--text-dim)]" />
                              {user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openEditModal("user", user)}
                                className="p-3 bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-[var(--bg-card)] rounded-xl transition-all border border-[var(--primary)]/20"
                              >
                                <MdEdit size={18} />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openConfirm("user", user.id, user.name)}
                                className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                              >
                                <MdDelete size={18} />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-3 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl border border-[var(--border-main)] transition-all"
                              >
                                <MdChevronRight size={18} />
                              </motion.button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                    {usersData?.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                           {renderEmptyState("Staff Members")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${confirmModal.name}"? This action cannot be undone.`}
        confirmText={deleteItemMutation.isPending || deleteCategoryMutation.isPending || deleteTableMutation.isPending || deleteUserMutation.isPending ? "Deleting..." : "Delete Permanently"}
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
