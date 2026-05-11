import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";

const Home = () => {

  useEffect(() => {
    document.title = "POS | Home"
  }, [])

  return (
    <section className="bg-[var(--bg-main)] min-h-screen overflow-y-auto custom-scrollbar">
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Left Div */}
        <div className="flex-[3] flex flex-col min-h-fit">
          <Greetings />
          <div className="flex flex-col md:flex-row items-center w-full gap-2 px-6 mt-4">
            <MiniCard title="Total Earnings" icon={<BsCashCoin />} number={512} footerNum={1.6} />
            <MiniCard title="In Progress" icon={<GrInProgress />} number={16} footerNum={3.6} />
          </div>
          <div className="mt-4">
            <RecentOrders />
          </div>
        </div>
        {/* Right Div */}
        <div className="flex-[2] pb-4 lg:pb-0">
          <PopularDishes />
        </div>
      </div>

      {/* Large Spacer to ensure flow stops before bottom nav */}
      <div className="h-40 w-full" />
      
      <BottomNav />
    </section>

  );
};

export default Home;
