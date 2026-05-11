import React, { useState, useEffect } from "react";
import { FaHome, FaUsers, FaChartBar } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";
import { removeAllItems } from "../../redux/slices/cartSlice";
import useAuth from "../../hooks/useAuth";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedPOSPoint } = useSelector((state) => state.pos);
  const enableTables = selectedPOSPoint?.settings?.enableTables !== false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const handleOpenModal = () => openModal();
    window.addEventListener("open-create-order-modal", handleOpenModal);
    return () => window.removeEventListener("open-create-order-modal", handleOpenModal);
  }, []);

  const increment = () => {
    if (guestCount >= 6) return;
    setGuestCount((prev) => prev + 1);
  }
  const decrement = () => {
    if (guestCount <= 0) return;
    setGuestCount((prev) => prev - 1);
  }

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = () => {
    const requireCustomer = selectedPOSPoint?.settings?.requireCustomerOnOrder;

    if (requireCustomer) {
      if (!name || !phone) {
        alert("Please enter customer name and phone number!");
        return;
      }
      if (guestCount <= 0) {
        alert("Please select at least 1 guest!");
        return;
      }
    }

    // send the data to store
    dispatch(setCustomer({
      name: name || "Guest",
      phone: phone || "N/A",
      guests: guestCount || 1
    }));
    dispatch(removeAllItems());

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

  const { canCompleteOrders, isAdmin } = useAuth();
  const requireCustomer = selectedPOSPoint?.settings?.requireCustomerOnOrder;

  const handleDishClick = () => {
    if (!requireCustomer) {
      // Bypass modal and start order immediately
      dispatch(setCustomer({
        name: "Guest",
        phone: "N/A",
        guests: 1
      }));
      dispatch(removeAllItems());

      if (!enableTables) {
        navigate("/menu");
      } else {
        navigate("/tables");
      }
    } else {
      openModal();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-main)] px-4 py-2 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <button
        onClick={() => navigate("/")}
        className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          } w-full`}
      >
        <FaHome size={20} />
        <span className="text-[10px] mt-1">Home</span>
      </button>

      <button
        onClick={() => navigate("/orders")}
        className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/orders") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          } w-full`}
      >
        <MdOutlineReorder size={20} />
        <span className="text-[10px] mt-1">Orders</span>
      </button>

      {canCompleteOrders && (
        <div className="flex items-center justify-center w-full">
          <button
            disabled={isActive("/tables") || isActive("/menu")}
            onClick={handleDishClick}
            className="flex flex-col items-center justify-center font-bold transition-all text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-1.5 rounded-2xl border border-[var(--primary)]/20 shadow-lg shadow-[var(--primary)]/5 disabled:opacity-50 disabled:grayscale"
          >
            <BiSolidDish size={26} />
            <span className="text-[10px] mt-0.5">Order</span>
          </button>
        </div>
      )}

      {enableTables && (
        <button
          onClick={() => navigate("/tables")}
          className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/tables") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            } w-full`}
        >
          <MdTableBar size={20} />
          <span className="text-[10px] mt-1">Tables</span>
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
            <span className="text-[10px] mt-1">Customers</span>
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center justify-center font-bold transition-all ${isActive("/dashboard") ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              } w-full`}
          >
            <FaChartBar size={20} />
            <span className="text-[10px] mt-1">Admin</span>
          </button>
        </>
      )}


      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div>
          <label className="block text-[var(--text-muted)] mb-2 text-sm font-medium">
            Customer Name {!requireCustomer && <span className="text-[var(--text-dim)] text-xs ml-1">(Optional)</span>}
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[var(--bg-main)]">
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" name="" placeholder="Enter customer name" id="" className="bg-transparent flex-1 text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-dim)]" />
          </div>
        </div>
        <div>
          <label className="block text-[var(--text-muted)] mb-2 mt-3 text-sm font-medium">
            Customer Phone {!requireCustomer && <span className="text-[var(--text-dim)] text-xs ml-1">(Optional)</span>}
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[var(--bg-main)]">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" name="" placeholder="+91-9999999999" id="" className="bg-transparent flex-1 text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-dim)]" />
          </div>
        </div>
        <div>
          <label className="block mb-2 mt-3 text-sm font-medium text-[var(--text-muted)]">Guest Count</label>
          <div className="flex items-center justify-between bg-[var(--bg-main)] px-4 py-3 rounded-lg">
            <button onClick={decrement} className="text-yellow-500 text-2xl font-bold px-2">&minus;</button>
            <span className="text-[var(--text-main)] font-bold">{guestCount} {guestCount === 1 ? 'Person' : 'People'}</span>
            <button onClick={increment} className="text-yellow-500 text-2xl font-bold px-2">&#43;</button>
          </div>
        </div>
        <button onClick={handleCreateOrder} className="w-full bg-[var(--primary)] text-[var(--bg-card)] font-black rounded-xl py-4 mt-8 hover:bg-yellow-600 transition-all uppercase tracking-widest shadow-lg shadow-yellow-500/20">
          Start Placing Order
        </button>
      </Modal>
    </div>
  );
};

export default BottomNav;
