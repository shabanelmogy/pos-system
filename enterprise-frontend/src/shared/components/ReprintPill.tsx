import React from 'react';
import { FaPrint } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../node_modules/react-i18next';

interface ReprintPillProps {
  onClick: () => void;
}

const ReprintPill: React.FC<ReprintPillProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(246, 177, 0, 0.2)' }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-[var(--primary)] transition-all hover:border-[var(--primary)]/50"
    >
      <FaPrint className="size-2.5" />
      <span>{t('orders.reprint')}</span>
    </motion.button>
  );
};

export default ReprintPill;
