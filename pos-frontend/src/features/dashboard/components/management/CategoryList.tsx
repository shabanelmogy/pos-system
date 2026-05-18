import React from "react";
import { motion } from "framer-motion";
import { MdCategory, MdEdit, MdDelete } from "react-icons/md";
import { LoadingState, ErrorState, EmptyState } from "./StatusStates";
import { useTranslation } from "react-i18next";
import useLocalize from "../../../../hooks/useLocalize";

interface CategoryListProps {
  data: any[];
  loading: boolean;
  error: any;
  onEdit: (type: string, data: any) => void;
  onDelete: (type: string, id: string, name: string) => void;
  onRetry: () => void;
  itemVariants: any;
}

const CategoryList: React.FC<CategoryListProps> = ({ data, loading, error, onEdit, onDelete, onRetry, itemVariants }) => {
  const { t } = useTranslation();
  const { localize } = useLocalize();
  if (loading) return <LoadingState />;
  if (error) return <ErrorState label={t('dashboard.management.tabs.categories')} onRetry={onRetry} />;
  if (!data || data.length === 0) return <EmptyState label={t('dashboard.management.tabs.categories')} />;

  return (
    <>
      {data.map((cat) => (
        <motion.div variants={itemVariants} key={cat.id} className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-main)] flex items-center justify-between group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-[var(--bg-card-alt)] to-[var(--bg-card)] rounded-2xl text-[var(--primary)] shadow-xl">
              <MdCategory size={30} />
            </div>
            <div>
              <h3 className="text-[var(--text-main)] text-lg font-black tracking-tighter uppercase">{localize(cat.name)}</h3>
              <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">{t('dashboard.management.lists.category')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit("category", cat)} className="p-2.5 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><MdEdit size={16} /></button>
            <button onClick={() => onDelete("category", cat.id, localize(cat.name))} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors"><MdDelete size={16} /></button>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default CategoryList;
