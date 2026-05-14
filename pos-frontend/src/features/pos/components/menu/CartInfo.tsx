import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin2Fill, RiShoppingCartLine, RiAddFill, RiSubtractFill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { FiUser, FiPhone, FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";
import useCartStore from "../../store/useCartStore";
import useCustomerStore from "../../../../features/customers/store/useCustomerStore";
import usePOSStore from "../../store/usePOSStore";
import { CartItem } from "../../../../shared/types";
import { useTranslation } from "react-i18next";
import { getCustomers } from "../../../../features/customers/api/customerApi";

const CartInfo: React.FC = () => {
  const { t } = useTranslation();
  const { items, addItem, removeItem, deleteItem } = useCartStore();
  const { customerName, customerPhone, setCustomer, setGuestCustomer } = useCustomerStore();
  const { selectedPOSPoint } = usePOSStore();
  const scrolLRef = useRef<HTMLDivElement>(null);

  const requireCustomer = selectedPOSPoint?.settings?.requireCustomerOnOrder;
  const isGuest = !customerName || customerName === "Guest";
  const showCustomerBar = true; // Always show customer bar

  // ── Add-customer panel state ──
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // ── Search Logic ──
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (expanded) {
      getCustomers().then((res: any) => {
        if (res?.data) setAllCustomers(res.data);
      }).catch(err => console.error("Failed to fetch customers", err));
    }
  }, [expanded]);

  const handleNameChange = (val: string) => {
    setName(val);
    setError("");
    if (val.length > 0) {
      const filtered = allCustomers.filter(c => 
        c.name.toLowerCase().includes(val.toLowerCase()) || 
        c.phone.includes(val)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (c: any) => {
    setName(c.name);
    setPhone(c.phone);
    setShowSuggestions(false);
    setCustomer({ name: c.name, phone: c.phone, guests: 1 });
  };

  // Pre-fill if real customer is already set
  useEffect(() => {
    if (!isGuest) {
      setName(customerName);
      setPhone(customerPhone);
    } else {
      setName("");
      setPhone("");
    }
  }, [customerName, customerPhone, isGuest]);

  useEffect(() => {
    if (scrolLRef.current) {
      scrolLRef.current.scrollTo({ top: scrolLRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [items]);

  const handleSaveCustomer = () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!phone.trim() || phone.trim().length < 7) { setError("Valid phone is required"); return; }
    setError("");
    setCustomer({ name: name.trim(), phone: phone.trim(), guests: 1 });
    setExpanded(false);
  };

  const handleResetToGuest = () => {
    setGuestCustomer();
    setName("");
    setPhone("");
    setExpanded(false);
  };

  return (
    <div className="flex flex-col h-full px-3 py-2">

      {/* ── Optional Add-Customer Bar ── */}
      {showCustomerBar && (
        <div className="mb-3 rounded-xl overflow-hidden border border-[var(--border-main)] bg-[var(--bg-card-alt)]">
          {/* Header row — always visible */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {/* Avatar bubble */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black uppercase
                ${isGuest
                  ? "bg-[var(--bg-hover)] text-[var(--text-muted)]"
                  : "bg-[var(--primary)]/20 text-[var(--primary)]"}`}>
                {isGuest ? <FiUser size={13} /> : customerName.slice(0, 2)}
              </div>
              <div className="flex flex-col items-start">
                <span className={`text-xs font-bold leading-none ${isGuest ? "text-[var(--text-muted)]" : "text-[var(--text-main)]"}`}>
                  {isGuest ? "Walk-in / Guest" : customerName}
                </span>
                {!isGuest && (
                  <span className="text-[10px] text-[var(--text-dim)] mt-0.5">{customerPhone}</span>
                )}
                {isGuest && (
                  <span className="text-[10px] text-[var(--primary)] mt-0.5 font-medium">+ Add customer (optional)</span>
                )}
              </div>
            </div>
            <div className="text-[var(--text-muted)]">
              {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </div>
          </button>

          {/* Expandable form */}
          {expanded && (
            <div className="px-3 pb-3 border-t border-[var(--border-main)] pt-3 space-y-2.5">
              {/* Name */}
              <div className="relative">
                <FiUser className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-xs" />
                <input
                  type="text"
                  placeholder="Search existing or enter name..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => name.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 text-[var(--text-main)] text-xs rounded-lg ps-8 pe-3 py-2 outline-none transition-all placeholder-[var(--text-dim)]"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg shadow-2xl overflow-hidden border-[var(--primary)]/20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-[var(--bg-hover)] px-3 py-1.5 border-b border-[var(--border-main)] flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Matched Customers</span>
                      <span className="text-[9px] text-[var(--primary)] font-medium">{suggestions.length} found</span>
                    </div>
                    {suggestions.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--primary)]/10 transition-colors border-b border-[var(--border-main)] last:border-0 group"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{c.name}</span>
                          <span className="text-[10px] text-[var(--text-dim)]">{c.phone}</span>
                        </div>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[var(--bg-hover)] text-[var(--text-dim)] group-hover:bg-[var(--primary)] group-hover:text-black transition-all">
                           <FiCheck size={10} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Phone */}
              <div className="relative">
                <FiPhone className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-xs" />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(""); }}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 text-[var(--text-main)] text-xs rounded-lg ps-8 pe-3 py-2 outline-none transition-all placeholder-[var(--text-dim)]"
                />
              </div>

              {error && <p className="text-red-400 text-[10px] font-semibold">{error}</p>}

              <div className="flex gap-2 pt-0.5">
                <button
                  onClick={handleSaveCustomer}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black text-xs font-black py-2 rounded-lg transition-all active:scale-95"
                >
                  <FiCheck size={12} /> Save
                </button>
                {!isGuest && requireCustomer === false && (
                  <button
                    onClick={handleResetToGuest}
                    className="px-3 text-[var(--text-muted)] hover:text-red-400 text-xs font-semibold bg-[var(--bg-hover)] rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Cart Title ── */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg text-[var(--text-main)] font-bold tracking-tight">
          {t('pos.cart.title')}
        </h1>
        <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {items.length} {items.length === 1 ? t('common.item') : t('common.items')}
        </span>
      </div>

      {/* ── Cart Items ── */}
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
