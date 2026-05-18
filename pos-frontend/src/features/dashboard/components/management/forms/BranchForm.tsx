import React from "react";
import { LocalizedNameInputs } from "./LocalizedNameInputs";
import CustomDropdown from "../../../../../shared/components/CustomDropdown";

interface BranchFormProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  firstInputRef: any;
  i18n: any;
  handleArabicKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishInput: (e: React.FormEvent<HTMLInputElement>) => void;
  t: any;
}

export const BranchForm: React.FC<BranchFormProps> = ({
  register,
  errors,
  watch,
  setValue,
  firstInputRef,
  i18n,
  handleArabicKeyPress,
  handleEnglishKeyDown,
  handleEnglishInput,
  t,
}) => {
  return (
    <div className="space-y-8 max-w-lg mx-auto pt-10 pb-24">
      <LocalizedNameInputs
        register={register}
        errors={errors}
        firstInputRef={firstInputRef}
        i18n={i18n}
        handleArabicKeyPress={handleArabicKeyPress}
        handleEnglishKeyDown={handleEnglishKeyDown}
        handleEnglishInput={handleEnglishInput}
        type="branch"
      />

      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          {t("dashboard.management.modal.unique_code")}
        </label>
        <input
          {...register("code")}
          type="text"
          placeholder="e.g. BR-01"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono text-base shadow-inner"
        />
        {errors.code && (
          <span className="text-[9px] text-red-500 font-bold mt-2 block">
            {errors.code.message as string}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
            {t("dashboard.management.modal.city")}
          </label>
          <input
            {...register("city")}
            type="text"
            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
          />
        </div>
        <div className="group">
          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
            {t("dashboard.management.modal.phone")}
          </label>
          <input
            {...register("phone")}
            type="text"
            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
          />
        </div>
      </div>

      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          {t("dashboard.management.modal.address")}
        </label>
        <textarea
          {...register("address")}
          className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all h-24 custom-scrollbar text-sm shadow-inner"
        />
      </div>

      <div className="bg-[var(--bg-card)]/50 p-6 rounded-3xl border border-[var(--border-main)] space-y-6">
        <p className="text-[var(--text-dim)] text-[9px] font-black uppercase tracking-[0.2em] mb-2 px-1">
          Financial Configuration
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
              Tax Rate (%)
            </label>
            <input
              {...register("taxRate")}
              type="number"
              step="0.01"
              className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
            />
          </div>
          <div className="group">
            <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
              Service Charge (%)
            </label>
            <input
              {...register("serviceChargeRate")}
              type="number"
              step="0.01"
              className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
            />
          </div>
        </div>
        <div className="group">
          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
            Base Currency
          </label>
          <CustomDropdown
            options={[
              { id: "INR", name: "Indian Rupee (₹)" },
              { id: "USD", name: "US Dollar ($)" },
              { id: "AED", name: "UAE Dirham (AED)" },
            ]}
            value={watch("currency")}
            onChange={(val: any) => setValue("currency", val)}
            placeholder="Select Currency"
          />
        </div>
      </div>
    </div>
  );
};
