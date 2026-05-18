import React from "react";
import { LocalizedNameInputs } from "./LocalizedNameInputs";
import CustomDropdown from "../../../../../shared/components/CustomDropdown";
import { MdCategory } from "react-icons/md";

interface DishFormProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  categories: any[];
  localize: (val: any) => string;
  firstInputRef: any;
  i18n: any;
  handleArabicKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishInput: (e: React.FormEvent<HTMLInputElement>) => void;
  t: any;
}

export const DishForm: React.FC<DishFormProps> = ({
  register,
  errors,
  watch,
  setValue,
  categories,
  localize,
  firstInputRef,
  i18n,
  handleArabicKeyPress,
  handleEnglishKeyDown,
  handleEnglishInput,
  t,
}) => {
  return (
    <div className="space-y-6 max-w-lg mx-auto pt-2 pb-2">
      <LocalizedNameInputs
        register={register}
        errors={errors}
        firstInputRef={firstInputRef}
        i18n={i18n}
        handleArabicKeyPress={handleArabicKeyPress}
        handleEnglishKeyDown={handleEnglishKeyDown}
        handleEnglishInput={handleEnglishInput}
        type="dishes"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1">
            {t("dashboard.management.modal.price")} (₹)
          </label>
          <input
            {...register("price")}
            type="number"
            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-2xl font-black shadow-inner"
          />
          {errors.price && (
            <span className="text-[9px] text-red-500 font-bold mt-2 block">
              {errors.price.message as string}
            </span>
          )}
        </div>
        <div className="group">
          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1">
            {t("dashboard.management.modal.category")}
          </label>
          <CustomDropdown
            options={(categories || []).map((c: any) => ({
              id: c.id,
              name: localize(c.name),
            }))}
            value={watch("categoryId")}
            onChange={(val: any) => setValue("categoryId", val)}
            icon={<MdCategory />}
            placeholder={t("dashboard.management.modal.select_category")}
            searchable={true}
          />
          {errors.categoryId && (
            <span className="text-[9px] text-red-500 font-bold mt-2 block">
              {errors.categoryId.message as string}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
