import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronRight, FaFolder, FaFolderOpen, FaRegCircle, FaSearch } from "react-icons/fa";

export interface TreeAction {
  icon: React.ReactNode;
  label: string;
  onClick: (node: TreeNodeData) => void;
  danger?: boolean;
}

export interface TreeNodeData {
  id: string;
  label: string;
  type: "category" | "item" | string;
  icon?: React.ReactNode;
  imageUrl?: string;
  badge?: string | number;
  badgeType?: "primary" | "secondary" | "danger" | "success" | "warning";
  children?: TreeNodeData[];
  actions?: TreeAction[];
  rawData?: any;
}

interface TreeViewProps {
  data: TreeNodeData[];
  searchQuery?: string;
  onNodeClick?: (node: TreeNodeData) => void;
  selectedNodeId?: string;
  emptyLabel?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  rightHeaderAction?: React.ReactNode;
}

interface TreeNodeProps {
  node: TreeNodeData;
  depth: number;
  selectedNodeId?: string;
  searchQuery?: string;
  onNodeClick?: (node: TreeNodeData) => void;
  expandEpoch?: number;
  collapseEpoch?: number;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  depth,
  selectedNodeId,
  searchQuery,
  onNodeClick,
  expandEpoch,
  collapseEpoch,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const [isOpen, setIsOpen] = useState(true);

  // Auto-expand when searching
  useEffect(() => {
    if (searchQuery) {
      setIsOpen(true);
    }
  }, [searchQuery]);

  // Synchronize with external epoch triggers
  useEffect(() => {
    if (expandEpoch && expandEpoch > 0) {
      setIsOpen(true);
    }
  }, [expandEpoch]);

  useEffect(() => {
    if (collapseEpoch && collapseEpoch > 0) {
      setIsOpen(false);
    }
  }, [collapseEpoch]);

  const isSelected = selectedNodeId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  const handleRowClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  // Helper for highlighting query
  const renderLabel = () => {
    if (!searchQuery) return node.label;
    const index = node.label.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (index === -1) return node.label;
    const before = node.label.substring(0, index);
    const match = node.label.substring(index, index + searchQuery.length);
    const after = node.label.substring(index + searchQuery.length);
    return (
      <span>
        {before}
        <span className="bg-yellow-500/30 text-yellow-500 px-0.5 rounded font-black">{match}</span>
        {after}
      </span>
    );
  };

