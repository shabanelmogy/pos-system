import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronRight, FaFolderPlus, FaEdit, FaTrash,
  FaFolder, FaFolderOpen, FaLeaf, FaPlus, FaSearch, FaTimesCircle,
} from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { deleteCategory } from "../../pos/api/posApi";
import { CategoryTreeNode, MenuItem } from "../../../shared/types";
import useLocalize from "../../../hooks/useLocalize";

interface Props {
  nodes: CategoryTreeNode[];
  allNodes: CategoryTreeNode[];
  onSelectCategory: (node: CategoryTreeNode) => void;
  selectedCategoryId?: string;
  selectedItemId?: string;
  onSelectItem?: (item: MenuItem, category: CategoryTreeNode) => void;
  onAddChild: (parent: CategoryTreeNode) => void;
  onEdit: (node: CategoryTreeNode) => void;
  expandEpoch?: number;
  collapseEpoch?: number;
  searchQuery?: string;
}

interface NodeProps extends Props {
  node: CategoryTreeNode;
  depth: number;
}

const TreeNode: React.FC<NodeProps> = ({
  node, depth, allNodes, onSelectCategory, selectedCategoryId, selectedItemId, onSelectItem, onAddChild, onEdit, expandEpoch, collapseEpoch, searchQuery = "",
}) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const queryClient = useQueryClient();
  const { localize } = useLocalize();

  // Automatically expand parent nodes when a child/descendant category is selected or when searching
  const isAncestor = React.useMemo(() => {
    if (!selectedCategoryId) return false;
    const check = (n: CategoryTreeNode): boolean => {
      if (n.id === selectedCategoryId) return true;
      return n.children.some(check);
    };
    return node.children.some(check);
  }, [node.children, selectedCategoryId]);

  React.useEffect(() => {
    if (isAncestor || searchQuery) {
      setIsOpen(true);
    }
  }, [isAncestor, searchQuery]);

  // Listen to expand/collapse triggers from parent
  React.useEffect(() => {
    if (expandEpoch && expandEpoch > 0) {
      setIsOpen(true);
    }
  }, [expandEpoch]);

  React.useEffect(() => {
    if (collapseEpoch && collapseEpoch > 0) {
      setIsOpen(false);
    }
  }, [collapseEpoch]);

  const hasChildren = node.children.length > 0;
  const hasItems = (node.itemCount ?? 0) > 0;
  const hasChevron = hasChildren || hasItems;
  const isLeaf = !hasChildren;
  const isSelected = selectedCategoryId === node.id && !selectedItemId;

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(node.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      enqueueSnackbar("Category deleted", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.response?.data?.message || "Cannot delete category", { variant: "error" });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      enqueueSnackbar("Remove all subcategories before deleting this category.", { variant: "warning" });
      return;
    }
    if (hasItems) {
      enqueueSnackbar("Remove all items from this category before deleting.", { variant: "warning" });
      return;
    }
    if (window.confirm(`Delete category "${localize(node.name)}"?`)) {
      deleteMutation.mutate();
    }
  };

  const renderName = (nameStr: string) => {
    if (!searchQuery) return nameStr;
    const index = nameStr.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (index === -1) return nameStr;
    const before = nameStr.substring(0, index);
    const match = nameStr.substring(index, index + searchQuery.length);
    const after = nameStr.substring(index + searchQuery.length);
    return (
      <span>
        {before}
        <span className="bg-yellow-500/30 text-yellow-500 px-0.5 rounded font-black">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div className={`${depth > 0 ? "ms-5 border-s-2 border-[var(--border-main)] ps-3" : ""}`}>
      {/* Node Row */}
      <motion.div
        layout
        onClick={() => { onSelectCategory(node); if (hasChevron) setIsOpen(o => !o); }}
        className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 mb-1 select-none
          ${isSelected
            ? "bg-[var(--primary)] text-[var(--primary-fg)] shadow-lg shadow-[var(--primary)]/20"
            : "hover:bg-[var(--bg-hover)] text-[var(--text-main)]"
          }`}
      >
        {/* Chevron toggle */}
        {hasChevron ? (
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.18 }}
            className={`shrink-0 ${isSelected ? "text-primary-fg-60" : "text-[var(--text-dim)]"}`}
          >
            <FaChevronRight size={10} />
          </motion.div>
        ) : (
          <span className="w-[10px] shrink-0" />
        )}

        {/* Icon / Image thumbnail */}
        <span className="shrink-0">
          {node.images && node.images.length > 0 ? (
            <span className={`w-5 h-5 rounded-md overflow-hidden inline-flex items-center justify-center border ${
              isSelected ? "border-white/30" : "border-[var(--border-main)]"
            }`}>
              <img src={node.images[0]} alt="" className="w-full h-full object-cover" />
            </span>
          ) : (
            <span className={`shrink-0 ${isSelected ? "text-primary-fg-70" : isLeaf ? "text-[var(--primary)]" : "text-amber-500"}`}>
              {isLeaf
                ? <FaLeaf size={13} />
                : isOpen
                  ? <FaFolderOpen size={14} />
                  : <FaFolder size={14} />
              }
            </span>
          )}
        </span>

        {/* Name */}
        <span className={`flex-1 font-bold text-sm leading-tight truncate ${isSelected ? "text-primary-fg" : ""}`}>
          {renderName(localize(node.name))}
        </span>

        {/* Badges */}
        <span className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full border
          ${isSelected
            ? "badge-active-bg"
            : hasItems
              ? "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]"
              : "bg-[var(--bg-card-alt)] border-[var(--border-main)] text-[var(--text-dim)]"
          }`}>
          {hasItems ? `${node.itemCount} item${node.itemCount !== 1 ? "s" : ""}` : hasChildren ? `${node.children.length} sub` : "empty"}
        </span>

        {/* Action buttons – visible on hover */}
        <div
          className={`shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? "opacity-100" : ""}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Add child — only if this category has no items */}
          {!hasItems && (
            <button
              onClick={() => onAddChild(node)}
              title="Add subcategory"
              className={`p-1.5 rounded-lg transition-all ${isSelected ? "btn-active-hover" : "hover:bg-[var(--primary)]/15 text-[var(--text-dim)] hover:text-[var(--primary)]"}`}
            >
              <FaFolderPlus size={11} />
            </button>
          )}
          <button
            onClick={() => onEdit(node)}
            title="Edit category"
            className={`p-1.5 rounded-lg transition-all ${isSelected ? "btn-active-hover" : "hover:bg-[var(--bg-card-alt)] text-[var(--text-dim)] hover:text-[var(--text-main)]"}`}
          >
            <FaEdit size={11} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            title="Delete category"
            className={`p-1.5 rounded-lg transition-all ${isSelected ? "text-primary-fg-70 btn-active-hover-danger" : "hover:bg-[var(--status-error-bg)] text-[var(--text-dim)] hover:text-[var(--status-error)]"}`}
          >
            <FaTrash size={11} />
          </button>
        </div>
      </motion.div>

      {/* Expanded Content (Subcategories or Items) */}
      <AnimatePresence initial={false}>
        {isOpen && (hasChildren || (hasItems && node.items)) && (
          <motion.div
            key="expanded-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Render children subcategories */}
            {hasChildren && node.children.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                nodes={node.children}
                allNodes={allNodes}
                onSelectCategory={onSelectCategory}
                selectedCategoryId={selectedCategoryId}
                selectedItemId={selectedItemId}
                onSelectItem={onSelectItem}
                onAddChild={onAddChild}
                onEdit={onEdit}
                expandEpoch={expandEpoch}
                collapseEpoch={collapseEpoch}
                searchQuery={searchQuery}
              />
            ))}

            {/* Render items (dishes) */}
            {!hasChildren && hasItems && node.items?.map(item => {
              const isItemActive = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); onSelectItem?.(item, node); }}
                  className={`ms-5 border-s-2 border-dashed ps-3 py-2 flex items-center justify-between transition-all select-none cursor-pointer rounded-r-xl my-0.5
                    ${isItemActive
                      ? "text-primary-fg bg-[var(--primary)] border-[var(--primary)] font-bold shadow-md shadow-[var(--primary)]/10"
                      : "text-[var(--text-dim)] border-[var(--border-main)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                    }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`shrink-0 text-xs ${isItemActive ? "text-primary-fg" : "text-orange-500"}`}>
                      🍴
                    </span>
                    <span className={`text-xs truncate leading-tight ${isItemActive ? "text-primary-fg" : ""}`}>
                      {renderName(localize(item.name))}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black shrink-0 px-2 py-0.5 rounded-lg border
                    ${isItemActive
                      ? "badge-active-bg"
                      : "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]"
                    }`}>
                    ₹{item.price}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface TreeViewProps {
  tree: CategoryTreeNode[];
  selectedCategoryId?: string;
  selectedItemId?: string;
  onSelectCategory: (node: CategoryTreeNode) => void;
  onSelectItem?: (item: MenuItem, category: CategoryTreeNode) => void;
  onAddRoot: () => void;
  onAddChild: (parent: CategoryTreeNode) => void;
  onEdit: (node: CategoryTreeNode) => void;
}

const CategoryTreeView: React.FC<TreeViewProps> = ({
  tree, selectedCategoryId, selectedItemId, onSelectCategory, onSelectItem, onAddRoot, onAddChild, onEdit,
}) => {
  const [expandEpoch, setExpandEpoch] = useState(0);
  const [collapseEpoch, setCollapseEpoch] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { localize } = useLocalize();

  const filteredTree = React.useMemo(() => {
    if (!searchQuery) return tree;

    const filter = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
      return nodes
        .map((node) => {
          const matchSelf = localize(node.name).toLowerCase().includes(searchQuery.toLowerCase());
          const matchingChildren = node.children ? filter(node.children) : [];
          const matchingItems = node.items ? node.items.filter(item => localize(item.name).toLowerCase().includes(searchQuery.toLowerCase())) : [];

          if (matchSelf || matchingChildren.length > 0 || matchingItems.length > 0) {
            return {
              ...node,
              children: matchingChildren,
              items: node.items ? node.items.filter(item => localize(item.name).toLowerCase().includes(searchQuery.toLowerCase())) : []
            };
          }
          return null;
        })
        .filter(Boolean) as CategoryTreeNode[];
    };
    return filter(tree);
  }, [tree, searchQuery, localize]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/30 flex-none">
        <div>
          <h2 className="text-[var(--text-main)] font-black uppercase tracking-tight text-sm">Category Tree</h2>
          <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-0.5">
            {tree.length} root {tree.length === 1 ? "category" : "categories"}
          </p>
        </div>
        <button
          onClick={onAddRoot}
          className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-fg)] text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-md shadow-[var(--primary)]/20 active:scale-95"
        >
          <FaPlus size={10} /> Add Root
        </button>
      </div>

      {/* Toolbar for Expand/Collapse & Search */}
      <div className="px-4 py-3 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/10 flex flex-col gap-2.5 flex-none">
        <div className="relative w-full">
          <FaSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={11} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories & dishes..."
            className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 rounded-xl px-4 py-2 ps-8.5 pe-8.5 text-xs font-bold outline-none text-[var(--text-main)] placeholder-[var(--text-dim)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors p-1 rounded-full flex items-center justify-center"
            >
              <FaTimesCircle size={11} />
            </button>
          )}
        </div>

        <div className="flex gap-2 items-center justify-end">
          <button
            onClick={() => setExpandEpoch(e => e + 1)}
            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
          >
            Expand All
          </button>
          <button
            onClick={() => setCollapseEpoch(e => e + 1)}
            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {filteredTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
            <FaFolder size={36} className="text-[var(--text-dim)]" />
            <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest text-center">
              No categories or items found.
            </p>
          </div>
        ) : (
          filteredTree.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              nodes={filteredTree}
              allNodes={filteredTree}
              onSelectCategory={onSelectCategory}
              selectedCategoryId={selectedCategoryId}
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
              onAddChild={onAddChild}
              onEdit={onEdit}
              expandEpoch={expandEpoch}
              collapseEpoch={collapseEpoch}
              searchQuery={searchQuery}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryTreeView;