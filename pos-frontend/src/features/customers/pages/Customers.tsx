import React from "react";
import BottomNav from "../../../shared/components/BottomNav";
import BackButton from "../../../shared/components/BackButton";
import CustomerList from "../components/CustomerList";
import { useTranslation } from "react-i18next";

const Customers: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tighter">
            {t('customers.title')}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <CustomerList />
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Customers;
