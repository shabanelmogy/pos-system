import React from 'react';
import { useTranslation } from 'react-i18next';

interface MiniCardProps {
  title: string;
  icon: React.ReactNode;
  number: string | number;
  footerNum: string | number;
}

const MiniCard: React.FC<MiniCardProps> = ({ title, icon, number, footerNum }) => {
  const { t } = useTranslation();
  const isEarnings = title === t('pos.home.total_earnings');

  return (
    <div className='bg-[var(--bg-card)] py-3 px-4 rounded-lg w-full sm:w-[50%]'>
      <div className='flex items-start justify-between'>
        <h1 className='text-[var(--text-main)] text-base font-semibold tracking-wide'>{title}</h1>
        <button className={`${isEarnings ? "bg-[var(--status-success)]" : "bg-[var(--primary)]"} p-2 rounded-lg text-[var(--bg-card)] text-xl shadow-lg`}>
          {icon}
        </button>
      </div>
      <div>
        <h1 className='text-[var(--text-main)] text-2xl font-bold mt-3'>
          {isEarnings ? `₹${number}` : number}
        </h1>
        <h1 className='text-[var(--text-main)] text-xs mt-1'>
          <span className='text-[var(--status-success)]'>{footerNum}%</span> {t('pos.home.than_yesterday')}
        </h1>
      </div>
    </div>
  );
};

export default MiniCard;
