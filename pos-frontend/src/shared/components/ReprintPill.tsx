import React from 'react';
import { FaPrint } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-[var(--primary)] transition-all hover:border-[var(--primary)]/50"
    >
      <FaPrint size={10} />
      <span>{t('orders.reprint')}</span>
    </motion.button>
  );
};

export default ReprintPill;
