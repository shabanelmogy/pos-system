import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill, RiShoppingCartLine, RiAddFill, RiSubtractFill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import useCartStore from "../../store/useCartStore";
import { CartItem } from "../../../../shared/types";
import { useTranslation } from "react-i18next";

const CartInfo: React.FC = () => {
  const { t } = useTranslation();
  const { items, addItem, removeItem, deleteItem } = useCartStore();
  const scrolLRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrolLRef.current) {
      scrolLRef.current.scrollTo({ top: scrolLRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [items]);

  return (
    <div className="flex flex-col h-full px-3 py-2">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg text-[var(--text-main)] font-bold tracking-tight">
          {t('pos.cart.title')}
        </h1>
        <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {items.length} {items.length === 1 ? t('common.item') : t('common.items')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pe-1 scrollbar-hide space-y-1.5" ref={scrolLRef} style={{ maxHeight: '480px' }}>
        {items.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[380px] opacity-60">
            <div className="bg-[var(--bg-card-alt)] p-4 rounded-full mb-3">
              <RiShoppingCartLine size={32} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-muted)] text-center text-sm font-medium">{t('pos.cart.empty')}</p>
            <p className="text-[var(--text-dim)] text-xs text-center mt-0.5">{t('pos.cart.empty_sub')}</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="group bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/40 rounded-lg p-2.5 transition-all duration-200 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-[var(--text-main)] font-semibold text-sm leading-snug truncate">{item.name}</h3>
              </div>
              <p className="text-[var(--primary)] text-base font-bold whitespace-nowrap">₹{item.price}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[var(--bg-hover)] rounded-md border border-[var(--border-main)]">
                  <button onClick={() => removeItem(item.id)} className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                    <RiSubtractFill size={12} />
                  </button>
                  <span className="text-[var(--primary)] text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                  <button onClick={() => addItem(item as CartItem)} className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                    <RiAddFill size={12} />
                  </button>
                </div>
                <span className="text-[var(--text-dim)] text-[10px]">₹{item.price} / {t('common.unit')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 bg-[var(--bg-hover)] hover:bg-[var(--primary)]/10 text-[var(--text-muted)] hover:text-[var(--primary)] rounded transition-colors duration-200" title="Note">
                  <FaNotesMedical size={12} />
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 bg-[var(--bg-hover)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 rounded transition-colors duration-200" title="Remove">
                  <RiDeleteBin2Fill size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartInfo;
