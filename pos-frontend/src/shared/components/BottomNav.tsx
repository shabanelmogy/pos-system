import React, { useState, useEffect } from "react";
import { FaHome, FaUsers, FaChartBar } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import useCustomerStore from "../../features/customers/store/useCustomerStore";
import useCartStore from "../../features/pos/store/useCartStore";
import usePOSStore from "../../features/pos/store/usePOSStore";
import useAuth from "../../features/auth/hooks/useAuth";
import { useTranslation } from "react-i18next";

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPOSPoint } = usePOSStore();
  const { setCustomer } = useCustomerStore();
  const { removeAllItems } = useCartStore();
  const enableTables = selectedPOSPoint?.settings?.enableTables !== false;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { canCompleteOrders, isAdmin } = useAuth();
  const requireCustomer = selectedPOSPoint?.settings?.requireCustomerOnOrder;

  const handleDishClick = () => {
    if (requireCustomer === false) {
      // Bypass modal and start order immediately
      setCustomer({
        name: t('common.guest'),
        phone: "N/A",
        guests: 1
      });
      removeAllItems();

      if (!enableTables) {
        navigate("/menu");
      } else {
        navigate("/tables");
      }
    } else {
      openModal();
    }
  };

  useEffect(() => {
    const handleOpenModal = () => handleDishClick();
    window.addEventListener("open-create-order-modal", handleOpenModal);
    return () => window.removeEventListener("open-create-order-modal", handleOpenModal);
  }, [requireCustomer, enableTables]);

  const increment = () => {
    if (guestCount >= 6) return;
    setGuestCount((prev) => prev + 1);
  }
  const decrement = () => {
    if (guestCount <= 0) return;
    setGuestCount((prev) => prev - 1);
  }

  const isActive = (path: string) => location.pathname === path;

  const handleCreateOrder = () => {
    if (requireCustomer !== false) {
      if (!name || !phone) {
        alert(t('common.modal.validation_error'));
        return;
      }
      if (guestCount <= 0) {
        alert(t('common.modal.guest_error'));
        return;
      }
    }

    setCustomer({
      name: name || t('common.guest'),
      phone: phone || "N/A",
      guests: guestCount || 1
    });
    removeAllItems();

    // Clear local state
    setName("");
    setPhone("");
    setGuestCount(0);

    closeModal();
    if (!enableTables) {
      navigate("/menu");
    } else {
      navigate("/tables");
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-[var(--bg-card)] border-t border-[var(--border-main)] px-4 py-2 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <button
        onClick={() => navigate("/")}
        className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          } w-full`}
      >
        <FaHome size={20} />
        <span className="text-[10px] mt-1">{t('common.nav.home')}</span>
      </button>

      <button
        onClick={() => navigate("/orders")}
        className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/orders") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          } w-full`}
      >
        <MdOutlineReorder size={20} />
        <span className="text-[10px] mt-1">{t('common.nav.orders')}</span>
      </button>

      {enableTables && (
        <button
          onClick={() => navigate("/tables")}
          className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/tables") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            } w-full`}
        >
          <MdTableBar size={20} />
          <span className="text-[10px] mt-1">{t('common.nav.tables')}</span>
        </button>
      )}

      {isAdmin && (
        <>
          <button
            onClick={() => navigate("/customers")}
            className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/customers") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              } w-full`}
          >
            <FaUsers size={20} />
            <span className="text-[10px] mt-1">{t('common.nav.customers')}</span>
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/dashboard") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              } w-full`}
          >
            <FaChartBar size={20} />
            <span className="text-[10px] mt-1">{t('common.nav.admin')}</span>
          </button>
        </>
      )}


      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div>
          <label className="block text-[var(--text-muted)] mb-2 text-sm font-medium">
            {t('common.modal.customer_name')} {requireCustomer === false && <span className="text-[var(--text-dim)] text-xs ms-1">({t('common.modal.optional')})</span>}
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[var(--bg-main)]">
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder={t('common.modal.enter_name')} className="bg-transparent flex-1 text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-dim)]" />
          </div>
        </div>
        <div>
          <label className="block text-[var(--text-muted)] mb-2 mt-3 text-sm font-medium">
            {t('common.modal.customer_phone')} {requireCustomer === false && <span className="text-[var(--text-dim)] text-xs ms-1">({t('common.modal.optional')})</span>}
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[var(--bg-main)]">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" placeholder="+91-9999999999" className="bg-transparent flex-1 text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-dim)]" />
          </div>
        </div>
        <div>
          <label className="block mb-2 mt-3 text-sm font-medium text-[var(--text-muted)]">{t('common.modal.guest_count')}</label>
          <div className="flex items-center justify-between bg-[var(--bg-main)] px-4 py-3 rounded-lg">
            <button onClick={decrement} className="text-yellow-500 text-2xl font-bold px-2">&minus;</button>
            <span className="text-[var(--text-main)] font-bold">{guestCount} {guestCount === 1 ? t('common.modal.person') : t('common.modal.people')}</span>
            <button onClick={increment} className="text-yellow-500 text-2xl font-bold px-2">&#43;</button>
          </div>
        </div>
        <button onClick={handleCreateOrder} className="w-full bg-[var(--primary)] text-[var(--bg-card)] font-black rounded-xl py-4 mt-8 hover:bg-yellow-600 transition-all uppercase tracking-widest shadow-lg shadow-yellow-500/20">
          {t('common.modal.start_order')}
        </button>
      </Modal>
    </div>
  );
};

export default BottomNav;
