import React from "react";
import CustomDropdown from "@/shared/components/CustomDropdown";

interface CouponFormProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  firstInputRef: any;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  register,
  errors,
  watch,
  setValue,
  firstInputRef,
}) => {
  return (
    <div className="space-y-6 max-w-lg mx-auto pt-10 pb-24">
      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          Coupon Code
        </label>
        <input
          {...register("code")}
          ref={(e) => {
            register("code").ref(e);
            if (e) firstInputRef.current = e;
          }}
          type="text"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-black uppercase tracking-widest text-2xl shadow-inner"
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
            Type
          </label>
          <CustomDropdown
            options={[
              { id: "PERCENTAGE", name: "Percentage (%)" },
              { id: "FIXED", name: "Fixed Amount (₹)" },
            ]}
            value={watch("type")}
            onChange={(val: any) => setValue("type", val)}
            placeholder="Select Type"
          />
        </div>
        <div className="group">
          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
            Value
          </label>
          <input
            {...register("value")}
            type="number"
            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
            Min Order Amount (₹)
          </label>
          <input
            {...register("minOrderAmount")}
            type="number"
            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold shadow-inner"
          />
        </div>
        <div className="group">
          <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
            Max Discount (₹)
          </label>
          <input
            {...register("maxDiscountAmount")}
            type="number"
            placeholder="Optional"
            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold shadow-inner"
          />
        </div>
      </div>

      <div className="group">
        <label className="block text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-3 px-1">
          Expiry Date
        </label>
        <input
          {...register("validUntil")}
          type="date"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold shadow-inner"
        />
      </div>
    </div>
  );
};
