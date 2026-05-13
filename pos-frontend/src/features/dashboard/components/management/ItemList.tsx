import React from "react";
import { motion } from "framer-motion";
import { MdRestaurantMenu, MdEdit, MdDelete } from "react-icons/md";
import { LoadingState, ErrorState, EmptyState } from "./StatusStates";
import { useTranslation } from "react-i18next";

interface ItemListProps {
  data: any[];
  loading: boolean;
  error: any;
  onEdit: (type: string, data: any) => void;
  onDelete: (type: string, id: string, name: string) => void;
  onRetry: () => void;
  itemVariants: any;
}

const ItemList: React.FC<ItemListProps> = ({ data, loading, error, onEdit, onDelete, onRetry, itemVariants }) => {
  const { t } = useTranslation();
  if (loading) return <LoadingState />;
  if (error) return <ErrorState label={t('dashboard.management.tabs.dishes')} onRetry={onRetry} />;
  if (!data || data.length === 0) return <EmptyState label={t('dashboard.management.tabs.dishes')} />;

  return (
    <>
      {data.map((item) => (
        <motion.div variants={itemVariants} key={item.id} className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-main)] flex flex-col gap-3 group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-gradient-to-br from-[var(--bg-card-alt)] to-[var(--bg-card)] rounded-2xl text-[var(--primary)] shadow-xl">
              <MdRestaurantMenu size={32} />
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit("dishes", item)} className="p-2.5 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]"><MdEdit size={16} /></button>
              <button onClick={() => onDelete("item", item.id, item.name)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500"><MdDelete size={16} /></button>
            </div>
          </div>
          <div>
            <h3 className="text-[var(--text-main)] text-xl font-black tracking-tighter uppercase line-clamp-1">{item.name}</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[var(--primary)] text-lg font-black italic">₹{item.price}</p>
              <span className="text-[10px] bg-[var(--bg-card-alt)] text-[var(--text-muted)] px-3 py-1 rounded-full font-black uppercase tracking-widest">{t('dashboard.management.lists.dish')}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default ItemList;
