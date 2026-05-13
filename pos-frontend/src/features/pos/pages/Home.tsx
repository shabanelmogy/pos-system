import React, { useEffect } from "react";
import BottomNav from "../../../shared/components/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";

const Home: React.FC = () => {

  useEffect(() => {
    document.title = "POS | Home"
  }, [])

  return (
    <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-2 2xl:gap-6 px-4 md:px-6 lg:px-4 2xl:px-8">
        {/* Left Div */}
        <div className="flex-[3] flex flex-col min-h-fit">
          <Greetings />
          <div className="flex flex-col md:flex-row items-center w-full gap-3 mt-4">
            <MiniCard title="Total Earnings" icon={<BsCashCoin />} number={512} footerNum={1.6} />
            <MiniCard title="In Progress" icon={<GrInProgress />} number={16} footerNum={3.6} />
          </div>
          <div className="mt-4">
            <RecentOrders />
          </div>
        </div>
        {/* Right Div */}
        <div className="flex-[2] pb-6 lg:pb-0">
          <PopularDishes />
        </div>
      </div>

      {/* Spacer to ensure scrolling past the fixed nav */}
      <div className="h-24 md:h-32 w-full shrink-0" />
      
      <BottomNav />
    </section>

  );
};

export default Home;
