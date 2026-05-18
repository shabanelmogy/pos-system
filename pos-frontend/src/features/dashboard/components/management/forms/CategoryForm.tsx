import React from "react";
import { LocalizedNameInputs } from "./LocalizedNameInputs";
import CustomDropdown from "../../../../../shared/components/CustomDropdown";

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
