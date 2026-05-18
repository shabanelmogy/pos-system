import React from "react";
import { motion } from "framer-motion";
import { MdComputer, MdEdit } from "react-icons/md";
import { LoadingState, ErrorState, EmptyState } from "./StatusStates";
import { useTranslation } from "react-i18next";
import useLocalize from "../../../../hooks/useLocalize";

interface POSPointListProps {
  data: any[];
  loading: boolean;
  error: any;
  onEdit: (type: string, data: any) => void;
  onRetry: () => void;
  itemVariants: any;
}

const POSPointList: React.FC<POSPointListProps> = ({ data, loading, error, onEdit, onRetry, itemVariants }) => {
  const { t } = useTranslation();
  const { localize } = useLocalize();
  if (loading) return <LoadingState />;
  if (error) return <ErrorState label={t('dashboard.management.tabs.terminals')} onRetry={onRetry} />;
  if (!data || data.length === 0) return <EmptyState label={t('dashboard.management.tabs.terminals')} />;

  return (
    <>
      {data.map((pos) => (
        <motion.div variants={itemVariants} key={pos.id} className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-main)] flex flex-col gap-4 group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-lg">
              <MdComputer size={32} />
            </div>
            <button onClick={() => onEdit("posPoint", pos)} className="p-3 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all"><MdEdit size={18} /></button>
           </div>
          <div>
            <h3 className="text-[var(--text-main)] text-xl font-black tracking-tighter uppercase">{localize(pos.name)}</h3>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{pos.code}</p>
            <div className="mt-4 flex items-center gap-2">
               <span className="px-3 py-1 bg-[var(--bg-card-alt)] rounded-full text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{t('dashboard.management.lists.terminal')}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default POSPointList;