  const badgeColorMap = {
    primary: "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]",
    secondary: "bg-[var(--bg-card-alt)] border-[var(--border-main)] text-[var(--text-dim)]",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    danger: "bg-red-500/10 border-red-500/20 text-red-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };

  return (
    <div className={`select-none ${depth > 0 ? "ms-5 border-s-2 border-[var(--border-main)]/60 ps-3" : ""}`}>
      {/* Node Entry Row */}
      <motion.div
        layout
        onClick={handleRowClick}
        className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${
          isSelected
            ? "bg-[var(--primary)] text-[var(--primary-fg)] shadow-lg shadow-[var(--primary)]/25"
            : "hover:bg-[var(--bg-hover)] text-[var(--text-main)]"
        }`}
      >
        {/* Toggle Chevron */}
        {hasChildren ? (
          <motion.button
            onClick={handleToggle}
            animate={{ rotate: isOpen ? 90 : 0 }}
            className={`p-1 rounded-lg shrink-0 ${isSelected ? "text-primary-fg-70" : "text-[var(--text-dim)]"}`}
          >
            <FaChevronRight size={10} />
          </motion.button>
        ) : (
          <span className="w-6 shrink-0 flex items-center justify-center">
            <FaRegCircle size={6} className={isSelected ? "text-primary-fg-50" : "text-[var(--text-dim)]/40"} />
          </span>
        )}

        {/* Thumbnail or Icon */}
        <span className="shrink-0">
          {node.imageUrl ? (
            <span className={`w-6 h-6 rounded-lg overflow-hidden inline-flex items-center justify-center border ${
              isSelected ? "border-white/30" : "border-[var(--border-main)]"
            }`}>
              <img src={node.imageUrl} alt="" className="w-full h-full object-cover" />
            </span>
          ) : node.icon ? (
            <span className={isSelected ? "text-primary-fg" : "text-[var(--text-dim)]"}>
              {node.icon}
            </span>
          ) : (
            <span className={isSelected ? "text-primary-fg" : "text-[var(--text-dim)]"}>
              {node.type === "category" ? (
                isOpen ? <FaFolderOpen size={14} /> : <FaFolder size={14} />
              ) : (
                <FaRegCircle size={10} />
              )}
            </span>
          )}
        </span>

        {/* Node Text Label */}
        <span className="flex-1 font-bold text-xs truncate leading-none pt-0.5">
          {renderLabel()}
        </span>

        {/* Optional Info Badge */}
        {node.badge !== undefined && (
          <span className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full border ${
            isSelected ? "bg-white/20 border-white/10 text-white" : badgeColorMap[node.badgeType || "secondary"]
          }`}>
            {node.badge}
          </span>
        )}

        {/* Hover / Select action buttons */}
        {node.actions && node.actions.length > 0 && (
          <div
            className={`shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ${
              isSelected ? "opacity-100" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {node.actions.map((act, i) => (
              <button
                key={i}
                onClick={() => act.onClick(node)}
                title={act.label}
                className={`p-1.5 rounded-lg transition-all ${
                  isSelected
                    ? "hover:bg-white/20 text-white"
                    : act.danger
                    ? "hover:bg-red-500/10 text-red-500"
                    : "hover:bg-[var(--bg-card-alt)] text-[var(--text-dim)] hover:text-[var(--text-main)]"
                }`}
              >
                {act.icon}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Nested Children list */}
      <AnimatePresence initial={false}>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {node.children!.map((child) => (
              <TreeNodeComponent
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedNodeId={selectedNodeId}
                searchQuery={searchQuery}
                onNodeClick={onNodeClick}
                expandEpoch={expandEpoch}
                collapseEpoch={collapseEpoch}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  searchQuery: externalSearchQuery,
  onNodeClick,
  selectedNodeId,
  emptyLabel = "No items match your criteria.",
  showSearch = false,
  searchPlaceholder = "Filter tree...",
  headerTitle,
  headerSubtitle,
  rightHeaderAction,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [expandEpoch, setExpandEpoch] = useState(0);
  const [collapseEpoch, setCollapseEpoch] = useState(0);

  const activeSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  // Filter tree nodes if searching
  const filteredData = useMemo(() => {
    if (!activeSearchQuery) return data;

    const filterNodes = (nodes: TreeNodeData[]): TreeNodeData[] => {
      return nodes
        .map((node) => {
          const matchSelf = node.label.toLowerCase().includes(activeSearchQuery.toLowerCase());
          const matchingChildren = node.children ? filterNodes(node.children) : [];
          
          if (matchSelf || matchingChildren.length > 0) {
            return {
              ...node,
              children: matchingChildren,
            };
          }
          return null;
        })
        .filter(Boolean) as TreeNodeData[];
    };

    return filterNodes(data);
  }, [data, activeSearchQuery]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl overflow-hidden shadow-sm">
      {/* Title Header */}
      {(headerTitle || rightHeaderAction) && (
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/30">
          <div>
            {headerTitle && <h3 className="text-[var(--text-main)] font-black text-sm uppercase tracking-tight">{headerTitle}</h3>}
            {headerSubtitle && <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-0.5">{headerSubtitle}</p>}
          </div>
          {rightHeaderAction && <div className="shrink-0">{rightHeaderAction}</div>}
        </div>
      )}

      {/* Internal Search bar & Expand controls */}
      <div className="px-6 py-3 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {showSearch && externalSearchQuery === undefined ? (
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={12} />
            <input
              type="text"
              value={internalSearchQuery}
              onChange={(e) => setInternalSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 rounded-xl px-4 py-2.5 ps-9 text-xs font-bold outline-none text-[var(--text-main)] placeholder-[var(--text-dim)] transition-all"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex gap-2 items-center justify-end shrink-0">
          <button
            onClick={() => setExpandEpoch((e) => e + 1)}
            className="text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
          >
            Expand All
          </button>
          <button
            onClick={() => setCollapseEpoch((e) => e + 1)}
            className="text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all active:scale-95"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Recursive nodes tree list container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card-alt)] flex items-center justify-center border border-[var(--border-main)]">
              <FaFolder className="text-[var(--text-dim)] opacity-40" size={20} />
            </div>
            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest leading-relaxed">
              {emptyLabel}
            </p>
          </div>
        ) : (
          filteredData.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              depth={0}
              selectedNodeId={selectedNodeId}
              searchQuery={activeSearchQuery}
              onNodeClick={onNodeClick}
              expandEpoch={expandEpoch}
              collapseEpoch={collapseEpoch}
            />
          ))
        )}
      </div>
    </div>
  );
};
