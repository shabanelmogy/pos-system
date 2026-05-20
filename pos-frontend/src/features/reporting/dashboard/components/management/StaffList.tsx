import React from "react";
import { motion } from "framer-motion";
import { MdPeople, MdShield, MdComputer, MdStore, MdEmail, MdPhone, MdEdit, MdDelete, MdChevronRight } from "react-icons/md";
import { LoadingState, ErrorState, EmptyState } from "./StatusStates";
import { User } from "@/shared/api/services/dashboardApi";
import { useTranslation } from "react-i18next";
import useLocalize from "@/shared/hooks/useLocalize";

interface StaffListProps {
  data: User[];
  loading: boolean;
  error: any;
  onEdit: (type: string, data: User) => void;
  onDelete: (type: string, id: string, name: string) => void;
  onRetry: () => void;
  searchQuery: string;
}

const StaffList: React.FC<StaffListProps> = ({ data, loading, error, onEdit, onDelete, onRetry, searchQuery }) => {
  const { t } = useTranslation();
  const { localize } = useLocalize();
  if (loading) return <LoadingState />;
  if (error) return <ErrorState label={t('dashboard.management.tabs.staff')} onRetry={onRetry} />;
  
  const filteredUsers = (data || []).filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredUsers.length === 0) return <EmptyState label={t('dashboard.management.tabs.staff')} />;

  const roleLabelMap: { [key: string]: string } = {
    cashier: t('dashboard.management.modal.roles.cashier'),
    manager: t('dashboard.management.modal.roles.manager'),
    admin: t('dashboard.management.modal.roles.admin')
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] overflow-hidden shadow-2xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-card-alt)]/50 border-b border-[var(--border-main)]">
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">{t('dashboard.management.lists.staff_member')}</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">{t('dashboard.management.lists.role_access')}</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">{t('dashboard.management.lists.location')}</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">{t('dashboard.management.lists.contact_info')}</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] text-right">{t('dashboard.management.lists.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user: User, index: number) => (
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
                      <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest mt-0.5">{t('dashboard.management.lists.id')}: {user.id?.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                        <MdShield className="text-[var(--primary)]" size={14} />
                        <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-[var(--primary)]/10">
                          {roleLabelMap[user.role] || user.role}
                        </span>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight">
                        <MdComputer size={14} className="text-indigo-400" />
                        {!user.posPermissions || user.posPermissions.length === 0 
                          ? t('dashboard.management.lists.all_terminals') 
                          : t('dashboard.management.lists.terminals_authorized', { count: user.posPermissions.length })}
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                         <MdStore size={18} />
                      </div>
                      <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest">{user.branch?.name ? localize(user.branch.name) : t('dashboard.management.lists.global')}</p>
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
                        onClick={() => onEdit("user", user)}
                        className="p-3 bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-[var(--bg-card)] rounded-xl transition-all border border-[var(--primary)]/20"
                      >
                        <MdEdit size={18} />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => user.id && onDelete("user", user.id, user.name || "")}
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffList;
