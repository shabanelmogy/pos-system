import React, { useEffect } from "react";
import BottomNav from "@/shared/components/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  return (
    <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-2 2xl:gap-6 px-4 md:px-6 lg:px-4 2xl:px-8">
        {/* Left Div */}
        <div className="flex-[3] flex flex-col min-h-fit">
          <Greetings />
          <div className="mt-4">
            <RecentOrders />
          </div>
        </div>
        {/* Right Div */}
        <div className="flex-[2] pb-6 lg:pb-0">
          <PopularDishes />
        </div>
      </div>

      <div className="h-24 md:h-32 w-full shrink-0" />
      <BottomNav />
    </section>
  );
};

export default Home;
