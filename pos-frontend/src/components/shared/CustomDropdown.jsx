import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdKeyboardArrowDown } from "react-icons/md";

const CustomDropdown = ({ options, value, onChange, placeholder = "Select option", icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-[#262626] border border-[#333] hover:border-[#f6b100] transition-all px-5 py-3 rounded-xl text-white min-w-[200px] justify-between group"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-[#f6b100] group-hover:scale-110 transition-transform">{icon}</div>}
          <span className="text-sm font-bold tracking-tight uppercase">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-[#ababab] group-hover:text-white"
        >
          <MdKeyboardArrowDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl z-[300] py-2 overflow-hidden backdrop-blur-xl bg-opacity-90"
          >
            {options.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-between group ${
                  value === option.id 
                    ? "bg-[#f6b100] text-[#1a1a1a]" 
                    : "text-[#ababab] hover:text-white hover:bg-[#262626]"
                }`}
              >
                {option.name}
                {value === option.id && (
                  <motion.div layoutId="active-dot" className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
