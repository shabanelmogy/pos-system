import React from "react";
import butterChicken from '../../assets/images/butter-chicken-4.jpg';
import palakPaneer from '../../assets/images/Saag-Paneer-1.jpg';
import biryani from '../../assets/images/hyderabadibiryani.jpg';
import masalaDosa from '../../assets/images/masala-dosa.jpg';
import choleBhature from '../../assets/images/chole-bhature.jpg';
import rajmaChawal from '../../assets/images/rajma-chawal-1.jpg';
import paneerTikka from '../../assets/images/paneer-tika.webp';
import gulabJamun from '../../assets/images/gulab-jamun.webp';
import pooriSabji from '../../assets/images/poori-sabji.webp';
import roganJosh from '../../assets/images/rogan-josh.jpg';

const popularDishes = [
    { id: 1, image: butterChicken, name: 'Butter Chicken', numberOfOrders: 250 },
    { id: 2, image: palakPaneer, name: 'Palak Paneer', numberOfOrders: 190 },
    { id: 3, image: biryani, name: 'Hyderabadi Biryani', numberOfOrders: 300 },
    { id: 4, image: masalaDosa, name: 'Masala Dosa', numberOfOrders: 220 },
    { id: 5, image: choleBhature, name: 'Chole Bhature', numberOfOrders: 270 },
    { id: 6, image: rajmaChawal, name: 'Rajma Chawal', numberOfOrders: 180 },
    { id: 7, image: paneerTikka, name: 'Paneer Tikka', numberOfOrders: 210 },
    { id: 8, image: gulabJamun, name: 'Gulab Jamun', numberOfOrders: 310 },
    { id: 9, image: pooriSabji, name: 'Poori Sabji', numberOfOrders: 140 },
    { id: 10, image: roganJosh, name: 'Rogan Josh', numberOfOrders: 160 },
];

const PopularDishes = () => {
  return (
    <div className="mt-4 px-6 lg:px-0 lg:pr-6">
      <div className="bg-[#1a1a1a] w-full rounded-lg">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-[#f5f5f5] text-base font-semibold tracking-wide">
            Popular Dishes
          </h1>
          <a href="" className="text-[#025cca] text-xs font-semibold">
            View all
          </a>
        </div>

        <div className="overflow-y-auto min-h-[300px] lg:h-[480px] scrollbar-hide">
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              className="flex items-center gap-3 bg-[#1f1f1f] rounded-xl px-4 py-2.5 mt-3 mx-4 border border-transparent hover:border-[#333] transition-all"
            >
              <h1 className="text-[#f6b100] font-black text-lg mr-2">{dish.id < 10 ? `0${dish.id}` : dish.id}</h1>
              <img
                src={dish.image}
                alt={dish.name}
                className="w-[40px] h-[40px] rounded-full object-cover border-2 border-[#333]"
              />
              <div>
                <h1 className="text-[#f5f5f5] font-semibold tracking-wide">{dish.name}</h1>
                <p className="text-[#ababab] text-xs font-medium mt-1">
                  Orders: <span className="text-[#f6b100] font-bold">{dish.numberOfOrders}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
