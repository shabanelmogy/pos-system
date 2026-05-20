import React from "react";
import { LocalizedNameInputs } from "./LocalizedNameInputs";
import CustomDropdown from "@/shared/components/CustomDropdown";
import { FaFolder } from "react-icons/fa";

interface CategoryFormProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  kitchenStations: any[];
  localize: (val: any) => string;
  firstInputRef: any;
  i18n: any;
  handleArabicKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishInput: (e: React.FormEvent<HTMLInputElement>) => void;
  imageUrl?: string;
  isUploading?: boolean;
  handleImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  register,
  errors,
  watch,
  setValue,
  kitchenStations,
  localize,
  firstInputRef,
  i18n,
  handleArabicKeyPress,
  handleEnglishKeyDown,
  handleEnglishInput,
  imageUrl = "",
  isUploading = false,
  handleImageChange,
}) => {
  return (
    <div className="space-y-6 max-w-lg mx-auto pt-2 pb-2">
      {/* Category Image Upload */}
      <div className="space-y-2 flex flex-col items-center pb-4 border-b border-[var(--border-main)]/30">
        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] self-start px-1">
          Category Image
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
              <img src={imageUrl} alt="Category" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-20">
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-[var(--text-dim)] group-hover:text-[var(--text-muted)] transition-colors">
              <FaFolder size={20} />
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
        type="category"
      />

      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          Kitchen Station (Routing)
        </label>
        <CustomDropdown
          options={(kitchenStations || []).map((ks: any) => ({
            id: ks.id,
            name: localize(ks.name),
          }))}
          value={watch("kitchenStationId")}
          onChange={(val: any) => setValue("kitchenStationId", val)}
          placeholder="Select Kitchen Station"
        />
        <p className="text-[9px] text-[var(--text-dim)] mt-2 italic font-bold">
          Routing this category will send its items to the selected KDS screen.
        </p>
      </div>
    </div>
  );
};
