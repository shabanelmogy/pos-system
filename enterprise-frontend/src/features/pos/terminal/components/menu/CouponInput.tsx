import React, { useState } from "react";
import { FaTag, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useTranslation } from "../../../../../../node_modules/react-i18next";
import { useSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { validateCoupon } from "@/shared/api/services/orderApi";

interface CouponInputProps {
  orderAmount: number;
  onSuccess: (coupon: any) => void;
  onRemove?: () => void;
}

const CouponInput: React.FC<CouponInputProps> = ({ orderAmount, onSuccess, onRemove }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [code, setCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const applyCouponMutation = useMutation({
    mutationFn: (data: { code: string; amount: number }) => validateCoupon(data.code, data.amount),
    onSuccess: (res) => {
      const coupon = res.data;
      setAppliedCoupon(coupon);
      enqueueSnackbar(t("pos.cart.coupon_applied"), { variant: "success" });
      onSuccess(coupon);
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || "Invalid or expired coupon", { variant: "error" });
    }
  });

  const handleApply = () => {
    if (!code.trim()) return;
    applyCouponMutation.mutate({ code: code.trim().toUpperCase(), amount: orderAmount });
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setCode("");
    if (onRemove) onRemove();
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-2 mt-2 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 text-green-500 font-bold text-[10px] uppercase tracking-widest">
          <FaCheckCircle size={12} /> {appliedCoupon.code} APPLIED
        </div>
        <button onClick={handleRemove} className="text-[10px] text-red-500 font-bold hover:underline">
          REMOVE
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="relative flex-1">
        <FaTag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="PROMO CODE"
          disabled={applyCouponMutation.isPending}
          className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg py-1.5 pl-8 pr-2 text-[10px] font-bold text-[var(--text-main)] uppercase tracking-widest focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-50"
        />
      </div>
      <button
        onClick={handleApply}
        disabled={!code.trim() || applyCouponMutation.isPending}
        className="bg-[var(--bg-hover)] border border-[var(--border-main)] hover:bg-[var(--primary)] hover:text-black hover:border-[var(--primary)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center min-w-[60px]"
      >
        {applyCouponMutation.isPending ? <FaSpinner className="animate-spin" /> : "APPLY"}
      </button>
    </div>
  );
};

export default CouponInput;
