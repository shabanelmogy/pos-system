import React, { useState, useMemo } from "react";
import { TreeView, TreeNodeData } from "@/shared/components/TreeView";
import { 
  MdCategory, MdRestaurantMenu, MdTableBar, MdStore, MdComputer, MdPeople, 
  MdEdit, MdDelete, MdAdd, MdFolderOpen, MdArrowForward, MdRefresh
} from "react-icons/md";
import { FaTag, FaUserShield, FaUserTie, FaUserCheck, FaCalendarAlt, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getCoupons } from "@/shared/api/services/dashboardApi";
import { useTranslation } from "react-i18next";
import useLocalize from "@/shared/hooks/useLocalize";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingState, ErrorState } from "./StatusStates";

interface MasterTreeListProps {
  categories: any[];
  items: any[];
  tables: any[];
  branches: any[];
  posPoints: any[];
  usersData: any[];
  loading: boolean;
  error: any;
  onEdit: (type: string, data: any) => void;
  onDelete: (type: string, id: string, name: string) => void;
  onRetry: () => void;
}

export const MasterTreeList: React.FC<MasterTreeListProps> = ({
  categories = [],
  items = [],
  tables = [],
  branches = [],
  posPoints = [],
  usersData = [],
  loading,
  error,
  onEdit,
  onDelete,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { localize } = useLocalize();
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);

  // 1. Fetch promotional coupons locally
  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const res = await getCoupons();
      return res.data.data || res.data || [];
    },
  });

  // 2. Build the unified master tree data structure
  const treeData = useMemo(() => {
    const safeCategories = categories || [];
    const safeItems = items || [];
    const safeTables = tables || [];
    const safeBranches = branches || [];
    const safePOSPoints = posPoints || [];
    const safeUsers = usersData || [];

    const roots: TreeNodeData[] = [];

    // ==========================================
    // SUB-TREE A: MENU STRUCTURE (قائمة الطعام)
    // ==========================================
    const menuRootNode: TreeNodeData = {
      id: "menu-directory-root",
      label: "Menu Directory",
      type: "folder",
      icon: <MdFolderOpen size={16} className="text-amber-500" />,
      children: [],
      badge: safeCategories.length + safeItems.length,
      badgeType: "primary"
    };

    const catMap = new Map<string, TreeNodeData>();

    // First pass: add all categories to map
    safeCategories.forEach((cat) => {
      catMap.set(cat.id, {
        id: cat.id,
        label: localize(cat.name),
        type: "category",
        imageUrl: cat.images?.[0] || undefined,
        icon: <MdCategory size={14} className="text-amber-500" />,
        children: [],
        badge: 0,
        badgeType: "secondary",
        rawData: cat,
      });
    });

    // Group items by categoryId
    const itemsMap = new Map<string, TreeNodeData[]>();
    safeItems.forEach((item) => {
      const node: TreeNodeData = {
        id: item.id,
        label: localize(item.name),
        type: "dishes",
        imageUrl: item.images?.[0] || undefined,
        icon: <MdRestaurantMenu size={13} className="text-[var(--primary)]" />,
        badge: `₹${item.price}`,
        badgeType: "primary",
        rawData: item,
        actions: [
          {
            icon: <MdEdit size={12} />,
            label: "Edit",
            onClick: () => onEdit("dishes", item),
          },
          {
            icon: <MdDelete size={12} />,
            label: "Delete",
            onClick: () => onDelete("dishes", item.id, localize(item.name)),
            danger: true,
          },
        ],
      };
      const list = itemsMap.get(item.categoryId) || [];
      list.push(node);
      itemsMap.set(item.categoryId, list);
    });

    const categoryRoots: TreeNodeData[] = [];

    // Second pass: construct parent-child relationships and attach items
    catMap.forEach((node) => {
      const rawCat = node.rawData;

      // Add actions on hover for categories
      node.actions = [
        {
          icon: <MdAdd size={13} />,
          label: "Add Dish",
          onClick: () => onEdit("dishes", { categoryId: node.id }),
        },
        {
          icon: <MdEdit size={12} />,
          label: "Edit",
          onClick: () => onEdit("category", rawCat),
        },
        {
          icon: <MdDelete size={12} />,
          label: "Delete",
          onClick: () => onDelete("category", node.id, node.label),
          danger: true,
        },
      ];

      // Attach items as children
      const catItems = itemsMap.get(node.id) || [];
      if (catItems.length > 0) {
        node.children = [...(node.children || []), ...catItems];
        node.badge = catItems.length;
        node.badgeType = "success";
      }

      if (rawCat.parentId) {
        const parentNode = catMap.get(rawCat.parentId);
        if (parentNode) {
          parentNode.children = [...(parentNode.children || []), node];
          if (parentNode.badge === 0 || parentNode.badgeType === "secondary") {
            parentNode.badge = (parentNode.badge as number) + 1;
            parentNode.badgeType = "warning";
          }
        } else {
          categoryRoots.push(node);
        }
      } else {
        categoryRoots.push(node);
      }
    });

    // Check for uncategorized items
    const attachedItemIds = new Set<string>();
    catMap.forEach((node) => {
      if (node.children) {
        node.children.forEach((child) => {
          if (child.type === "dishes") {
            attachedItemIds.add(child.id);
          }
        });
      }
    });

    const uncategorizedItems = safeItems.filter(item => !attachedItemIds.has(item.id));
    if (uncategorizedItems.length > 0) {
      const uncategorizedNode: TreeNodeData = {
        id: "uncategorized-root",
        label: "Uncategorized Items",
        type: "category",
        icon: <MdFolderOpen size={14} className="text-gray-400" />,
        children: uncategorizedItems.map(item => ({
          id: item.id,
          label: localize(item.name),
          type: "dishes",
          imageUrl: item.images?.[0] || undefined,
          icon: <MdRestaurantMenu size={13} className="text-[var(--primary)]" />,
          badge: `₹${item.price}`,
          badgeType: "primary",
          rawData: item,
          actions: [
            {
              icon: <MdEdit size={12} />,
              label: "Edit",
              onClick: () => onEdit("dishes", item),
            },
            {
              icon: <MdDelete size={12} />,
              label: "Delete",
              onClick: () => onDelete("dishes", item.id, localize(item.name)),
              danger: true,
            },
          ],
        })),
        badge: uncategorizedItems.length,
        badgeType: "danger",
        rawData: { name: { en: "Uncategorized Items", ar: "أطباق غير مصنفة" } }
      };
      categoryRoots.push(uncategorizedNode);
    }

    menuRootNode.children = categoryRoots;
    roots.push(menuRootNode);

    // ==========================================
    // SUB-TREE B: OPERATIONS & BRANCHES (الفروع)
    // ==========================================
    const operationsRootNode: TreeNodeData = {
      id: "operations-root",
      label: "Operational Directory",
      type: "folder",
      icon: <MdStore size={16} className="text-blue-500" />,
      children: [],
      badge: safeBranches.length,
      badgeType: "primary"
    };

    const branchNodes = safeBranches.map((branch) => {
      const branchTables = safeTables.filter(t => t.branchId === branch.id);
      const branchPOS = safePOSPoints.filter(p => p.branchId === branch.id);

      const tableNode: TreeNodeData = {
        id: `branch-${branch.id}-tables`,
        label: "Tables Map",
        type: "folder",
        icon: <MdTableBar size={14} className="text-emerald-500" />,
        children: branchTables.map(t => ({
          id: t.id,
          label: t.name,
          type: "table",
          icon: <MdTableBar size={13} className="text-emerald-400" />,
          badge: `Seats: ${t.seats}`,
          badgeType: "secondary",
          rawData: { ...t, branchName: localize(branch.name) },
          actions: [
            {
              icon: <MdEdit size={12} />,
              label: "Edit",
              onClick: () => onEdit("table", t),
            },
            {
              icon: <MdDelete size={12} />,
              label: "Delete",
              onClick: () => onDelete("table", t.id, t.name),
              danger: true,
            }
          ]
        })),
        badge: branchTables.length,
        badgeType: "success"
      };

      const posNode: TreeNodeData = {
        id: `branch-${branch.id}-terminals`,
        label: "POS Terminals",
        type: "folder",
        icon: <MdComputer size={14} className="text-indigo-500" />,
        children: branchPOS.map(p => ({
          id: p.id,
          label: localize(p.name),
          type: "posPoint",
          icon: <MdComputer size={13} className="text-indigo-400" />,
          badge: p.status || "Active",
          badgeType: "success",
          rawData: { ...p, branchName: localize(branch.name) },
          actions: [
            {
              icon: <MdEdit size={12} />,
              label: "Edit",
              onClick: () => onEdit("posPoint", p),
            }
          ]
        })),
        badge: branchPOS.length,
        badgeType: "success"
      };

      return {
        id: branch.id,
        label: localize(branch.name),
        type: "branch",
        icon: <MdStore size={14} className="text-blue-400" />,
        children: [tableNode, posNode],
        badge: branchTables.length + branchPOS.length,
        badgeType: "warning",
        rawData: branch,
        actions: [
          {
            icon: <MdEdit size={12} />,
            label: "Edit",
            onClick: () => onEdit("branch", branch),
          }
        ]
      };
    });

    operationsRootNode.children = branchNodes;
    roots.push(operationsRootNode);

    // ==========================================
    // SUB-TREE C: STAFF DIRECTORY (الموظفين)
    // ==========================================
    const staffRootNode: TreeNodeData = {
      id: "staff-root",
      label: "Active Directory",
      type: "folder",
      icon: <MdPeople size={16} className="text-emerald-500" />,
      children: [],
      badge: safeUsers.length,
      badgeType: "primary"
    };

    // Group staff by roles
    const roles = ["admin", "manager", "cashier"];
    const staffByRoleNodes = roles.map(role => {
      const roleUsers = safeUsers.filter(u => u.role?.toLowerCase() === role);
      return {
        id: `role-folder-${role}`,
        label: `${role.charAt(0).toUpperCase() + role.slice(1)}s`,
        type: "folder",
        icon: <MdPeople size={14} className="text-emerald-400" />,
        children: roleUsers.map(u => ({
          id: u.id,
          label: u.name || u.username,
          type: "user",
          icon: <MdPeople size={13} className="text-emerald-400" />,
          badge: u.username,
          badgeType: "secondary",
          rawData: u,
          actions: [
            {
              icon: <MdEdit size={12} />,
              label: "Edit",
              onClick: () => onEdit("user", u),
            },
            {
              icon: <MdDelete size={12} />,
              label: "Delete",
              onClick: () => onDelete("user", u.id, u.name || u.username),
              danger: true,
            }
          ]
        })),
        badge: roleUsers.length,
        badgeType: "success"
      };
    });

    staffRootNode.children = staffByRoleNodes;
    roots.push(staffRootNode);

    // ==========================================
    // SUB-TREE D: DISCOUNT COUPONS (الكوبونات)
    // ==========================================
    if (coupons && coupons.length > 0) {
      const couponsRootNode: TreeNodeData = {
        id: "coupons-root",
        label: "Discount Coupons",
        type: "folder",
        icon: <FaTag size={14} className="text-red-500" />,
        children: coupons.map((c: any) => ({
          id: c.id,
          label: c.code,
          type: "coupon",
          icon: <FaTag size={13} className="text-red-400" />,
          badge: c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`,
          badgeType: "danger",
          rawData: c,
          actions: [
            {
              icon: <MdEdit size={12} />,
              label: "Edit",
              onClick: () => onEdit("coupon", c),
            }
          ]
        })),
        badge: coupons.length,
        badgeType: "primary"
      };
      roots.push(couponsRootNode);
    }

    return roots;
  }, [categories, items, tables, branches, posPoints, usersData, coupons, localize, onEdit, onDelete, t]);

  const handleNodeClick = (node: TreeNodeData) => {
    if (node.type !== "folder") {
      setSelectedNode(node);
    }
  };

  // Find parent category helper
  const parentCategoryName = useMemo(() => {
    if (!selectedNode || selectedNode.type !== "dishes" || !selectedNode.rawData) return "";
    const parentId = selectedNode.rawData.categoryId;
    if (!parentId) return "";
    const found = categories.find((c) => c.id === parentId);
    return found ? localize(found.name) : "";
  }, [selectedNode, categories, localize]);

  if (loading || loadingCoupons) return <LoadingState />;
  if (error) return <ErrorState label="Master Tree" onRetry={onRetry} />;

  return (
    <div className="col-span-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full overflow-hidden">
      {/* Left Column: Master Directory Tree View */}
      <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
        <TreeView
          data={treeData}
          showSearch={true}
          searchPlaceholder="Filter Master Directory..."
          headerTitle="Master Directory"
          headerSubtitle="Enterprise Infrastructure Hierarchy"
          emptyLabel="No matches found in directory."
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNode?.id}
          rightHeaderAction={
            <div className="flex gap-2">
              <button
                onClick={() => onEdit("category", null)}
                className="flex items-center gap-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                <MdAdd size={12} /> Category
              </button>
              <button
                onClick={() => onEdit("table", null)}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                <MdAdd size={12} /> Table
              </button>
            </div>
          }
        />
      </div>

      {/* Right Column: Dynamic Preview Context Panel */}
      <div className="lg:col-span-7 flex flex-col justify-stretch h-full overflow-hidden">
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2rem] p-6 shadow-sm flex flex-col justify-between h-full overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                {/* Header Section */}
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border-main)] flex items-center justify-center bg-[var(--bg-main)] shadow-inner shrink-0">
                        {selectedNode.imageUrl ? (
                          <img src={selectedNode.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[var(--primary)]">
                            {selectedNode.type === "category" && <MdCategory size={28} />}
                            {selectedNode.type === "dishes" && <MdRestaurantMenu size={28} />}
                            {selectedNode.type === "table" && <MdTableBar size={28} className="text-emerald-500" />}
                            {selectedNode.type === "branch" && <MdStore size={28} className="text-blue-500" />}
                            {selectedNode.type === "posPoint" && <MdComputer size={28} className="text-indigo-500" />}
                            {selectedNode.type === "user" && <MdPeople size={28} className="text-emerald-500" />}
                            {selectedNode.type === "coupon" && <FaTag size={24} className="text-red-500" />}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border mb-1 ${
                          selectedNode.type === "category" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                          selectedNode.type === "dishes" ? "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]" :
                          selectedNode.type === "table" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                          selectedNode.type === "branch" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                          selectedNode.type === "posPoint" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-500" :
                          selectedNode.type === "user" ? "bg-teal-500/10 border-teal-500/20 text-teal-500" :
                          "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                          {selectedNode.type === "dishes" ? "Dish (Item)" : selectedNode.type}
                        </span>
                        <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-tight leading-none mt-0.5">
                          {selectedNode.label}
                        </h2>
                      </div>
                    </div>

                    {/* Node Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(selectedNode.type === "dishes" ? "dishes" : selectedNode.type, selectedNode.rawData)}
                        className="p-2.5 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-all border border-[var(--border-main)]/60"
                        title="Edit Info"
                      >
                        <MdEdit size={16} />
                      </button>
                      {selectedNode.type !== "branch" && selectedNode.type !== "posPoint" && (
                        <button
                          onClick={() => onDelete(selectedNode.type === "dishes" ? "dishes" : selectedNode.type, selectedNode.id, selectedNode.label)}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 rounded-xl transition-all border border-red-500/20"
                          title="Delete Permanently"
                        >
                          <MdDelete size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <hr className="border-[var(--border-main)]/50" />

                  {/* Context Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category / Item Fields */}
                    {(selectedNode.type === "category" || selectedNode.type === "dishes") && (
                      <>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">English Name</p>
                          <p className="text-[var(--text-main)] font-black text-xs uppercase">{selectedNode.rawData?.name?.en || "N/A"}</p>
                        </div>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Arabic Name</p>
                          <p className="text-[var(--text-main)] font-black text-xs" dir="rtl">{selectedNode.rawData?.name?.ar || "غير متوفر"}</p>
                        </div>
                        {parentCategoryName && (
                          <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1 col-span-full">
                            <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Category</p>
                            <p className="text-[var(--text-main)] font-black text-xs uppercase">{parentCategoryName}</p>
                          </div>
                        )}
                        {selectedNode.type === "dishes" && (
                          <div className="p-4 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/20 space-y-1 col-span-full flex items-center justify-between">
                            <div>
                              <p className="text-[var(--primary)] text-[8px] font-black uppercase tracking-widest">Dish Price</p>
                              <p className="text-[var(--text-main)] font-black text-lg">₹{selectedNode.rawData?.price}</p>
                            </div>
                            <span className="bg-[var(--primary)] text-[var(--primary-fg)] font-black px-3 py-1 rounded-xl text-xs shadow-md">Active</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Table Fields */}
                    {selectedNode.type === "table" && (
                      <>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Seating Capacity</p>
                          <p className="text-[var(--text-main)] font-black text-xs">{selectedNode.rawData?.seats} Seats</p>
                        </div>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Branch Location</p>
                          <p className="text-[var(--text-main)] font-black text-xs uppercase">{selectedNode.rawData?.branchName || "Main Branch"}</p>
                        </div>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1 col-span-full flex items-center justify-between">
                          <div>
                            <p className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Seating Status</p>
                            <p className="text-[var(--text-main)] font-black text-xs uppercase">{selectedNode.rawData?.status || "Available"}</p>
                          </div>
                          <FaUserCheck className="text-emerald-500" size={18} />
                        </div>
                      </>
                    )}

                    {/* Branch Fields */}
                    {selectedNode.type === "branch" && (
                      <>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Status</p>
                          <p className="text-emerald-500 font-black text-xs uppercase">Operational</p>
                        </div>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Infrastructure ID</p>
                          <p className="text-[var(--text-main)] font-black text-xs truncate uppercase">{selectedNode.rawData?.id}</p>
                        </div>
                      </>
                    )}

                    {/* POS Point Fields */}
                    {selectedNode.type === "posPoint" && (
                      <>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Hardware Node</p>
                          <p className="text-[var(--text-main)] font-black text-xs uppercase">{selectedNode.rawData?.branchName || "Active Branch"}</p>
                        </div>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Infrastructure Status</p>
                          <p className="text-emerald-500 font-black text-xs uppercase">{selectedNode.rawData?.status || "Online"}</p>
                        </div>
                      </>
                    )}

                    {/* User / Staff Fields */}
                    {selectedNode.type === "user" && (
                      <>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">System Role</p>
                          <p className="text-[var(--text-main)] font-black text-xs uppercase flex items-center gap-1.5 mt-0.5">
                            {selectedNode.rawData?.role === "admin" ? <FaUserShield className="text-red-500" /> : <FaUserTie className="text-blue-500" />}
                            {selectedNode.rawData?.role}
                          </p>
                        </div>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">System Username</p>
                          <p className="text-[var(--text-main)] font-black text-xs">{selectedNode.rawData?.username}</p>
                        </div>
                        {selectedNode.rawData?.email && (
                          <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1 col-span-full">
                            <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">System Email</p>
                            <p className="text-[var(--text-main)] font-black text-xs truncate">{selectedNode.rawData?.email}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Coupon Fields */}
                    {selectedNode.type === "coupon" && (
                      <>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Coupon Code</p>
                          <p className="text-red-400 font-black text-xs uppercase">{selectedNode.rawData?.code}</p>
                        </div>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Coupon Value</p>
                          <p className="text-[var(--text-main)] font-black text-xs">
                            {selectedNode.rawData?.type === "PERCENTAGE" ? `${selectedNode.rawData?.value}% OFF` : `₹${selectedNode.rawData?.value} OFF`}
                          </p>
                        </div>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Minimum Purchase</p>
                          <p className="text-[var(--text-main)] font-black text-xs">₹{selectedNode.rawData?.minOrderAmount || 0}</p>
                        </div>
                        <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1 flex items-center justify-between">
                          <div>
                            <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">State</p>
                            <p className="text-[var(--text-main)] font-black text-xs">{selectedNode.rawData?.isActive ? "Active" : "Expired"}</p>
                          </div>
                          {selectedNode.rawData?.isActive ? <FaToggleOn size={20} className="text-emerald-500" /> : <FaToggleOff size={20} className="text-[var(--text-dim)]" />}
                        </div>
                        {selectedNode.rawData?.validUntil && (
                          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-1 col-span-full flex items-center justify-between">
                            <div>
                              <p className="text-red-400 text-[8px] font-black uppercase tracking-widest">Valid Until</p>
                              <p className="text-[var(--text-main)] font-black text-xs flex items-center gap-1.5 mt-0.5">
                                <FaCalendarAlt /> {new Date(selectedNode.rawData?.validUntil).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Node-Specific Add/Quick Controls */}
                <div className="pt-6">
                  {selectedNode.type === "category" && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => onEdit("dishes", { categoryId: selectedNode.id })}
                        className="flex-1 bg-[var(--primary)] text-[var(--primary-fg)] py-3 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <MdAdd size={16} /> Add Dish in Category
                      </button>
                      <button
                        onClick={() => onEdit("category", { parentId: selectedNode.id })}
                        className="flex-1 border border-[var(--border-main)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] py-3 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <MdAdd size={16} /> Add Subcategory
                      </button>
                    </div>
                  )}

                  {selectedNode.type === "branch" && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => onEdit("table", { branchId: selectedNode.id })}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <MdAdd size={16} /> Add Table to Branch
                      </button>
                      <button
                        onClick={() => onEdit("posPoint", { branchId: selectedNode.id })}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <MdAdd size={16} /> Add POS Point to Branch
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-[var(--bg-card-alt)] flex items-center justify-center border border-[var(--border-main)] text-[var(--text-dim)]/20 shadow-inner">
                  <MdFolderOpen size={40} />
                </div>
                <div>
                  <h3 className="text-[var(--text-main)] font-black text-sm uppercase tracking-wider">No Selection</h3>
                  <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-1 max-w-[280px] leading-relaxed">
                    Select any category, item, dining table, branch, terminal, staff member, or coupon from the master tree hierarchy on the left to inspect its parameters.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[var(--primary)] tracking-widest">
                  Explore Structure <MdArrowForward size={14} />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
