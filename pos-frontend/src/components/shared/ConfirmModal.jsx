import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  const colors = {
    danger: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
    warning: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20",
    info: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#262626] border border-[#444] p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
            <FaExclamationTriangle size={30} />
          </div>

          <h2 className="text-white text-xl font-black uppercase tracking-tighter mb-2">{title}</h2>
          <p className="text-[#ababab] text-sm leading-relaxed mb-8">{message}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-xl text-[#1a1a1a] font-black uppercase tracking-widest text-sm shadow-lg transition-all active:scale-95 ${colors[type]}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl text-[#ababab] font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
            >
              {cancelText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
