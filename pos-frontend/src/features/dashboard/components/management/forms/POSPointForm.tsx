import React from "react";
import { LocalizedNameInputs } from "./LocalizedNameInputs";
import CustomDropdown from "../../../../../shared/components/CustomDropdown";
import { MdStore } from "react-icons/md";

interface POSPointFormProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  branches: any[];
  localize: (val: any) => string;
  firstInputRef: any;
  i18n: any;
  handleArabicKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishInput: (e: React.FormEvent<HTMLInputElement>) => void;
  t: any;
}

export const POSPointForm: React.FC<POSPointFormProps> = ({
  register,
  errors,
  watch,
  setValue,
  branches,
  localize,
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
        type="posPoint"
      />

      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          {t("dashboard.management.modal.unique_code")}
        </label>
        <input
          {...register("code")}
          type="text"
          placeholder="e.g. POS-01"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono text-base shadow-inner"
        />
        {errors.code && (
          <span className="text-[9px] text-red-500 font-bold mt-2 block">
            {errors.code.message as string}
          </span>
        )}
      </div>

      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          {t("dashboard.management.modal.assign_branch")}
        </label>
        <CustomDropdown
          options={(branches || []).map((b: any) => ({
            id: b.id,
            name: localize(b.name),
          }))}
          value={watch("branchId")}
          onChange={(val: any) => setValue("branchId", val)}
          icon={<MdStore />}
          placeholder={t("dashboard.management.modal.select_branch")}
        />
        {errors.branchId && (
          <span className="text-[9px] text-red-500 font-bold mt-2 block">
            {errors.branchId.message as string}
          </span>
        )}
      </div>
    </div>
  );
};
