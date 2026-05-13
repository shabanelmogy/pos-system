import React, { useEffect } from "react";
import BottomNav from "../../../shared/components/BottomNav";
import BackButton from "../../../shared/components/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import useCustomerStore from "../../customers/store/useCustomerStore";
import usePOSStore from "../store/usePOSStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Menu: React.FC = () => {
  const { t } = useTranslation();
  const customerData = useCustomerStore();
  const { selectedPOSPoint } = usePOSStore();
  const navigate = useNavigate();

  const requireCustomer = selectedPOSPoint?.settings?.requireCustomerOnOrder;
  const isGuest = !customerData.customerName || customerData.customerName === "Guest";

  useEffect(() => {
    document.title = "POS | Menu";
    if (!customerData.customerName && !customerData.table) {
      navigate("/");
    }
  }, [customerData, navigate]);

  return (
    <>
      <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] pb-32 lg:pb-12 lg:h-[calc(100vh-5rem)] overflow-hidden flex flex-col lg:flex-row gap-3">

        {/* ── Left: Menu ── */}
        <div className="flex-[3] flex flex-col min-h-0 overflow-hidden">

          {/* Fixed header */}
          <div className="flex-none flex items-center justify-between px-10 py-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-[var(--text-main)] text-2xl font-bold tracking-wider">
                {t('pos.menu_title')}
              </h1>
            </div>

            {requireCustomer && !isGuest && (
              <div className="flex items-center gap-3 cursor-pointer">
                <MdRestaurantMenu className="text-[var(--text-main)] text-4xl" />
                <div className="flex flex-col items-start">
                  <h1 className="text-md text-[var(--text-main)] font-semibold tracking-wide">
                    {customerData.customerName}
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-medium">
                    {t('pos.cart.title')}: {customerData.table?.tableNo || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable menu content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <MenuContainer />
          </div>
        </div>

        {/* ── Right: Cart ── */}
        <div className="flex-[2.5] lg:flex-[1.2] flex flex-col min-h-0 bg-[var(--bg-card)] lg:my-4 lg:me-3 rounded-lg overflow-hidden pb-2 lg:pb-0 border border-[var(--border-main)]">

          {requireCustomer && !isGuest && (
            <div className="flex-none">
              <CustomerInfo />
              <hr className="border-[var(--border-main)]" />
            </div>
          )}

          {/* Scrollable cart items */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pe-2">
            <CartInfo />
          </div>

          {/* Fixed bill at bottom */}
          <div className="flex-none border-t border-[var(--border-main)] bg-[var(--bg-card)]">
            <Bill />
          </div>
        </div>
      </section>

      <BottomNav />
    </>
  );
};

export default Menu;
