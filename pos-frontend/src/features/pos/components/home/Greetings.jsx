import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useAuth from "../../../auth/hooks/useAuth";

const Greetings = () => {
  const { canCompleteOrders } = useAuth();
  const userData = useSelector(state => state.user);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  const handleStartOrder = () => {
    // Dispatch a custom event that BottomNav will listen to
    window.dispatchEvent(new CustomEvent("open-create-order-modal"));
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 sm:gap-0 lg:px-0">
      <div>
        <h1 className="text-[var(--text-main)] text-xl font-semibold tracking-wide">
          Good Morning, {userData.name || "TEST USER"}
        </h1>
        <p className="text-[var(--text-muted)] text-xs">
          Give your best services for customers 😀
        </p>
        {canCompleteOrders && (
          <button
            onClick={handleStartOrder}
            className="mt-3 bg-[var(--primary)] text-[var(--bg-card)] font-bold py-1.5 px-5 rounded-lg hover:bg-yellow-600 transition-colors shadow-lg flex items-center gap-2 text-sm"
          >
            <span className="text-lg">+</span> Start New Order
          </button>
        )}
      </div>
      <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-[var(--border-main)] pt-3 sm:pt-0">
        <h1 className="text-[var(--text-main)] text-2xl font-bold tracking-wide">{formatTime(dateTime)}</h1>
        <p className="text-[var(--text-muted)] text-xs">{formatDate(dateTime)}</p>
      </div>
    </div>
  );
};

export default Greetings;
