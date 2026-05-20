import React from "react";

interface TableFormProps {
  register: any;
  errors: any;
  firstInputRef: any;
  t: any;
}

export const TableForm: React.FC<TableFormProps> = ({
  register,
  errors,
  firstInputRef,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-lg mx-auto py-10">
      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          {t("dashboard.management.modal.table_no")}
        </label>
        <input
          {...register("tableNo")}
          ref={(e) => {
            register("tableNo").ref(e);
            if (e) firstInputRef.current = e;
          }}
          type="number"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-2xl font-black shadow-inner"
        />
        {errors.tableNo && (
          <span className="text-[9px] text-red-500 font-bold mt-2 block">
            {errors.tableNo.message as string}
          </span>
        )}
      </div>
      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          {t("dashboard.management.modal.seats")}
        </label>
        <input
          {...register("seats")}
          type="number"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-2xl font-black shadow-inner"
        />
        {errors.seats && (
          <span className="text-[9px] text-red-500 font-bold mt-2 block">
            {errors.seats.message as string}
          </span>
        )}
      </div>
    </div>
  );
};
