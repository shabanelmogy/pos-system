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
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row gap-2 custom-scrollbar">
      {/* Left Div */}
      <div className="flex-[3] flex flex-col min-h-fit">
        <Greetings />
        <div className="flex flex-col md:flex-row items-center w-full gap-2 px-6 mt-4">
          <MiniCard title="Total Earnings" icon={<BsCashCoin />} number={512} footerNum={1.6} />
          <MiniCard title="In Progress" icon={<GrInProgress />} number={16} footerNum={3.6} />
        </div>
        <RecentOrders />
      </div>
      {/* Right Div */}
      <div className="flex-[2] pb-24 lg:pb-0">
        <PopularDishes />
      </div>
      <BottomNav />
    </section>
  );
};

export default Home;
