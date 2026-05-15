import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin2Fill, RiShoppingCartLine, RiAddFill, RiSubtractFill } from "react-icons/ri";
import { FaNotesMedical, FaUserPlus } from "react-icons/fa6";
import { FiUser, FiPhone, FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";
import useCartStore from "../../store/useCartStore";
import useCustomerStore from "../../../../features/customers/store/useCustomerStore";
import usePOSStore from "../../store/usePOSStore";
import { useTranslation } from "react-i18next";
import { getCustomers, addCustomer } from "../../../../features/customers/api/customerApi";
import Modal from "../../../../shared/components/Modal";

const CartInfo: React.FC = () => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, clearCart, getItemCount } = useCartStore();
  const { customerName, customerPhone, setCustomer, setGuestCustomer } = useCustomerStore();
  const { selectedPOSPoint } = usePOSStore();
  const scrolLRef = useRef<HTMLDivElement>(null);

  const isGuest = !customerName || customerName === "Guest";
  const showCustomerBar = true;

  // ── Add-customer panel state ──
  const [expanded, setExpanded] = useState(false);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // ── Search Logic ──
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phoneSuggestions, setPhoneSuggestions] = useState<any[]>([]);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);

  useEffect(() => {
    if (expanded) {
      getCustomers().then((res: any) => {
        const customers = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAllCustomers(customers);
      }).catch(err => console.error("Failed to fetch customers", err));
    }
  }, [expanded]);

  const handleNameChange = (val: string) => {
    setName(val);
    setError("");
    if (val.length > 0) {
      const filtered = allCustomers.filter(c =>
        c.name.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setError("");
    if (val.length > 0) {
      const filtered = allCustomers.filter(c =>
        c.phone.includes(val)
      );
      setPhoneSuggestions(filtered.slice(0, 5));
      setShowPhoneSuggestions(true);
    } else {
      setPhoneSuggestions([]);
      setShowPhoneSuggestions(false);
    }
  };

  const selectCustomer = (c: any) => {
    setName(c.name);
    setPhone(c.phone);
    setShowSuggestions(false);
    setShowPhoneSuggestions(false);
    setCustomer({ id: c.id, name: c.name, phone: c.phone, guests: 1 });
  };

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

  const handleResetToGuest = () => {
    setGuestCustomer();
    setName("");
    setPhone("");
    setExpanded(false);
  };

  return (
    <div className="flex flex-col h-full px-3 py-2">
      {/* Customer Bar */}
      {showCustomerBar && (
        <div className="mb-3 rounded-xl overflow-hidden border border-[var(--border-main)] bg-[var(--bg-card-alt)]">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="w-full flex items-center justify-between px-3 py-3 hover:bg-[var(--bg-hover)] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black uppercase
                ${isGuest ? "bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-main)]" : "bg-[var(--primary)] text-black shadow-lg shadow-yellow-500/20"}`}>
                {isGuest ? <FiUser size={14} /> : customerName.slice(0, 2)}
              </div>
              <div className="flex flex-col items-start text-start">
                <span className={`text-xs font-bold leading-tight ${isGuest ? "text-[var(--text-muted)]" : "text-[var(--text-main)]"}`}>
                  {isGuest ? "Walk-in / Guest" : customerName}
                </span>
                {!isGuest && <span className="text-[10px] text-[var(--text-dim)] mt-0.5">{customerPhone}</span>}
                {isGuest && <span className="text-[10px] text-[var(--primary)] mt-0.5 font-bold">+ Add customer</span>}
              </div>
            </div>
            <div className="text-[var(--text-muted)] group-hover:text-[var(--primary)]">
              {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
          </button>

          {expanded && (
            <div className="px-3 pb-3 border-t border-[var(--border-main)] pt-3 space-y-3 bg-[var(--bg-card)]">
              <div className="relative group/input">
                <FiUser className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within/input:text-[var(--primary)] text-xs" />
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 text-[var(--text-main)] text-xs rounded-lg ps-8 pe-3 py-2.5 outline-none font-bold"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-[100] w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-2xl overflow-hidden">
                    {suggestions.map((c, i) => (
                      <button key={i} onClick={() => selectCustomer(c)} className="w-full text-left px-3 py-2 hover:bg-[var(--primary)]/10 border-b border-[var(--border-main)] last:border-0">
                        <span className="block text-xs font-black">{c.name}</span>
                        <span className="block text-[9px] text-[var(--text-dim)]">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group/input">
                <FiPhone className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within/input:text-[var(--primary)] text-xs" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 text-[var(--text-main)] text-xs rounded-lg ps-8 pe-3 py-2.5 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {name.trim() && phone.trim().length >= 7 && !allCustomers.find(c => c.phone === phone) && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await addCustomer({ name: name.trim(), phone: phone.trim() });
                        const newCust = res.data.data;
                        setCustomer({ id: newCust.id, name: newCust.name, phone: newCust.phone, guests: 1 });
                        setExpanded(false);
                      } catch (err: any) {
                        setError(err.response?.data?.message || "Failed to add customer");
                      }
                    }}
                    className="w-full bg-[var(--primary)] text-black text-[10px] font-black py-2.5 rounded-lg uppercase"
                  >
                    Quick Add & Apply
                  </button>
                )}
                {!isGuest && (
                  <button onClick={handleResetToGuest} className="w-full bg-red-500/10 text-red-500 text-[10px] font-black py-2.5 rounded-lg uppercase">
                    Reset to Guest
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cart Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <h1 className="text-lg text-[var(--text-main)] font-bold tracking-tight">{t('pos.cart.title')}</h1>
          <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider w-fit mt-1">
            {getItemCount()} {t('common.items')}
          </span>
        </div>
        <button
          onClick={() => { clearCart(); setGuestCustomer(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase active:scale-95"
        >
          <RiDeleteBin2Fill size={12} /> Reset
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto pe-1 scrollbar-hide space-y-2" ref={scrolLRef} style={{ maxHeight: '480px' }}>
        {items.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[380px] opacity-60">
            <RiShoppingCartLine size={32} className="text-[var(--text-muted)] mb-3" />
            <p className="text-[var(--text-muted)] text-sm font-medium">{t('pos.cart.empty')}</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--primary)]/40 rounded-xl p-3 transition-all duration-200">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1">
                <h3 className="text-[var(--text-main)] font-bold text-sm leading-snug">{item.name}</h3>
                {/* MODIFIER DISPLAY */}
                {item.modifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.modifiers.map((m, idx) => (
                      <span key={idx} className="text-[9px] bg-[var(--bg-card-alt)] text-[var(--primary)] px-1.5 py-0.5 rounded-md border border-[var(--primary)]/20 font-bold uppercase">
                        + {m.name}
                      </span>
                    ))}
                  </div>
                )}
                {item.notes && <p className="text-[var(--text-dim)] text-[10px] mt-1 italic italic italic italic italic italic italic italic italic italic italic">"{item.notes}"</p>}
              </div>
              <p className="text-[var(--primary)] text-base font-black">₹{item.basePrice}</p>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-main)]/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[var(--bg-hover)] rounded-lg border border-[var(--border-main)] overflow-hidden">
                  <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors">
                    <RiSubtractFill size={14} />
                  </button>
                  <span className="text-[var(--text-main)] text-xs font-black min-w-[24px] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-[var(--text-muted)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors">
                    <RiAddFill size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => removeItem(item.id)} className="p-2 bg-[var(--bg-hover)] hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                  <RiDeleteBin2Fill size={14} />
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
