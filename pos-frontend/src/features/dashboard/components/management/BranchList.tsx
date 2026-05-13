import React from "react";
import { motion } from "framer-motion";
import { MdStore, MdEdit } from "react-icons/md";
import { LoadingState, ErrorState, EmptyState } from "./StatusStates";
import { useTranslation } from "react-i18next";

interface BranchListProps {
  data: any[];
  loading: boolean;
  error: any;
  onEdit: (type: string, data: any) => void;
  onRetry: () => void;
  itemVariants: any;
}

const BranchList: React.FC<BranchListProps> = ({ data, loading, error, onEdit, onRetry, itemVariants }) => {
  const { t } = useTranslation();
  if (loading) return <LoadingState />;
  if (error) return <ErrorState label={t('dashboard.management.tabs.branches')} onRetry={onRetry} />;
  if (!data || data.length === 0) return <EmptyState label={t('dashboard.management.tabs.branches')} />;

  return (
    <>
      {data.map((branch) => (
        <motion.div variants={itemVariants} key={branch.id} className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-main)] flex flex-col gap-4 group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 text-[var(--primary)] rounded-2xl border border-[var(--primary)]/20 shadow-lg">
              <MdStore size={32} />
            </div>
            <button onClick={() => onEdit("branch", branch)} className="p-3 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all"><MdEdit size={18} /></button>
           </div>
          <div>
            <h3 className="text-[var(--text-main)] text-xl font-black tracking-tighter uppercase">{branch.name}</h3>
            <p className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.2em] mt-1">{branch.code}</p>
            <div className="mt-4 flex flex-col gap-1">
               <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  {branch.city || t('dashboard.management.lists.branch')}
               </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default BranchList;
