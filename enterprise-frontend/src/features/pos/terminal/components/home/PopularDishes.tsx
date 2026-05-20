import React from "react";
import butterChicken from '@/assets/images/butter-chicken-4.jpg';
import palakPaneer from '@/assets/images/Saag-Paneer-1.jpg';
import biryani from '@/assets/images/hyderabadibiryani.jpg';
import masalaDosa from '@/assets/images/masala-dosa.jpg';
import choleBhature from '@/assets/images/chole-bhature.jpg';
import rajmaChawal from '@/assets/images/rajma-chawal-1.jpg';
import paneerTikka from '@/assets/images/paneer-tika.webp';
import gulabJamun from '@/assets/images/gulab-jamun.webp';
import pooriSabji from '@/assets/images/poori-sabji.webp';
import roganJosh from '@/assets/images/rogan-josh.jpg';
import { useTranslation } from "../../../../../../node_modules/react-i18next";

interface Dish {
  id: number;
  image: string;
  name: string;
  key: string;
  numberOfOrders: number;
}

const PopularDishes: React.FC = () => {
  const { t } = useTranslation();

  const popularDishes: Dish[] = [
    { id: 1, image: butterChicken, name: 'Butter Chicken', key: 'butter_chicken', numberOfOrders: 250 },
    { id: 2, image: palakPaneer, name: 'Palak Paneer', key: 'palak_paneer', numberOfOrders: 190 },
    { id: 3, image: biryani, name: 'Hyderabadi Biryani', key: 'biryani', numberOfOrders: 300 },
    { id: 4, image: masalaDosa, name: 'Masala Dosa', key: 'masala_dosa', numberOfOrders: 220 },
    { id: 5, image: choleBhature, name: 'Chole Bhature', key: 'chole_bhature', numberOfOrders: 270 },
    { id: 6, image: rajmaChawal, name: 'Rajma Chawal', key: 'rajma_chawal', numberOfOrders: 180 },
    { id: 7, image: paneerTikka, name: 'Paneer Tikka', key: 'paneer_tikka', numberOfOrders: 210 },
    { id: 8, image: gulabJamun, name: 'Gulab Jamun', key: 'gulab_jamun', numberOfOrders: 310 },
    { id: 9, image: pooriSabji, name: 'Poori Sabji', key: 'poori_sabji', numberOfOrders: 140 },
    { id: 10, image: roganJosh, name: 'Rogan Josh', key: 'rogan_josh', numberOfOrders: 160 },
  ];

  return (
    <div className="mt-4">
      <div className="bg-[var(--bg-card)] w-full rounded-2xl border border-[var(--border-main)] shadow-xl overflow-hidden min-h-[480px] lg:h-[625px] 2xl:h-[755px]">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-[var(--text-main)] text-base font-semibold tracking-wide">
            {t('pos.home.popular_dishes')}
          </h1>
          <a href="" className="text-[var(--primary)] text-xs font-semibold">
            {t('pos.home.view_all')}
          </a>
        </div>

        <div className="overflow-y-auto min-h-[350px] lg:h-[550px] 2xl:h-[720px] scrollbar-hide">
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              className="flex items-center gap-3 bg-[var(--bg-main)] rounded-xl px-4 py-2.5 mt-3 mx-4 border border-transparent hover:border-[var(--border-main)] transition-all"
            >
              <h1 className="text-[var(--primary)] font-black text-lg me-2">{dish.id < 10 ? `0${dish.id}` : dish.id}</h1>
              <img
                src={dish.image}
                alt={t(`pos.home.dishes.${dish.key}`)}
                className="w-[40px] h-[40px] rounded-full object-cover border-2 border-[var(--border-main)]"
              />
              <div>
                <h1 className="text-[var(--text-main)] font-semibold tracking-wide">{t(`pos.home.dishes.${dish.key}`)}</h1>
                <p className="text-[var(--text-muted)] text-xs font-medium mt-1">
                  {t('pos.home.orders_count')}: <span className="text-[var(--primary)] font-bold">{dish.numberOfOrders}</span>
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
