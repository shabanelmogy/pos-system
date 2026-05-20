import React, { useState, useMemo } from "react";
import { TreeView, TreeNodeData } from "@/shared/components/TreeView";
import { MdCategory, MdRestaurantMenu, MdEdit, MdDelete, MdAdd, MdFolderOpen, MdArrowForward } from "react-icons/md";
import { FaLeaf } from "react-icons/fa";
import { useTranslation } from "../../../../../../node_modules/react-i18next";
import useLocalize from "@/shared/hooks/useLocalize";
import { motion, AnimatePresence } from "framer-motion";

import { LoadingState, ErrorState } from "./StatusStates";

interface MenuTreeListProps {
  categories: any[];
  items: any[];
  loading: boolean;
  error: any;
  onEdit: (type: string, data: any) => void;
  onDelete: (type: string, id: string, name: string) => void;
  onRetry: () => void;
}

export const MenuTreeList: React.FC<MenuTreeListProps> = ({
  categories = [],
  items = [],
  loading,
  error,
  onEdit,
  onDelete,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { localize } = useLocalize();
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);

  // 1. Transform flat categories and items into recursive TreeNodeData structure
  const treeData = useMemo(() => {
    const safeCategories = categories || [];
    const safeItems = items || [];

    if (safeCategories.length === 0) return [];

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
        type: "item",
        imageUrl: item.images?.[0] || undefined,
        icon: <MdRestaurantMenu size={13} className="text-[var(--primary)]" />,
        badge: `₹${item.price}`,
        badgeType: "primary",
        rawData: item,
        actions: [
          {
            icon: <MdEdit size={12} />,
            label: t("dashboard.management.lists.edit") || "Edit",
            onClick: () => onEdit("dishes", item),
          },
          {
            icon: <MdDelete size={12} />,
            label: t("dashboard.management.lists.delete") || "Delete",
            onClick: () => onDelete("dishes", item.id, localize(item.name)),
            danger: true,
          },
        ],
      };
      const list = itemsMap.get(item.categoryId) || [];
      list.push(node);
      itemsMap.set(item.categoryId, list);
    });

    const roots: TreeNodeData[] = [];

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
          label: t("dashboard.management.lists.edit") || "Edit",
          onClick: () => onEdit("category", rawCat),
        },
        {
          icon: <MdDelete size={12} />,
          label: t("dashboard.management.lists.delete") || "Delete",
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
          // Recalculate subcategories count badge if no direct items
          if (parentNode.badge === 0 || parentNode.badgeType === "secondary") {
            parentNode.badge = (parentNode.badge as number) + 1;
            parentNode.badgeType = "warning";
          }
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // 3. Track which items are attached to valid categories to catch any orphaned/uncategorized ones
    const attachedItemIds = new Set<string>();
    catMap.forEach((node) => {
      if (node.children) {
        node.children.forEach((child) => {
          if (child.type === "item") {
            attachedItemIds.add(child.id);
          }
        });
      }
    });

    const uncategorizedItems = safeItems.filter(item => !attachedItemIds.has(item.id));
    if (uncategorizedItems.length > 0) {
      const uncategorizedNode: TreeNodeData = {
        id: "uncategorized-root",
        label: t("dashboard.management.tree.uncategorized", "Uncategorized Items"),
        type: "category",
        icon: <MdFolderOpen size={14} className="text-gray-400" />,
        children: uncategorizedItems.map(item => ({
          id: item.id,
          label: localize(item.name),
          type: "item",
          imageUrl: item.images?.[0] || undefined,
          icon: <MdRestaurantMenu size={13} className="text-[var(--primary)]" />,
          badge: `₹${item.price}`,
          badgeType: "primary",
          rawData: item,
          actions: [
            {
              icon: <MdEdit size={12} />,
              label: t("dashboard.management.lists.edit") || "Edit",
              onClick: () => onEdit("dishes", item),
            },
            {
              icon: <MdDelete size={12} />,
              label: t("dashboard.management.lists.delete") || "Delete",
              onClick: () => onDelete("dishes", item.id, localize(item.name)),
              danger: true,
            },
          ],
        })),
        badge: uncategorizedItems.length,
        badgeType: "danger",
        rawData: { name: { en: "Uncategorized Items", ar: "أطباق غير مصنفة" } }
      };
      roots.push(uncategorizedNode);
    }

    return roots;
  }, [categories, items, localize, onEdit, onDelete, t]);

  const handleNodeClick = (node: TreeNodeData) => {
    setSelectedNode(node);
  };

  // Find parent category helper
  const parentCategoryName = useMemo(() => {
    if (!selectedNode || !selectedNode.rawData) return "";
    const parentId = selectedNode.rawData.parentId || selectedNode.rawData.categoryId;
    if (!parentId) return "";
    const found = categories.find((c) => c.id === parentId);
    return found ? localize(found.name) : "";
  }, [selectedNode, categories, localize]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState label="Menu Tree" onRetry={onRetry} />;

  return (
    <div className="col-span-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full overflow-hidden">
      {/* Left Column: Premium Interactive Tree View */}
      <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
        <TreeView
          data={treeData}
          showSearch={true}
          searchPlaceholder="Search category or dish..."
          headerTitle="Menu Structure"
          headerSubtitle="Categories & Dishes Hierarchy"
          emptyLabel="No categories or dishes found."
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNode?.id}
          rightHeaderAction={
            <button
              onClick={() => onEdit("category", null)}
              className="flex items-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-lg shadow-[var(--primary)]/15 active:scale-95"
            >
              <MdAdd size={14} /> Add Root Category
            </button>
          }
        />
      </div>

      {/* Right Column: Premium Interactive Details Panel */}
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
                {/* Header Information */}
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border-main)] flex items-center justify-center bg-[var(--bg-main)] shadow-inner shrink-0">
                        {selectedNode.imageUrl ? (
                          <img src={selectedNode.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[var(--primary)]">
                            {selectedNode.type === "category" ? <MdCategory size={28} /> : <MdRestaurantMenu size={28} />}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border mb-1 ${selectedNode.type === "category"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]"
                          }`}>
                          {selectedNode.type}
                        </span>
                        <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-tight leading-none mt-0.5">
                          {selectedNode.label}
                        </h2>
                      </div>
                    </div>

                    {/* Top Right Quick Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(selectedNode.type === "category" ? "category" : "dishes", selectedNode.rawData)}
                        className="p-2.5 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-all border border-[var(--border-main)]/60"
                        title="Edit"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(selectedNode.type === "category" ? "category" : "dishes", selectedNode.id, selectedNode.label)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 rounded-xl transition-all border border-red-500/20"
                        title="Delete"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>

                  <hr className="border-[var(--border-main)]/50" />

                  {/* Node Specific Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                      <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">English Name</p>
                      <p className="text-[var(--text-main)] font-black text-xs uppercase">{selectedNode.rawData?.name?.en || "N/A"}</p>
                    </div>

                    <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1">
                      <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">Arabic Name</p>
                      <p className="text-[var(--text-main)] font-black text-xs" dir="rtl">{selectedNode.rawData?.name?.ar || "غير متوفر"}</p>
                    </div>

                    {parentCategoryName && (
                      <div className="p-4 bg-[var(--bg-main)]/40 rounded-2xl border border-[var(--border-main)]/50 space-y-1 col-span-full flex items-center justify-between">
                        <div>
                          <p className="text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest">
                            {selectedNode.type === "category" ? "Parent Category" : "Category"}
                          </p>
                          <p className="text-[var(--text-main)] font-black text-xs uppercase">{parentCategoryName}</p>
                        </div>
                        <MdFolderOpen className="text-amber-500/80" size={20} />
                      </div>
                    )}

                    {selectedNode.type === "item" && (
                      <div className="p-4 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/20 space-y-1 col-span-full flex items-center justify-between">
                        <div>
                          <p className="text-[var(--primary)] text-[8px] font-black uppercase tracking-widest">Dish Price</p>
                          <p className="text-[var(--text-main)] font-black text-lg">₹{selectedNode.rawData?.price}</p>
                        </div>
                        <span className="bg-[var(--primary)] text-[var(--primary-fg)] font-black px-3 py-1 rounded-xl text-xs shadow-md">
                          Active
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-6">
                  {selectedNode.type === "category" ? (
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
                  ) : (
                    <div className="p-4 bg-[var(--bg-main)]/20 rounded-2xl border border-[var(--border-main)]/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                        <FaLeaf size={16} />
                      </div>
                      <p className="text-[var(--text-dim)] text-[10px] font-bold leading-relaxed">
                        This dish is nested under the <strong className="text-[var(--text-main)]">{parentCategoryName}</strong> category. Any POS point loaded with this category will display this dish.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-[var(--bg-card-alt)] flex items-center justify-center border border-[var(--border-main)] text-[var(--text-dim)]/20 shadow-inner group-hover:rotate-6 transition-all duration-300">
                  <MdFolderOpen size={40} />
                </div>
                <div>
                  <h3 className="text-[var(--text-main)] font-black text-sm uppercase tracking-wider">No Selection</h3>
                  <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-1 max-w-[280px] leading-relaxed">
                    Select a category or item from the tree hierarchy to view full details and execute actions.
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
