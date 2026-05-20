import React from "react";
import BottomNav from "@/shared/components/BottomNav";
import BackButton from "@/shared/components/BackButton";
import CustomerList from "../components/CustomerList";
import { useTranslation } from "react-i18next";

const Customers: React.FC = () => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between px-10 py-6 gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tighter">
            {t('customers.title')}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder={t('customers.search_placeholder') || "Search by name or phone..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-[var(--primary)] text-[var(--text-main)] rounded-2xl px-5 py-3 outline-none shadow-xl transition-all placeholder:text-[var(--text-dim)] text-sm font-bold"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <CustomerList searchQuery={searchQuery} />
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Customers;
