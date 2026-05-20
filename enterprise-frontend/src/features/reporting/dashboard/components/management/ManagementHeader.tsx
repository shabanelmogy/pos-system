import React from "react";
import { MdSearch, MdRefresh, MdAddCircle } from "react-icons/md";
import { motion } from "framer-motion";
import { useTranslation } from "../../../../../../node_modules/react-i18next";

interface ManagementHeaderProps {
  subTabs: any[];
  activeSubTab: string;
  setActiveSubTab: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleManualRefresh: () => void;
  openEditModal: (type: string, data: any) => void;
}

const ManagementHeader: React.FC<ManagementHeaderProps> = ({ subTabs, activeSubTab, setActiveSubTab, searchQuery, setSearchQuery, handleManualRefresh, openEditModal }) => {
  const { t } = useTranslation();
  const typeMapping: { [key: string]: string } = {
    Tables: "table",
    Categories: "category",
    Items: "dishes",
    Branches: "branch",
    POSPoints: "posPoint",
    Users: "user"
  };

  const newLabelMapping: { [key: string]: string } = {
    Tables: t('dashboard.management.header.new_table'),
    Categories: t('dashboard.management.header.new_category'),
    Items: t('dashboard.management.header.new_dish'),
    Branches: t('dashboard.management.header.new_branch'),
    POSPoints: t('dashboard.management.header.new_terminal'),
    Users: t('dashboard.management.header.new_staff')
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-4">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === tab.id
                ? "bg-[var(--primary)] text-[var(--bg-card)] shadow-lg shadow-[var(--primary)]/20"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {activeSubTab === "Users" && (
          <div className="relative group flex-1 lg:flex-none">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
            <input
              type="text"
              placeholder={t('dashboard.management.header.search_staff')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl py-2.5 pl-10 pr-4 text-[var(--text-main)] text-xs focus:outline-none focus:border-[var(--primary)] w-full lg:w-48 transition-all"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualRefresh}
            title={t('dashboard.management.header.refresh_data')}
            className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
          >
            <MdRefresh size={20} />
          </motion.button>
          {typeMapping[activeSubTab] && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openEditModal(typeMapping[activeSubTab], null)}
              className="bg-[var(--primary)] text-[var(--bg-card)] px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <MdAddCircle size={16} /> {newLabelMapping[activeSubTab]}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementHeader;
