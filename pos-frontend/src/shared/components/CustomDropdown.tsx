import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdKeyboardArrowDown } from "react-icons/md";

interface Option {
  id: string;
  name: any;
}

interface CustomDropdownProps {
  options: Option[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option", 
  icon,
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options?.find((opt) => opt.id === value) || null;

  const getOptName = (opt: any): string => {
    if (!opt) return "";
    const name = opt.name;
    if (!name) return "";
    if (typeof name === "string") return name;
    if (typeof name === "object") {
      return name.en || name.ar || Object.values(name)[0] || "";
    }
    return String(name);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search query when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredOptions = (options || []).filter((opt) =>
    getOptName(opt).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${isOpen ? "z-[9999]" : "z-0"}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] hover:border-[var(--primary)] transition-all px-5 py-3 rounded-xl flex items-center justify-between text-[var(--text-main)] font-bold shadow-sm"
      >
        <span className="flex items-center gap-3">
          {icon && <span className="text-[var(--primary)] text-lg">{icon}</span>}
          {selectedOption ? (
            <span className="truncate">{getOptName(selectedOption)}</span>
          ) : (
            <span className="text-[var(--text-dim)] truncate">{placeholder}</span>
          )}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-[var(--text-dim)]">
          <MdKeyboardArrowDown size={24} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-1 left-0 right-0 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl z-[9999] overflow-hidden backdrop-blur-xl bg-opacity-90"
          >
            {searchable && (
              <div className="p-3 border-b border-[var(--border-main)]/50 sticky top-0 bg-[var(--bg-card)] z-10">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-xl px-4 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold placeholder:text-[var(--text-dim)] shadow-inner"
                  autoFocus
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
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
                    {getOptName(option)}
                    {value === option.id && (
                      <motion.div layoutId="active-dot" className="w-1.5 h-1.5 bg-[var(--bg-card)] rounded-full" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-5 py-4 text-xs text-[var(--text-dim)] font-bold uppercase tracking-wider text-center">
                  No results found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
