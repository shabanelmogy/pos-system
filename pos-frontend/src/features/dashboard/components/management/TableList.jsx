import React from "react";
import { motion } from "framer-motion";
import { MdTableBar, MdEdit, MdDelete } from "react-icons/md";
import { LoadingState, ErrorState, EmptyState } from "./StatusStates";

const TableList = ({ data, loading, error, onEdit, onDelete, onRetry, itemVariants }) => {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState label="Tables" onRetry={onRetry} />;
  if (!data || data.length === 0) return <EmptyState label="Tables" />;

  return (
    <>
      {data.map((table) => (
        <motion.div variants={itemVariants} key={table.id} className="relative bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-main)] flex flex-col gap-4 group transition-all hover:border-[var(--primary)]/50 hover:shadow-2xl hover:shadow-[var(--primary)]/5">
          <div className="flex justify-between items-start">
            <div className={`p-4 rounded-2xl ${table.status === 'Available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <MdTableBar size={32} />
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit("table", table)} className="p-3 bg-[var(--bg-card-alt)] hover:bg-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><MdEdit size={18} /></button>
              <button onClick={() => onDelete("table", table.id, `Table ${table.tableNo}`)} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors"><MdDelete size={18} /></button>
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
    </>
  );
};

export default TableList;
