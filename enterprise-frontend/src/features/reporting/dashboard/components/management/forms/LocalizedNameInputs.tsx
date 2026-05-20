import React from "react";

interface LocalizedNameInputsProps {
  register: any;
  errors: any;
  firstInputRef: any;
  i18n: any;
  handleArabicKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnglishInput: (e: React.FormEvent<HTMLInputElement>) => void;
  type: string;
}

export const LocalizedNameInputs: React.FC<LocalizedNameInputsProps> = ({
  register,
  errors,
  firstInputRef,
  i18n,
  handleArabicKeyPress,
  handleEnglishKeyDown,
  handleEnglishInput,
  type,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          {type === "posPoint" ? "Terminal Name (English)" : "Name (English)"}
        </label>
        <div className="relative flex items-center">
          <input
            {...register("nameEn")}
            lang="en"
            dir="ltr"
            ref={(e) => {
              register("nameEn").ref(e);
              if (e && !i18n.language.startsWith("ar")) firstInputRef.current = e;
            }}
            onKeyDown={handleEnglishKeyDown}
            onInput={handleEnglishInput}
            type="text"
            className="peer w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 pr-14 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-black uppercase tracking-tighter text-xl shadow-inner"
          />
          <span className="absolute right-4 text-[10px] font-black bg-[var(--bg-card-alt)] border border-[var(--border-main)] text-[var(--text-muted)] peer-focus:border-[var(--primary)] peer-focus:text-[var(--primary)] px-2.5 py-1 rounded-lg uppercase tracking-wider select-none pointer-events-none transition-all">
            EN
          </span>
        </div>
        {errors.nameEn && (
          <span className="text-[9px] text-red-500 font-bold mt-2 block">
            {errors.nameEn.message as string}
          </span>
        )}
      </div>
      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1 text-right">
          الاسم بالعربية
        </label>
        <div className="relative flex items-center">
          <input
            {...register("nameAr")}
            lang="ar"
            dir="rtl"
            ref={(e) => {
              register("nameAr").ref(e);
              if (e && i18n.language.startsWith("ar")) firstInputRef.current = e;
            }}
            onKeyDown={handleArabicKeyPress}
            type="text"
            className="peer w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 pl-14 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-black text-xl shadow-inner text-right"
          />
          <span className="absolute left-4 text-[10px] font-black bg-[var(--bg-card-alt)] border border-[var(--border-main)] text-[var(--text-muted)] peer-focus:border-[var(--primary)] peer-focus:text-[var(--primary)] px-2.5 py-1 rounded-lg select-none pointer-events-none transition-all">
            عربي
          </span>
        </div>
        {errors.nameAr && (
          <span className="text-[9px] text-red-500 font-bold mt-2 block">
            {errors.nameAr.message as string}
          </span>
        )}
      </div>
    </div>
  );
};
