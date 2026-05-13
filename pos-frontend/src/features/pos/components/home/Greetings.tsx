import React, { useState, useEffect } from "react";
import useUserStore from "../../../auth/store/useUserStore";
import useAuth from "../../../auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { BiSolidDish } from "react-icons/bi";

const Greetings: React.FC = () => {
  const { t } = useTranslation();
  const { canCompleteOrders } = useAuth();
  const userData = useUserStore();
  const [dateTime, setDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date): string => {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  };

  const formatTime = (date: Date): string =>
    `${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}:${String(date.getSeconds()).padStart(2,"0")}`;

  const handleStartOrder = () => {
    window.dispatchEvent(new CustomEvent("open-create-order-modal"));
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 sm:gap-0 lg:px-0">
      <div>
        <h1 className="text-[var(--text-main)] text-xl font-semibold tracking-wide">
          {t('pos.home.greeting')}, {userData.name || "USER"}
        </h1>
        <p className="text-[var(--text-muted)] text-xs">{t('pos.home.greeting_sub')}</p>
        {canCompleteOrders && (
          <button
            onClick={handleStartOrder}
            className="mt-3 bg-[var(--primary)] text-[var(--bg-card)] font-bold py-1.5 px-5 rounded-xl hover:bg-yellow-600 transition-colors shadow-lg flex items-center gap-2 text-sm hover:scale-105"
          >
            <span className="text-lg">  <BiSolidDish size={26} /></span> {t('pos.home.start_order')}
          </button>
        )}
      </div>
      <div className="text-start sm:text-end w-full sm:w-auto border-t sm:border-t-0 border-[var(--border-main)] pt-3 sm:pt-0">
        <h1 className="text-[var(--text-main)] text-2xl font-bold tracking-wide">{formatTime(dateTime)}</h1>
        <p className="text-[var(--text-muted)] text-xs">{formatDate(dateTime)}</p>
      </div>
    </div>
  );
};

export default Greetings;
