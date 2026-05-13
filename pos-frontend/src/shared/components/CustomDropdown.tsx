import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdKeyboardArrowDown } from "react-icons/md";

interface Option {
  id: string;
  name: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option", 
  icon 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options?.find((opt) => opt.id === value) || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        className="flex items-center gap-3 bg-[var(--bg-card-alt)] border border-[var(--border-main)] hover:border-[var(--primary)] transition-all px-5 py-3 rounded-xl text-[var(--text-main)] min-w-[200px] justify-between group"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-[var(--primary)] group-hover:scale-110 transition-transform">{icon}</div>}
          <span className="text-sm font-bold tracking-tight uppercase">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
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
            className="absolute top-full left-0 right-0 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl z-[300] py-2 overflow-hidden backdrop-blur-xl bg-opacity-90"
          >
            {options?.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-between group ${
                  value === option.id 
                    ? "bg-[var(--primary)] text-[var(--bg-card)]" 
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-alt)]"
                }`}
              >
                {option.name}
                {value === option.id && (
                  <motion.div layoutId="active-dot" className="w-1.5 h-1.5 bg-[var(--bg-card)] rounded-full" />
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
