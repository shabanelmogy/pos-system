import React from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import CustomerList from "../components/dashboard/CustomerList";

const Customers = () => {
  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-black uppercase tracking-tighter">
            Customer Database
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
