import React from "react";
import { LocalizedNameInputs } from "./LocalizedNameInputs";
import CustomDropdown from "../../../../../shared/components/CustomDropdown";
import { MdCategory, MdRestaurantMenu } from "react-icons/md";

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
  imageUrl?: string;
  isUploading?: boolean;
  handleImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  imageUrl = "",
  isUploading = false,
  handleImageChange,
}) => {
  return (
    <div className="space-y-6 max-w-lg mx-auto pt-2 pb-2">
      {/* Item Image Upload */}
      <div className="space-y-2 flex flex-col items-center pb-4 border-b border-[var(--border-main)]/30">
        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] self-start px-1">
          Item Image
        </label>
        <div className="relative group w-28 h-28 rounded-2xl border-2 border-dashed border-[var(--border-main)] hover:border-[var(--primary)]/60 bg-[var(--bg-main)] overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Uploading…</span>
            </div>
          ) : imageUrl ? (
            <>
              <img src={imageUrl} alt="Dish Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-20">
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-[var(--text-dim)] group-hover:text-[var(--text-muted)] transition-colors">
              <MdRestaurantMenu size={22} />
              <span className="text-[8px] font-black uppercase tracking-widest text-center px-1">Upload</span>
            </div>
          )}
        </div>
      </div>

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
