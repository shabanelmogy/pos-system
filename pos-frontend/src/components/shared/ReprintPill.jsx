import React from 'react';
import { FaPrint } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ReprintPill = ({ onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(246, 177, 0, 0.2)' }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#f6b100] transition-all hover:border-[#f6b100]/50"
    >
      <FaPrint size={10} />
      <span>Reprint</span>
    </motion.button>
  );
};

export default ReprintPill;
